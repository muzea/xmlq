import { Element } from 'xml-js';
import { get, isString, last } from 'lodash'
import token, { Combinators, Combinator } from './token'


enum Type {
  element = 'element',
}

enum Direction {
  forward = 'forward',
  upward = 'upward',
}

interface IItem {
  backtrackingDirection: Direction
  maxDistance: number
  name: string
}

interface IMatcher {
  isMatch(lodashPath: string, elements: Element): boolean
}

const Path = {
  forward(pathArray: string[]): string[] {
    const index = parseInt(last(pathArray))
    if (index) {
      const ret = pathArray.slice(0, pathArray.length - 1);
      ret.push(`${index - 1}`)
      return ret
    }
    return null
  },
  upward(pathArray: string[]): string[] {
    if (pathArray.length > 2) {
      return pathArray.slice(0, pathArray.length - 2)
    }
    return null
  },
}

class Matcher implements IMatcher {
  items: IItem[]
  id: string
  constructor(query: string, maxTrackingLevel = 100) {
    if (isString(query)) {
      this.id = query
      const tokens = token(query)
      this.items = []
      let index = tokens.length
      while (index) {
        index -= 1
        const item = {
          backtrackingDirection: Direction.upward,
          maxDistance: maxTrackingLevel,
          name: '',
        }
        if (Combinators.includes(tokens[index])) {
          switch (tokens[index]) {
            case Combinator.ADJACENT_SIBLING:
              item.maxDistance = 1
              item.backtrackingDirection = Direction.forward
              break
            case Combinator.CHILD:
              item.maxDistance = 1
              break
          }
          index -= 1
        }
        item.name = tokens[index]
        this.items.push(item)
      }
    }
  }
  isMatch(lodashPath: string, elements: Element) {
    let pathArray = lodashPath.split('.')
    if (this.isMatchItem(pathArray, 0, elements)) {
      let itemIndex = 1
      while (itemIndex < this.items.length) {
        let next = Path.upward
        const currentMatchItem = this.items[itemIndex]
        if (currentMatchItem.backtrackingDirection === Direction.forward) {
          next = Path.forward
        }
        let count = 0
        while(count < currentMatchItem.maxDistance) {
          count += 1
          pathArray = next(pathArray)
          if (!Array.isArray(pathArray)) {
            return false
          }
          if (this.isMatchItem(pathArray, itemIndex, elements)) {
            break
          }
        }
        itemIndex += 1;
      }
      if (itemIndex === this.items.length) {
        return true
      } else {
        console.error('不应该走到这个分支')
        return false
      }
    }
    return false
  }
  private isMatchItem(pathArray: string[], itemIndex: number, elements: Element) {
    const lastElement = get(elements, pathArray)
    const lastItem = this.items[itemIndex]
    if (lastElement.type === Type.element && lastElement.name === lastItem.name) {
      return true
    }
    return false
  }
}

export default Matcher

