import type { Range, DecorationRenderOptions, DiagnosticSeverity } from 'vscode';
import {contributes} from '../package.json';
const configDefinition = contributes.configuration;

export type ExtensionConfig = {
    badCharDecorationStyle: DecorationRenderOptions,
    additionalUnicodeChars?: string[],
    allowedUnicodeChars?: string[],
    asciiOnly?: boolean,
    severity?: number,
};

/**
 * Create a Mock VS Code document.
 *
 * @param text The text contained in the document.
 */
const createMockDocument = (text = '') => {
    return {
        text,
        getText() {
            return this.text;
        },
        positionAt(offset: number) {
            const before = this.text.slice(0, offset);
            const newLines = before.match(/\r\n|\n/g);
            const line = newLines ? newLines.length : 0;
            const preCharacters = before.match(/(\r\n|\n|^).*$/g);
            return {
                line,
                character: preCharacters ? preCharacters[0].length : 0,
            };
        },
    };
};

const mockDocument = createMockDocument();

/**
 * Mock the console to ignore console.log in tests.
 */
global.console = {
    ...global.console,

    // console.log are ignored in tests.
    log: jest.fn(),

    // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`.
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
};

const mockDisposable = {
    dispose: jest.fn(),
};

const mockDecorationType = {
    dispose: jest.fn(),
};

let mockConfiguration: ExtensionConfig = {
    badCharDecorationStyle: contributes.configuration.properties['highlight-bad-chars.badCharDecorationStyle'].default,
};

const mockSetDecorations = jest.fn();
const mockSetDiagnostics = jest.fn();
const mockClearDiagnostics = jest.fn();
const mockDeleteDiagnostics = jest.fn();
const mockDisposeDiagnostics = jest.fn();

/**
 * Tag for use with template literals.
 *
 * Finds the indentation on the first line after the opening backtick
 * and removes that indentation from every line in the template.
 *
 * @param strings Array of lines in the template literal.
 */
function outdent(strings: string[]|string) {
    // Add in all of the expressions.
    let outdented = (Array.isArray(strings) ? strings : [strings])
        .map((s, i) => `${s}${arguments[i + 1] || ''}`)
        .join('');

    // Find the indentation after the first newline.
    const matches = /^\s+/.exec(outdented.split('\n')[1]);
    if (matches) {
        const outdentRegex = new RegExp('\\n' + matches[0], 'g');
        outdented = outdented.replace(outdentRegex, '\n');
    }
    return outdented;
}

jest.mock(
    'vscode',
    () => {
        return {
            window: {
                onDidChangeActiveTextEditor: jest.fn(() => mockDisposable),
                createTextEditorDecorationType: jest.fn(() => mockDecorationType),
                activeTextEditor: {
                    document: mockDocument,
                    setDecorations: mockSetDecorations,
                },
            },
            workspace: {
                onDidChangeTextDocument: jest.fn(() => mockDisposable),
                onDidChangeConfiguration: jest.fn(() => mockDisposable),
                getConfiguration: jest.fn(_ => mockConfiguration),
                onDidCloseTextDocument: jest.fn(() => mockDisposable),
            },
            Position: jest.fn((line, char) => {
                return { line, char };
            }),
            Range: jest.fn((left, right) => {
                return { left, right };
            }),
            DiagnosticSeverity: {
                Hint: 'DiagnosticSeverity.Hint',
                Information: 'DiagnosticSeverity.Information',
                Warning: 'DiagnosticSeverity.Warning',
                Error: 'DiagnosticSeverity.Error',
            },
            Diagnostic: jest.fn((range: Range, message: string, severity?: DiagnosticSeverity) => {
                return {
                    range,
                    message,
                    severity,
               };
            }),
            // const diagnostic = new vscode.Diagnostic(new vscode.Range(start, end), message, severity);
            languages: {
                createDiagnosticCollection: jest.fn(() => ({
                    set: mockSetDiagnostics,
                    delete: mockDeleteDiagnostics,
                    clear: mockClearDiagnostics,
                    dispose: mockDisposeDiagnostics,
                })),
            },
        };
    },
    { virtual: true },
);

// tslint:disable-next-line:no-var-requires
const mockVscode = require('vscode');
// tslint:disable-next-line:no-var-requires
const {activate} = require('../src/extension');
const context = {};

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    const additionalUnicodeChars = configDefinition.properties['highlight-bad-chars.additionalUnicodeChars'].default;
    const allowedUnicodeChars = configDefinition.properties['highlight-bad-chars.allowedUnicodeChars'].default;
    const badCharDecorationStyle = configDefinition.properties['highlight-bad-chars.badCharDecorationStyle'].default;
    const asciiOnly = configDefinition.properties['highlight-bad-chars.asciiOnly'].default;
    const severity = configDefinition.properties['highlight-bad-chars.severity'].default;

    mockConfiguration = {
        additionalUnicodeChars,
        allowedUnicodeChars,
        badCharDecorationStyle,
        asciiOnly,
        severity,
    };
});

