export const MATCHERS = {
    // (<div id="my-id" name="main">, <input type="text" />)
    OPENING_TAG: /<[^<>="\s/']+(?:\s+[^<>="\s/']+(?:="[^"]*?")?)*?\s*\/?>/g,

    // title="value1 {{value2 + 'smt'}} value3"
    ATTR_AND_VALUE: /([^="<>/\s]+)=(?=("[^"]*{{[^"]*}}[^"]*"))\2/g,

    // <div>Ololo</div {{x + 1}}>
    CLOSING_TAG: /<\/[^<>="\s/']+>/g,

    // <div>title="yes {{hi}}"</div>
    TAG_CURLIES_INNER: /{{(.*?)}}/g
};

export const EXPRESSION_TYPES = {
    MULTI: 'MULTI',
    ATTR: 'ATTR',
    TAG: 'TAG'
};

export const ID_MARKER = 'data-refid';
