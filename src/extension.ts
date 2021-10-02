// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import chars from './bad-characters';

function loadConfiguration(): {
    badCharDecorationType: vscode.TextEditorDecorationType,
    charRegExp: string,
} {
    const badCharDecorationStyle = vscode.workspace.getConfiguration('highlight-bad-chars').badCharDecorationStyle as vscode.DecorationRenderOptions;
    const badCharDecorationType = vscode.window.createTextEditorDecorationType(badCharDecorationStyle);
    const additionalChars = vscode.workspace.getConfiguration('highlight-bad-chars').additionalUnicodeChars as string[];
    const asciiOnly = vscode.workspace.getConfiguration('highlight-bad-chars').asciiOnly;

    const charRegExp = '[' +
        chars.join('') +
        (additionalChars || []).join('') +
        (asciiOnly ? '\u{0080}-\u{10FFFF}' : '') +
        ']';

    return {
        badCharDecorationType,
        charRegExp,
    };
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    let config = loadConfiguration();
    console.log('highlight-bad-chars decorator is activated with configuration', config);

    let timeout: NodeJS.Timeout|null = null;
    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeConfiguration(event => {
        config = loadConfiguration();
        console.log('highlight-bad-chars configuration updated', config);
    }, null, context.subscriptions);

    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 500);
    }

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        const regEx = new RegExp(config.charRegExp, 'g');
        const text = activeEditor.document.getText();
        const badChars: vscode.DecorationOptions[] = [];

        let match;
        // tslint:disable-next-line:no-conditional-assignment
        while (match = regEx.exec(text)) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const codePoint = match[0].codePointAt(0)?.toString(16).toUpperCase();
            const decoration = {
                range: new vscode.Range(startPos, endPos),
                hoverMessage: `Bad char \\u${codePoint} (${match[0]})`,
            };
            badChars.push(decoration);
        }
        activeEditor.setDecorations(config.badCharDecorationType, badChars);
    }
}
