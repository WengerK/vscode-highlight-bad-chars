# Documentation for maintainers

Since this is a VSCode Extension used by PHP/Javascript programmers it might be a good idea to document
some things.

Full documentation on https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## Making a release

- Write changelog
- Update version number in `package.json` & `VERSION.md`
- Commit & Push those changes and create a new tag with the version number
- Make a [new release with GitHub](https://github.com/WengerK/vscode-highlight-bad-chars/releases/new)
- Create a Publish Access Token on Azure (https://dev.azure.com/wengerk)
- Build the extension with `vsce package` 
- Login wit the previously created access Token `vsce login TOKEN` to publish
- Publish the extension `vsce publish`

It makes take some minutes for the extension to be published on the Market.
https://marketplace.visualstudio.com/items?itemName=wengerk.highlight-bad-chars

