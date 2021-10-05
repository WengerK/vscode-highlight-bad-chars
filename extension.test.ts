import {contributes} from './package.json';
const configDefinition = contributes.configuration;

/**
 * Create a Mock VSCode document.
 *
 * @param text   The text contained in the document.
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

let mockDocument = createMockDocument();

/**
 * Mock the console to ignore console.log in tests.
 */
global.console = {
    // console.log are ignored in tests.
    log: jest.fn(),

    // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`.
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
};

let mockDisposable = {
    dispose: jest.fn(),
};

let mockDecorationType = {
    dispose: jest.fn(),
};

let mockConfiguration = {};
const mockSetDecorations = jest.fn();

/**
 * Tag for use with template literals.
 *
 * Finds the indentation on the first line after the opening backtick
 * and removes that indentation from every line in the template.
 *
 * @param {String[]} strings    Array of lines in the template literal.
 */
function outdent(strings: any[]) {
    // Add in all of the expressions.
    let outdented = strings
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
                getConfiguration: jest.fn((key) => mockConfiguration),
            },
            Position: jest.fn((line, char) => {
                return { line, char };
            }),
            Range: jest.fn((left, right) => {
                return { left, right };
            }),
        };
    },
    { virtual: true },
);

// tslint:disable-next-line:no-var-requires
const mockVscode = require('vscode');
// tslint:disable-next-line:no-var-requires
const { activate } = require('./src/extension');
const context = {};

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    const additionalUnicodeChars = configDefinition.properties['highlight-bad-chars.additionalUnicodeChars'].default;
    const allowedUnicodeChars = configDefinition.properties['highlight-bad-chars.allowedUnicodeChars'].default;
    const badCharDecorationStyle = configDefinition.properties['highlight-bad-chars.badCharDecorationStyle'].default;
    const asciiOnly = configDefinition.properties['highlight-bad-chars.asciiOnly'].default;

    mockConfiguration = {
        additionalUnicodeChars,
        allowedUnicodeChars,
        badCharDecorationStyle,
        asciiOnly,
    };
});

describe('updateDecorations', () => {
    it('shows zero width space', () => {
        mockDocument.text = 'zero width space \u200B';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('does not shows zero width non-joiner', () => {
        mockDocument.text = 'zero width non-joiner \u200c';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('does not shows paragraph separator', () => {
        mockDocument.text = 'paragraph separator \u2029';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows non breaking space', () => {
        mockDocument.text = 'non breaking space \u00a0';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows soft hyphen', () => {
        mockDocument.text = 'soft hyphen \u00ad';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('does not shows left double quotation mark', () => {
        mockDocument.text = 'left double quotation mark \u201c';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('does not shows right double quotation mark', () => {
        mockDocument.text = 'right double quotation mark \u201d';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows object replacement character', () => {
        mockDocument.text = 'object replacement character \ufffc';
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('shows multiple characters on multiple lines', () => {
        mockDocument.text = outdent`
    zero width space \u200b\u200b\u200b
    zero width non-joiner \u200c\u200c\u200c
    paragraph separator \u2029\u2029\u2029
    non breaking space \u00a0\u00a0\u00a0
    left double quotation mark \u201c\u201c\u201c
    right double quotation mark \u201d\u201d\u201d
    `;
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
    });

    it('clears decorations with a clean document', () => {
        mockDocument.text = outdent`
    zero width space \u200b\u200b\u200b
    zero width non-joiner \u200c\u200c\u200c
    paragraph separator \u2029\u2029\u2029
    non breaking space \u00a0\u00a0\u00a0
    left double quotation mark \u201c\u201c\u201c
    right double quotation mark \u201d\u201d\u201d
    `;
        activate(context);
        jest.runAllTimers();
        mockSetDecorations.mockClear();

        mockDocument.text = outdent`
    zero width space
    zero width non-joiner
    paragraph separator
    non breaking space
    left double quotation mark
    right double quotation mark
    `;
        activate(context);
        jest.runAllTimers();
        expect(mockSetDecorations.mock.calls).toMatchSnapshot();
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
            // Default is to display decoration.
            mockDocument.text = 'zero width space \u200b';
            activate(context);
            jest.runAllTimers();
            expect(mockSetDecorations.mock.calls).toMatchSnapshot();

            // When overriding level to allow that char.
            mockSetDecorations.mockClear();
            mockConfiguration.allowedUnicodeChars.push('200b');
            const configChangeHandler = mockVscode.workspace.onDidChangeConfiguration.mock.calls[0][0];
            configChangeHandler({ affectsConfiguration: () => true});

            // Decoration is no longer displayed
            expect(mockSetDecorations.mock.calls).toMatchSnapshot();
        });
    });
});
