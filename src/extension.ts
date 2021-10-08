// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import chars from './bad-characters';

function loadConfiguration(): {
    badCharDecorationType: vscode.TextEditorDecorationType,
    charRegExp: string,
    allowedChars: string[],
    errorSeverity: vscode.DiagnosticSeverity,
} {
    const configObj = vscode.workspace.getConfiguration('highlight-bad-chars');
    const badCharDecorationStyle = configObj.badCharDecorationStyle as vscode.DecorationRenderOptions;
    const additionalChars = configObj.additionalUnicodeChars as string[];
    const asciiOnly = !!configObj.asciiOnly;
    let allowedChars = configObj.allowedUnicodeChars as string[];

    const badCharDecorationType = vscode.window.createTextEditorDecorationType(badCharDecorationStyle);

    let errorSeverity: vscode.DiagnosticSeverity;
    switch (configObj.severity) {
        case 0:
            errorSeverity = vscode.DiagnosticSeverity.Error;
            break;
        case 1:
            errorSeverity = vscode.DiagnosticSeverity.Warning;
            break;
        case 2:
            errorSeverity = vscode.DiagnosticSeverity.Information;
            break;
        case 3:
            errorSeverity = vscode.DiagnosticSeverity.Hint;
            break;
        default:
            errorSeverity = vscode.DiagnosticSeverity.Error;
            break;
    }

    const charRegExp = '[' +
        chars.join('') +
        (additionalChars || []).join('') +
        (asciiOnly ? '\u{0080}-\u{10FFFF}' : '') +
        ']';

    if (!allowedChars || !allowedChars.length) {
        allowedChars = [];
    }

    return {
        badCharDecorationType,
        charRegExp,
        allowedChars,
        errorSeverity,
    };
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    let config = loadConfiguration();
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('highlight-bad-chars');
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

    vscode.workspace.onDidCloseTextDocument(event => {
        diagnosticCollection.delete(event.uri);
        triggerUpdateDecorations();
    })

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
        const errors: vscode.Diagnostic[] = [];
        const fileUri = activeEditor.document.uri;

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
            errors.push(createDiagnostic(startPos, endPos, `found a bad character: \\u${codePoint}`, config.errorSeverity));
        }
        activeEditor.setDecorations(config.badCharDecorationType, badChars);
        diagnosticCollection.set(fileUri, errors);
    }

    function createDiagnostic(
        start: vscode.Position,
        end: vscode.Position,
        message: string,
        severity: vscode.DiagnosticSeverity
    ) {
        const diagnostic = new vscode.Diagnostic(new vscode.Range(start, end), message, severity);
        diagnostic.source = 'highlight-bad-chars';
        return diagnostic;
    }
}
