# DSC 190 Quiz Review

Made by Yonghao Wang · UCSD ’27.

A student-built study site for DSC 190: Tools of the Trade.

## Study

Open `index.html` in a browser, or visit the GitHub Pages site after deployment.

## Question source

Question and answer text comes from the [DSC 190 course repository](https://github.com/dsc-courses/dsc190-tools-2026-fa). Site authorship does not imply authorship of the course materials. This is an independent student project, not an official course site.

Cards retain the source questions and answers. Mock Quiz choices are assembled by this tool; they are not official exam options.

## Updates

**Sync questions** lists the course repo's YSK files with one GitHub API request, then downloads them from raw.githubusercontent.com, and saves the result in the visitor's browser. It does not change the hosted HTML or update automatically in the background. A synced copy is used only while it is at least as new as the questions built into `index.html`, so publishing a newer page reaches everyone. A file that can't be read keeps its previous questions and is named in the status message; progress follows questions that are reworded or moved.

GitHub allows 60 unauthenticated API requests per hour per network, shared by everyone on the same Wi-Fi. The site asks for one per sync, waits five minutes between syncs, and says when the limit resets if it is hit.

Progress (Knew it / Review again) and the current quiz, mode, card and filters are stored in the visitor's browser and stay in step across open tabs. They are not shared across browsers, devices, or classmates. **Reset progress** clears the marks for the current quiz. Browser storage is per site origin: other pages published under the same `github.io` account can read it, so use a custom domain if that matters.

## Quizzes

Lectures are grouped two per quiz (Lecture 3–4 → Quiz 2). If the course schedule differs, add the lecture to `QUIZ_OVERRIDES` near the top of the script in `index.html`, e.g. `{7:3}`. Quiz headings come from the lecture names unless set in `QUIZ_TITLES`.

## Keyboard

Cards and Review: <kbd>Space</kbd> show or hide the answer, <kbd>←</kbd> <kbd>→</kbd> previous and next, and after the answer <kbd>1</kbd> Knew it, <kbd>2</kbd> Review again. Mock Quiz: <kbd>A</kbd>–<kbd>D</kbd> or <kbd>1</kbd>–<kbd>4</kbd> to choose, <kbd>T</kbd> / <kbd>F</kbd> for true/false, <kbd>Enter</kbd> or <kbd>→</kbd> for the next question.

Mock Quiz questions come in a new random order each attempt. A wrong answer adds the card to Review; a right answer leaves its mark unchanged, since a guess is not the same as knowing it.

## GitHub Pages

The repository deploys with the included workflow (`.github/workflows/pages.yml`), which stages only `index.html` and `.nojekyll` in `_site` and uploads that directory as the Pages artifact. README files, local notes, and workflow files are not published. In **Settings → Pages**, set **Source** to **GitHub Actions**; every push to `main` then redeploys. You can also run **Deploy to GitHub Pages** manually from the Actions tab. No application build or server is needed.

The workflow logs the SHA-256 checksum of the staged `index.html` so the live page can be compared with the exact deployed version. Local `使用说明.md` is not part of the deployment and should remain untracked.

To publish an updated built-in question snapshot, update `INITIAL` in `index.html`, set `BUILT` to that day's date (YYYY-MM-DD), and push. Browsers holding an older synced copy then switch to the new snapshot. Visitors can independently fetch newer questions with **Sync questions**.
