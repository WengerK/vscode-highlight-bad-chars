// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import chars from './bad-characters';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('highlight-bad-chars decorator is activated');

    const badCharDecorationStyle = vscode.workspace.getConfiguration('highlight-bad-chars').badCharDecorationStyle;
    const badCharDecorationType = vscode.window.createTextEditorDecorationType(badCharDecorationStyle);

    const additionalChars = vscode.workspace.getConfiguration('highlight-bad-chars').additionalUnicodeChars;
    const charRegExp = '[' + chars.join('') + additionalChars.join('') + ']';
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

        const regEx = new RegExp(charRegExp, 'g');
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
        activeEditor.setDecorations(badCharDecorationType, badChars);
    }
}
