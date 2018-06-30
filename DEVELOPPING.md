# Welcome Developper

* Issues should be filed at
https://github.com/WengerK/vscode-highlight-bad-chars/issues
* Pull requests can be made against
https://github.com/WengerK/vscode-highlight-bad-chars/pulls

## What's in the folder

* `package.json` - this is the manifest file in which you declare the extension and command.
* `src/extension.ts` - this is the main file.

## Get up and running straight away

* press `F5` to open a new window with the extension loaded
* set breakpoints in the code inside `src/extension.ts` to debug the extension
* find output from the extension in the debug console

## Make changes

* you can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* you can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with the extension to load the changes.

## Publish

* Push every commits on the master branch of the Github & Visualstudio plateform.
* Bump the versions into the CHANGELOG.md & the VERSION.md.
* Publish on the Marketplace using the `vsce publish` command.