describe('updateDecorations', () => {
    it('shows zero width space', () => {
        mockDocument.text = 'zero width space \u200B';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows zero width space in problems', () => {
        mockDocument.text = 'zero width space \u200b';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('does not shows zero width non-joiner', () => {
        mockDocument.text = 'zero width non-joiner \u200c';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows zero width non-joiner in problems', () => {
        mockDocument.text = 'zero width non-joiner \u200c';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('does not shows paragraph separator', () => {
        mockDocument.text = 'paragraph separator \u2029';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows paragraph separator in problems', () => {
        mockDocument.text = 'paragraph separator \u2029';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('shows non breaking space', () => {
        mockDocument.text = 'non breaking space \u00a0';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows non breaking space in problems', () => {
        mockDocument.text = 'non breaking space \u00a0';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('shows soft hyphen', () => {
        mockDocument.text = 'soft hyphen \u00ad';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows soft hyphen in problems', () => {
        mockDocument.text = 'soft hyphen \u00ad';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('does not shows left double quotation mark', () => {
        mockDocument.text = 'left double quotation mark \u201c';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('does not shows left double quotation mark in problems', () => {
        mockDocument.text = 'left double quotation mark \u201c';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('does not shows right double quotation mark', () => {
        mockDocument.text = 'right double quotation mark \u201d';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('does not shows right double quotation mark in problems', () => {
        mockDocument.text = 'right double quotation mark \u201d';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('shows object replacement character', () => {
        mockDocument.text = 'object replacement character \ufffc';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows object replacement character in problems', () => {
        mockDocument.text = 'object replacement character \ufffc';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('shows multiple characters on multiple lines', () => {
        mockDocument.text = outdent(`
    zero width space \u200b\u200b\u200b
    zero width non-joiner \u200c\u200c\u200c
    paragraph separator \u2029\u2029\u2029
    non breaking space \u00a0\u00a0\u00a0
    left double quotation mark \u201c\u201c\u201c
    right double quotation mark \u201d\u201d\u201d
    `);
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows multiple characters on multiple lines in problems', () => {
        mockDocument.text = outdent(`
    zero width space \u200b\u200b\u200b
    zero width non-joiner \u200c\u200c\u200c
    paragraph separator \u2029\u2029\u2029
    non breaking space \u00a0\u00a0\u00a0
    left double quotation mark \u201c\u201c\u201c
    right double quotation mark \u201d\u201d\u201d
    `);
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });

    it('clears decorations with a clean document', () => {
        mockDocument.text = outdent(`
    zero width space \u200b\u200b\u200b
    zero width non-joiner \u200c\u200c\u200c
    paragraph separator \u2029\u2029\u2029
    non breaking space \u00a0\u00a0\u00a0
    left double quotation mark \u201c\u201c\u201c
    right double quotation mark \u201d\u201d\u201d
    `);
        activate(context);
        jest.runAllTimers();
        mockSetDecorations.mockClear();

        mockDocument.text = outdent(`
    zero width space
    zero width non-joiner
    paragraph separator
    non breaking space
    left double quotation mark
    right double quotation mark
    `);
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('clears problems with a clean document', () => {
        mockDocument.text = outdent(`
    zero width space \u200b\u200b\u200b
    zero width non-joiner \u200c\u200c\u200c
    paragraph separator \u2029\u2029\u2029
    non breaking space \u00a0\u00a0\u00a0
    left double quotation mark \u201c\u201c\u201c
    right double quotation mark \u201d\u201d\u201d
    `);
        activate(context);
        jest.runAllTimers();
        mockSetDiagnostics.mockClear();

        mockDocument.text = outdent(`
    zero width space
    zero width non-joiner
    paragraph separator
    non breaking space
    left double quotation mark
    right double quotation mark
    `);
        activate(context);
        jest.runAllTimers();
        expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
    });
});

describe('lifecycle registration', () => {
    it('registers with window.onDidChangeActiveTextEditor', () => {
        activate(context);
        expect(
            mockVscode.window.onDidChangeActiveTextEditor.mock.calls,
        ).toMatchSnapshot();
    });

    it('registers with workspace.onDidChangeTextDocument', () => {
        activate(context);
        expect(
            mockVscode.workspace.onDidChangeTextDocument.mock.calls,
        ).toMatchSnapshot();
    });

    it('registers with workspace.onDidCloseTextDocument', () => {
        activate(context);
        expect(
            mockVscode.workspace.onDidCloseTextDocument.mock.calls,
        ).toMatchSnapshot();
    });

    it('registers with workspace.onDidChangeConfiguration', () => {
        activate(context);
        expect(
            mockVscode.workspace.onDidChangeConfiguration.mock.calls,
        ).toMatchSnapshot();
    });
});

describe('configuration', () => {
    describe('level', () => {
        it('setting level to none prevents decoration from being displayed', () => {
            // Be sure no timer stay idle.
            jest.runAllTimers();
            mockSetDecorations.mockClear();

            // Default is to display decoration.
            mockDocument.text = 'zero width space \u200b';
            activate(context);
            jest.runAllTimers();
            expect(mockSetDecorations.mock.calls).toMatchSnapshot();

            // When overriding level to allow that char.
            mockSetDecorations.mockClear();
            mockConfiguration.allowedUnicodeChars = [];
            mockConfiguration.allowedUnicodeChars.push('200b');
            const configChangeHandler = mockVscode.workspace.onDidChangeConfiguration.mock.calls[0][0];
            configChangeHandler({ affectsConfiguration: () => true});

            // Decoration is no longer displayed
            expect(mockSetDecorations.mock.calls).toMatchSnapshot();
        });

        it('setting level to none prevents diagnostic from being displayed', () => {
            // Be sure no timer stay idle.
            jest.runAllTimers();
            mockSetDecorations.mockClear();

            // Default is to create diagnostic.
            mockDocument.text = 'zero width space \u200b';
            activate(context);
            jest.runAllTimers();
            expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();

            // When overriding level to 'Warning'.
            mockSetDecorations.mockClear();
            mockConfiguration.severity = 3;
            const configChangeHandler = mockVscode.workspace.onDidChangeConfiguration.mock.calls[0][0];
            configChangeHandler({ affectsConfiguration: () => true});

            // Diagnostic is no longer created
            expect(mockSetDiagnostics.mock.calls).toMatchSnapshot();
        });
    });
});
