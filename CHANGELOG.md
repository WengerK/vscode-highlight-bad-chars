# Change Log

All notable changes to the "highlight-bad-chars" extension will be documented in this file.

## Unreleased

# 0.0.6 - 2021-02-11

- [feat] highlight dangerous characters that could be exploited per [Trojan Source](https://trojansource.codes/) (CVE-2021-42574)
- [feat] bundle extension with Webpack for better support for unpkg and browser extension host; the extension always runs in the web extension host now
- [feat] add Github Actions running tests & styles
- [feat] add Jest Snapshot testing
- [feat] change extension activation to `onStartupFinished` to avoid slowing down VS Code launch
- [feat] update engines.vscode ^1.59.0 => ^1.60.0

# 0.0.5 - 2021-04-10

- [fix] do not highlight horizontal tabs as "bad characters"

## 0.0.4 - 2021-04-10

- [feat] extension now works on VS Code for the Web (like github.dev)
- [feat] highlight additional characters: control characters, soft hyphen, object replacement character - close #8, #9, #17
- [feat] show the Unicode codepoint of highlighted characters - close #12
- [feat] configuration option `asciiOnly` to highlight all non-ASCII characters as "bad" (disabled by default) - close #7
- [feat] configuration option `allowedUnicodeChars` to mark characters as "non-bad" - close #4, #10
- [fix] when the configuration changes, the extension changes its behavior without reloading the window
- [fix] remove redundant "Hello World" Command from Command Palette - close #15

Thanks to @ItalyPaleAle, @quackingduck, @Pablion.

## 0.0.3 - 2018-06-30

- [style] make badchar decoration style configurable - close #5 - by @adimascio

## 0.0.2 - 2017-11-12

- add settings option to allow additioal unicode characters to be specified example `\u200E`

## 0.0.1 - 2017-04-24

- Initial release
