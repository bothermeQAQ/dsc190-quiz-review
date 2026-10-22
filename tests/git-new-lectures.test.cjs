const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// All Git mutations in this file affect disposable fixtures, never the website repository.
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsc190-git-options-'));
  const run = (...args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  const git = (...args) => {
    const r = run(...args);
    assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
    return r.stdout.trim();
  };
  const write = text => fs.writeFileSync(path.join(dir, 'note.txt'), text);
  git('init', '-b', 'main');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  write('base\n');
  git('add', 'note.txt');
  git('commit', '-m', 'base');
  return { dir, run, git, write };
}
function conflictFixture() {
  const f = fixture();
  f.git('switch', '-c', 'alpha');
  f.write('alpha\n');
  f.git('commit', '-am', 'alpha change');
  f.git('switch', 'main');
  f.write('main\n');
  f.git('commit', '-am', 'main change');
  return f;
}

test('creating a branch does not switch; switch -c creates and switches', () => {
  const f = fixture();
  f.git('branch', 'alpha');
  assert.equal(f.git('branch', '--show-current'), 'main');
  f.git('switch', 'alpha');
  assert.equal(f.git('branch', '--show-current'), 'alpha');
  assert.notEqual(f.run('switch', '-c', 'alpha').status, 0);
  f.git('switch', '-c', 'beta');
  assert.equal(f.git('branch', '--show-current'), 'beta');
});

test('switch updates HEAD, staged content, and working-tree content', () => {
  const f = fixture();
  f.git('switch', '-c', 'alpha');
  f.write('alpha\n');
  f.git('commit', '-am', 'alpha');
  f.git('switch', 'main');
  f.git('switch', 'alpha');
  assert.equal(f.git('symbolic-ref', '--short', 'HEAD'), 'alpha');
  assert.equal(f.git('show', ':note.txt'), 'alpha');
  assert.equal(fs.readFileSync(path.join(f.dir, 'note.txt'), 'utf8'), 'alpha\n');
});

for (const strategy of ['ours', 'theirs']) {
  test(`merge -X ${strategy} selects the expected conflicting content`, () => {
    const f = conflictFixture();
    f.git('merge', '-X', strategy, 'alpha', '-m', 'merge');
    assert.equal(fs.readFileSync(path.join(f.dir, 'note.txt'), 'utf8'), strategy === 'ours' ? 'main\n' : 'alpha\n');
  });
}

test('merge --abort restores content; merge --quit leaves conflict content', () => {
  for (const flag of ['--abort', '--quit']) {
    const f = conflictFixture();
    assert.notEqual(f.run('merge', 'alpha', '-m', 'merge').status, 0);
    f.git('merge', flag);
    const content = fs.readFileSync(path.join(f.dir, 'note.txt'), 'utf8');
    if (flag === '--abort') {
      assert.equal(content, 'main\n');
      assert.equal(f.git('status', '--porcelain'), '');
    } else assert(content.includes('<<<<<<<'));
  }
});

test('squash stages without recording; feature deletion can still require -D', () => {
  const f = fixture();
  f.git('switch', '-c', 'feature');
  f.write('first\n');
  f.git('commit', '-am', 'first feature change');
  f.write('second\n');
  f.git('commit', '-am', 'second feature change');
  f.git('switch', 'main');
  const before = f.git('rev-parse', 'HEAD');
  f.git('merge', '--squash', 'feature');
  assert.equal(f.git('rev-parse', 'HEAD'), before);
  assert.equal(f.git('show', ':note.txt'), 'second');
  assert.notEqual(f.run('rev-parse', '--verify', 'MERGE_HEAD').status, 0);
  assert.notEqual(f.run('merge', '--continue').status, 0);
  f.git('commit', '-m', 'squashed feature');
  assert.notEqual(f.run('branch', '-d', 'feature').status, 0);
  f.git('branch', '-D', 'feature');
});

test('an unanchored *.pdf ignore pattern matches nested PDFs too', () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.dir, '.gitignore'), '*.pdf\n');
  assert.equal(f.git('check-ignore', 'report.pdf', 'nested/report.pdf'), 'report.pdf\nnested/report.pdf');
});
