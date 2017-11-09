'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('highlight-bad-chars decorator is activated');

    const badCharDecorationType = vscode.window.createTextEditorDecorationType({
        cursor: 'crosshair',
        backgroundColor: 'rgba(255,0,0,0.3)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255,0,0,0.6)'
    });

    const chars = [
        // https://github.com/possan/sublime_unicode_nbsp/blob/master/sublime_unicode_nbsp.py
        '\x82', // High code comma
        '\x84', // High code double comma
        '\x85', // Tripple dot
        '\x88', // High carat
        '\x91', // Forward single quote
        '\x92', // Reverse single quote
        '\x93', // Forward double quote
        '\x94', // Reverse double quote
        '\x95', // <control> Message Waiting
        '\x96', // High hyphen
        '\x97', // Double hyphen
        '\x99', // <control>
        '\xA0', // No-break space
        '\xA6', // Split vertical bar
        '\xAB', // Double less than
        '\xBB', // Double greater than
        '\xBC', // one quarter
        '\xBD', // one half
        '\xBE', // three quarters
        '\xBF', // c-single quote
        '\xA8', // modifier - under curve
        '\xB1', // modifier - under line

        // https://www.cs.tut.fi/~jkorpela/chars/spaces.html
        // '\u00A0', // no-break space
        '\u1680', // ogham space mark
        '\u180E', // mongolian vowel separator
        '\u2000', // en quad
        '\u2001', // em quad
        '\u2002', // en space
        '\u2003', // em space
        '\u2004', // three-per-em space
        '\u2005', // four-per-em space
        '\u2006', // six-per-em space
        '\u2007', // figure space
        '\u2008', // punctuation space
        '\u2009', // thin space
        '\u200A', // hair space
        '\u200B', // zero width space
        '\u200D', // zero width joiner
        '\u2013', // en dash
        '\u2014', // em dash
        '\u2028', // line separator space
        '\u202F', // narrow no-break space
        '\u205F', // medium mathematical space
        '\u3000', // ideographic space
        '\uFEFF', // zero width no-break space

        // others
        '\u037E', // greek question mark
        '\u0000', // <control>
        '\u0011', // <control>
        '\u0012', // <control>
        '\u0013', // <control>
        '\u0014', // <control>
        '\u001B', // <control>
        '\u0080', // <control>
        '\u0090', // <control>
        '\u009B', // <control>
        '\u009F', // <control>
        '\u00B8', // cadilla
        '\u01C0', // latin letter dental click
        '\u2223', // divides
    ];
    
    let additionalChars = vscode.workspace.getConfiguration('highlight-bad-chars').additionalUnicodeChars;
    let charRegExp = '[' + chars.join('') + additionalChars.join('') + ']';
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

    var timeout = null;
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

        let regEx = new RegExp(charRegExp, 'g');
        const text = activeEditor.document.getText();
        const badChars: vscode.DecorationOptions[] = [];

        let match;
        while (match = regEx.exec(text)) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Bad char "**' + match[0] + '**"' };
            badChars.push(decoration);
        }
        activeEditor.setDecorations(badCharDecorationType, badChars);
    }
}