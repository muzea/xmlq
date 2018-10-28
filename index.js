const fs = require('fs');
const { get, startsWith } = require('lodash');
const convert  = require('xml-js');

var xml = fs.readFileSync('test.xml', 'utf8');
var options = {compact: true, ignoreComment: false, spaces: 4};
var result = convert.xml2js(xml, options);

function isElement(name) {
    return !startsWith(name, '_');
}

function buildMatcher(expected) {
    const expectedList = expected.split(' ');
    return {
        matchLast(current) {
            return current === expectedList[expectedList.length - 1];
        },
        match(currentPath) {
            const currentPathList = currentPath.split(' ');
            const cpl = currentPathList.length;
            let cpli = cpl - 2;
            const el = expectedList.length;
            let eli = el - 2;
            while (cpli >= 0 && eli >= 0) {
                if (expectedList[eli] === currentPathList[cpli]) {
                    cpli -= 1;
                    eli -= 1;
                } else {
                    cpli -=1;
                }
            }
            return (eli === -1);
        },
        getExpected() {
            return expected;
        }
    }
}

/**
 * 
 * @param {string} current 
 * @param {string} currentPath 
 * @param {string} lodashPath 
 * @param {*} elements 
 * @param {*} matcherList 
 * @param {*} visitors 
 */
function _traverse(current, currentPath, lodashPath, elements, matcherList, visitors) {
    // console.log('lodashPath ', lodashPath);
    for (const matcher of matcherList) {
        if (matcher.matchLast(current) && matcher.match(currentPath)) {
            const expected = matcher.getExpected();
            const visitor = visitors[expected];
            const ret = visitor(get(elements, lodashPath));
            if (ret) {
                set(elements, lodashPath, ret);
            }
        }
    }
    const currentElement = get(elements, lodashPath);
    if (Array.isArray(currentElement)) {
        // console.log('currentElement ', currentElement);
        let itemIndex = 0;
        while(currentElement.length > itemIndex) {
            for(const next in currentElement[itemIndex]) {
                if (isElement(next)) {
                    _traverse(next, currentPath + ' ' + next,  lodashPath + `.${itemIndex}.` + next, elements, matcherList, visitors)
                }
            }
            itemIndex += 1;
        }
    } else {
        for(const next in currentElement) {
            if (isElement(next)) {
                _traverse(next, currentPath + ' ' + next, lodashPath + '.' + next, elements, matcherList, visitors)
            }
        }
    }
}

function main(xmlTree, visitors, options) {
    const matcherList = Object.keys(visitors).map(buildMatcher);
    for(const current in xmlTree) {
        if (isElement(current)) {
            _traverse(current, current, current, xmlTree, matcherList, visitors)
        }
    }
}

const visitorMap = {
    'lyric text'(element) {
        if (Array.isArray(element)) {
            for(const e of element) {
                console.log(e._text);
            }
        } else {
            console.log(element._text);
        }
    },
}

main(result, visitorMap)
