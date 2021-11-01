export default [
    // https://github.com/possan/sublime_unicode_nbsp/blob/master/sublime_unicode_nbsp.py
    '\x82', // High code comma
    '\x84', // High code double comma
    '\x85', // Triple dot
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
    '\uFFFC', // object replacement character

    // Dangerous characters per Trojan Sources
    // https://trojansource.codes
    // Contains additional characters listed on https://access.redhat.com/security/vulnerabilities/RHSB-2021-007
    '\u061C',
    '\u200E',
    '\u200F',
    '\u202A',
    '\u202B',
    '\u202C',
    '\u202D',
    '\u202E',
    '\u2066',
    '\u2067',
    '\u2068',
    '\u2069',
    '\u200B',
    '\u200C',

    // control characters
    `\x00`, // NUL
    `\x01`, // SOH
    `\x02`, // STX
    `\x03`, // ETX
    `\x04`, // EOT
    `\x05`, // ENQ
    `\x06`, // ACK
    `\x07`, // BEL
    `\x08`, // BS
    `\x0B`, // VT
    `\x0C`, // FF
    `\x0E`, // SO
    `\x0F`, // SI
    `\x10`, // DLE
    `\x11`, // DC1
    `\x12`, // DC2
    `\x13`, // DC3
    `\x14`, // DC4
    `\x15`, // NAK
    `\x16`, // SYN
    `\x17`, // ETB
    `\x18`, // CAN
    `\x19`, // EM
    `\x1A`, // SUB
    `\x1B`, // ESC
    `\x1C`, // FS
    `\x1D`, // GS
    `\x1E`, // RS
    `\x1F`, // US
    `\x7F`, // DEL

    // others
    '\u037E', // greek question mark
    '\u00B8', // cadilla
    '\u01C0', // latin letter dental click
    '\u2223', // divides
    '\u00AD', // soft hyphen
];
