# DSC 190 Quiz Review

Made by Yonghao Wang · UCSD ’27.

A student-built study site for DSC 190: Tools of the Trade.

## Study

Open `index.html` in a browser, or visit the GitHub Pages site after deployment.

## Question source

Question and answer text comes from the [DSC 190 course repository](https://github.com/dsc-courses/dsc190-tools-2026-fa). Site authorship does not imply authorship of the course materials. This is an independent student project, not an official course site.

Cards retain the source questions and answers. Mock Quiz choices are assembled by this tool; they are not official exam options.

## Updates

**Sync questions** fetches the current YSK files from the public GitHub API and saves them in the visitor's browser. It does not change the hosted HTML or update automatically in the background. Lecture pairs are grouped into quizzes. Unsupported formats or failed requests leave the previous question bank intact.

Progress is stored in the visitor's browser. It is not shared across browsers, devices, or classmates. Clearing browser storage removes saved progress. GitHub API rate limits may temporarily prevent syncing.

## GitHub Pages

Upload `index.html` and `.nojekyll` to the root of the chosen repository. In **Settings → Pages**, choose **Deploy from a branch**, then the branch and **/ (root)**. No build step or server is needed.

To publish an updated built-in question snapshot, update `index.html` and commit it. Visitors can independently fetch newer questions with **Sync questions**.
