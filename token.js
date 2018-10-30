

function isElementChar(char) {
  if(char >= 'a' && char <= 'z') return true
  if(char >= 'A' && char <= 'Z') return true
  if(char === '-') return true
  return false
}

const ADJACENT_SIBLING = '+';
const CHILD = '>';

const Combinators = [
  ADJACENT_SIBLING,
  CHILD,
];

/**
 * 
 * 
 * 
 * input:  'tagA tagB'
 * output: ['tagA', 'tagB']
 * 
 * input:  'tagA + tagB'
 * output: ['tagA', '+', 'tagB']
 * 
 * input:  'tagA+tagB'
 * output: ['tagA', '+', 'tagB']
 * 
 * input:  'tagA > tagB'
 * output: ['tagA', '>', 'tagB']
 * 
 * input:  'tagA>tagB'
 * output: ['tagA', '>', 'tagB']
 */
function token(input) {
  const ret = [];
  const length = input.length;
  let start = 0;
  let end = 0;
  while(start < length) {
    while (start < length && input[start] === ' ') {
      start += 1;
    }
    if (start === length) {
      break;
    }
    end = start;
    if (isElementChar(input[end])) {
      end += 1;
      while(isElementChar(input[end])) {
        end += 1;
      }
      ret.push(input.slice(start, end))
      start = end;
      continue;
    }

    if (Combinators.includes(input[end])) {
      ret.push(input[end]);
      start = end + 1;

      continue;
    }
  }

  return ret;
}

const inputList = [
  'tagA tagB',
  'tagA + tagB',
  'tagA+tagB',
  'tagA > tagB',
  'tagA>tagB',
]

inputList.map(input => console.log(token(input)))

