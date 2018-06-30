# Highlight Bad Chars

Extension to highlight bad characters such as No-break space ( ) and the Greek question mark (;) in your source files.

With this package you'll easily notice invisible and easy-to-confuse characters, which can be the cause for incredibly annoying syntax errors in source code.

Save yourself the burden of debugging invisible bugs for hours!

## Features

### Before

![Before using Highlight Bad Chars](https://raw.githubusercontent.com/WengerK/vscode-highlight-bad-chars/master/images/before.png)

### After

![After using Highlight Bad Chars](https://raw.githubusercontent.com/WengerK/vscode-highlight-bad-chars/master/images/after.png)

### Settings

Additional unicode characters can be specified in Visual Studio Code 'Settings'.
'highlight-bad-chars.additionalUnicodeChars' is the setting name array object that is used. To add additional unicode characters, add a new string array value with the unicode character to mark as shown in example below.

```
    "highlight-bad-chars.additionalUnicodeChars": [
        "\u200E",
        "\u200F"
    ],
```
![highlight-bad-chars-configuration](https://raw.githubusercontent.com/WengerK/vscode-highlight-bad-chars/master/images/highlight-bad-chars-configuration.settings.png)

The default "bad char" decoration style can be configured through the
`highlight-bad-chars.badCharDecorationStyle` and defaults to:

```
    "highlight-bad-chars.badCharDecorationStyle": {
        "cursor": "crosshair",
        "backgroundColor": "rgba(255,0,0,0.3)",
        "borderWidth": "1px",
        "borderStyle": "solid",
        "borderColor": "rgba(255,0,0,0.6)"
    }
```

![highlight-bad-chars-configuration](https://raw.githubusercontent.com/WengerK/vscode-highlight-bad-chars/master/images/highlight-bad-chars-decoration.settings.png)

## Credits

Based on the [atom](https://atom.io/) package [Highlight Bad Chars](https://atom.io/packages/highlight-bad-chars).