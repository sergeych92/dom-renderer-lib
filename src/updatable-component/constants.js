export const MATCHERS = {
    // (<div id="my-id" name="main">, <input type="text" />)
    OPENING_TAG: /<[^<>="\s/']+(?:\s+[^<>="\s/']+(?:="[^"]*?")?)*?\s*\/?>/g,

    // title="value1 {{value2 + 'smt'}} value3"
    ATTR_AND_CURLIE_VALUE: /([^="<>/\s]+)=(?=("[^"]*{{[^"]*}}[^"]*"))\2/g,

    // <div>Ololo</div {{x + 1}}>
    CLOSING_TAG: /<\/[^<>="\s/']+>/g,

    // <div>title="yes {{hi}}"</div>
    TAG_CURLIES_INNER: /{{(.*?)}}/g
};


export const ID_MARKER = 'data-refid';

export const EMPTY_CURLIES = '{{}}';

export const DYNAMIC_VAR_NAME = '__js_renderer_data__';

export const PROHIBITED_VARIABLE_NAMES = [
    'function',
    'while',
    'do',
    'if',
    'else',
    'let',
    'const',
    'var',
    'of',
    'for',
    'return',
    'break',
    'switch',
    DYNAMIC_VAR_NAME
];

export const JS_15_NAME_RULE = '[a-zA-Z_$][\w$]*';

export const JS_VARNAME_MATCHER = new RegExp(String.raw`^\s*${JS_15_NAME_RULE}\s*$`);
