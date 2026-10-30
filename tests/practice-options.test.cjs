const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const questions = JSON.parse(html.match(/const INITIAL=(.*);\n/)[1]);
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, '../practice/reviewed-options.json'), 'utf8'));
function runtime(type = 'mc') {
  const typeControl = { value: type };
  const context = vm.createContext({
    $: () => typeControl,
    typeControl,
    data: questions,
    filtered: () => questions,
    mode: 'practice', order: [], progress: {}
  });
  vm.runInContext(html.match(/const shuffle=.*?;\n/)[0], context);
  vm.runInContext(html.slice(html.indexOf('// BEGIN REVIEWED PRACTICE OPTIONS'), html.indexOf('function choose(')), context);
  vm.runInContext(html.match(/function pool\(\).*?\n/)[0], context);
  return context;
}

test('every current source question has exactly two tricky and one obvious reviewed alternatives', () => {
  assert.equal(questions.length, 187);
  assert.equal(questions.filter(q => q.lecture === 8).length, 15);
  assert.equal(questions.filter(q => q.lecture === 9).length, 14);
  assert.equal(questions.filter(q => q.lecture === 10).length, 21);
  assert.equal(questions.filter(q => q.lecture > 10).length, 0);
  assert.equal(bank.length, questions.length);
  for (const q of questions) {
    const row = bank.find(r => r.question === q.q && r.answer === q.a);
    assert(row, q.q);
    assert.equal(row.tricky.length, 2, q.q);
    assert.equal(new Set([q.a, ...row.tricky, row.obvious]).size, 4, q.q);
  }
});

test('every multiple-choice round preserves the exact source answer and all three authored alternatives', () => {
  const ctx = runtime();
  const positions = new Set();
  for (const q of questions) {
    ctx.question = q;
    const row = bank.find(r => r.question === q.q && r.answer === q.a);
    for (let n = 0; n < 32; n++) {
      const round = vm.runInContext('makeRound(question)', ctx);
      assert.equal(round.type, 'mc');
      assert.equal(round.options.length, 4);
      assert.equal(round.options[round.correct], q.a);
      assert.deepEqual([...round.options].sort(), [q.a, ...row.tricky, row.obvious].sort());
      assert.equal(round.options.filter(a => a === q.a).length, 1);
      positions.add(round.correct);
    }
  }
  assert.equal(positions.size, 4);
});

test('false propositions use only reviewed tricky alternatives for that exact question', () => {
  const ctx = runtime('tf');
  const seen = new Set();
  for (const q of questions) {
    ctx.question = q;
    const row = bank.find(r => r.question === q.q && r.answer === q.a);
    for (let n = 0; n < 32; n++) {
      const round = vm.runInContext('makeRound(question)', ctx);
      assert.equal(round.type, 'tf');
      if (round.correct === 0) assert.equal(round.proposed, q.a);
      else assert(row.tricky.includes(round.proposed), q.q);
      seen.add(round.correct);
    }
  }
  assert.equal(seen.size, 2);
});

test('mixed mode uses both reviewed formats', () => {
  const ctx = runtime('mixed');
  ctx.question = questions[0];
  const seen = new Set();
  for (let n = 0; n < 100; n++) seen.add(vm.runInContext('makeRound(question).type', ctx));
  assert.deepEqual([...seen].sort(), ['mc', 'tf']);
});

test('new or changed source material waits for review; renamed source paths still match', () => {
  const ctx = runtime();
  for (const q of [
    { ...questions[0], q: 'A newly uploaded question?' },
    { ...questions[0], a: 'A revised official answer' }
  ]) {
    ctx.question = q;
    assert.equal(vm.runInContext('reviewedOptions(question)', ctx), undefined);
    assert.throws(() => vm.runInContext('makeRound(question)', ctx), /pending review/);
  }
  ctx.question = { ...questions[0], path: 'lectures/99-renamed/YSK.md' };
  assert(vm.runInContext('reviewedOptions(question)', ctx));
  ctx.data = [...questions, { ...questions[0], q: 'An unreviewed question?' }];
  ctx.filtered = () => ctx.data;
  assert.equal(vm.runInContext('pool().length', ctx), questions.length);
  assert.equal(vm.runInContext('pendingPractice()', ctx), 1);
  ctx.mode = 'cards';
  assert.equal(vm.runInContext('pool().length', ctx), questions.length + 1);
});

test('no unrelated answer-pool fallback remains', () => {
  assert(!html.includes('alternatives=shuffle(data.filter'));
  assert.equal(html.includes('options=shuffle([q.a,...reviewed.tricky,reviewed.obvious])'), true);
});
