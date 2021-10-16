// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import chars from './bad-characters';

export type ExtensionConfig = {
    badCharDecorationStyle: vscode.DecorationRenderOptions,
    additionalUnicodeChars?: string[],
    allowedUnicodeChars?: string[],
    asciiOnly?: boolean,
};

function loadConfiguration(): {
    badCharDecorationType: vscode.TextEditorDecorationType,
    charRegExp: string,
    allowedChars: string[],
} {
    const configObj = (vscode.workspace.getConfiguration('highlight-bad-chars')) as vscode.WorkspaceConfiguration & ExtensionConfig;
    let allowedChars = configObj.allowedUnicodeChars;

    const badCharDecorationType = vscode.window.createTextEditorDecorationType(configObj.badCharDecorationStyle);

    const charRegExp = '[' +
        chars.join('') +
        (configObj.additionalUnicodeChars || []).join('') +
        (configObj.asciiOnly ? '\u{0080}-\u{10FFFF}' : '') +
        ']';

    if (!allowedChars || !allowedChars.length) {
        allowedChars = [];
    }

    return {
        badCharDecorationType,
        charRegExp,
        allowedChars,
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

    vscode.workspace.onDidChangeConfiguration(_ => {
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
            if (config.allowedChars.includes(match[0])) {
                continue;
            }
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
