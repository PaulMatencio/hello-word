import type { languages, editor } from 'monaco-editor';

/**
 * Monaco Monarch Language Definition for Midnight's Compact Language
 */
export const COMPACT_LANGUAGE_ID = 'compact';

export const compactLanguageDefinition: languages.IMonarchLanguage = {
    defaultToken: 'invalid',
    keywords: [
        'pragma',
        'language_version',
        'import',
        'export',
        'ledger',
        'circuit',
        'witness',
        'constructor',
        'disclose',
        'contract',
        'struct',
        'enum',
        'type',
        'assert',
        'return',
        'if',
        'else',
        'while',
        'for',
        'in',
        'as',
        'include',
        'let',
        'const',
        'true',
        'false',
    ],
    typeKeywords: [
        'Opaque',
        'Cell',
        'Map',
        'Vector',
        'Bytes',
        'Uint',
        'Boolean',
        'Field',
        'String',
        'Address',
        'Counter',
        'Maybe',
        'List',
        'MerkleTree',
    ],
    operators: [
        '=',
        '>',
        '<',
        '!',
        '~',
        '?',
        ':',
        '==',
        '<=',
        '>=',
        '!=',
        '&&',
        '||',
        '++',
        '--',
        '+',
        '-',
        '*',
        '/',
        '&',
        '|',
        '^',
        '%',
        '<<',
        '>>',
        '+=',
        '-=',
        '*=',
        '/=',
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    tokenizer: {
        root: [
            // Identifiers and keywords
            [
                /[a-zA-Z_$][\w$]*/,
                {
                    cases: {
                        '@keywords': 'keyword',
                        '@typeKeywords': 'type',
                        '@default': 'identifier',
                    },
                },
            ],
            // Whitespace
            { include: '@whitespace' },

            // Delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [
                /@symbols/,
                {
                    cases: {
                        '@operators': 'operator',
                        '@default': '',
                    },
                },
            ],

            // Numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // Delimiter: after number because of .\d floats
            [/[;,.]/, 'delimiter'],

            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'], // nested comment
            ['\\*/', 'comment', '@pop'],
            [/[\/*]/, 'comment'],
        ],

        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],
    },
};

export const compactLanguageConfiguration: languages.LanguageConfiguration = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/'],
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['<', '>'],
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: '"', close: '"' },
        { open: '/*', close: '*/' },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: '"', close: '"' },
    ],
};

export const compactTheme: editor.IStandaloneThemeData = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' }, // indigo-400
        { token: 'type', foreground: '38bdf8', fontStyle: 'bold' }, // sky-400
        { token: 'identifier', foreground: 'f8fafc' }, // slate-50
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' }, // slate-500
        { token: 'string', foreground: '34d399' }, // emerald-400
        { token: 'number', foreground: 'fbbf24' }, // amber-400
        { token: 'operator', foreground: 'c084fc' }, // purple-400
        { token: 'delimiter', foreground: '94a3b8' }, // slate-400
    ],
    colors: {
        'editor.background': '#070b14', // midnight-950
        'editor.foreground': '#f8fafc',
        'editorCursor.foreground': '#38bdf8',
        'editor.lineHighlightBackground': '#0f172a50',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818cf8',
        'editor.selectionBackground': '#4338ca50',
        'editor.inactiveSelectionBackground': '#312e8130',
    },
};
