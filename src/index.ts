import { readFileSync } from 'fs';
import { set, get } from 'lodash';
import { xml2js, Element } from 'xml-js';

import matcher from './matcher'

var xml = readFileSync('test.xml', 'utf8');
var options = {compact: false, ignoreComment: false, spaces: 4};
var result = xml2js(xml, options) as Element;

function buildMatcher(expected: string) {
  return new matcher(expected)
}

function _traverse(lodashPath, elements: Element, matcherList: matcher[], visitors) {
  for (const matcher of matcherList) {
    if (matcher.isMatch(lodashPath, elements)) {
      const expected = matcher.id;
      const visitor = visitors[expected];
      const ret = visitor(get(elements, lodashPath));
      if (ret) {
        set(elements, lodashPath, ret);
      }
    }
  }
  const currentElement = get(elements, lodashPath);
  if (Array.isArray(currentElement.elements)) {
    currentElement.elements.forEach((_, index) => {
      _traverse(`${lodashPath}.elements.${index}`, elements, matcherList, visitors)
    })
  }
}

function main(xmlTree: Element, visitors, options?) {
  const matcherList = Object.keys(visitors).map(buildMatcher);
  xmlTree.elements.forEach((_, index) => {
    _traverse(`elements.${index}`, xmlTree, matcherList, visitors)
  })
}

const visitorMap = {
  'note todo'(element: Element) {
    console.log(element);
  },
}

main(result, visitorMap)
