import { ElementWrapper, TextWrapper } from './wrapper'

const isSameNode = (node1, node2) => {
  // if (!node1 || !node2) return
  if (node1.type !== node2.type) return false
  for (const name in node1.props) {
    if (typeof node1.props[name] === 'object'
      && typeof node2.props[name] === 'object'
      && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])
    ) continue
    if (node1.props[name] !== node2.props[name]) return false
  }
  if (Object.keys(node1.props).length !== Object.keys(node2.props).length) return false
  return true
}

const isSameTree = (node1, node2) => {
  if (!isSameNode(node1, node2)) return false
  if (node1.children.length !== node2.children.length) return false
  for (let i = 0; i < node1.children.length; i++) {
    if (!isSameTree(node1.children[i], node2.children[i])) return false
  }
  return true
}

const replace = (newTree, oldTree) => {
  if (!newTree || !oldTree) return
  if (isSameTree(newTree, oldTree)) return
  if (!isSameNode(newTree, oldTree)) {
    // 根节点不同，直接放弃
    newTree.mountTo(oldTree.range)
  } else {
    // 根节点相同，处理子节点
    for (let i = 0; i < newTree.children.length; i++) {
      replace(newTree.children[i], oldTree.children[i])
    }
  }
}

export class ToyReactComponent {
  constructor () {
    this.children = []
    this.props = Object.create(null)
    this.state = null
    this.oldState = null
    this.oldVDom = null
  }

  get type () {
    return this.constructor.name
  }

  get vDom () {
    return this.render().vDom
  }

  setState (state) {
    // const merge = (oldState, newState) => {
    //   for (const s in newState) {
    //     if (typeof newState[s] === 'object' && newState[s] !== null) {
    //       if (typeof oldState[s] !== 'object') {
    //         if (newState[s] instanceof Array) {
    //           oldState = []
    //         } else {
    //           oldState[s] = {}
    //         }
    //       }
    //       merge(oldState[s], newState[s])
    //     } else {
    //       oldState[s] = newState[s]
    //     }
    //   }
    // }

    if (!this.state && state) this.state = {}
    this.oldState = { ...this.state }
    // 深度合并
    // merge(this.state, state)
    // 浅合并
    this.state = { ...this.state, ...state }

    this.update({ type: 'update' })
  }

  setAttribute (name, val) {
    this[name] = val
    this.props[name] = val
  }

  appendChild (vChild) {
    this.children.push(vChild)
  }

  mountTo (range) {
    // 生命周期-componentWillMount
    this.componentWillMount && (console.warn('[unsafe] componentWillMount'), this.componentWillMount())
    this.range = range
    this.update({ type: 'mount' })
    // 生命周期-componentDidMount
    this.componentDidMount && this.componentDidMount()
  }

  update ({ type }) {
    if (type !== 'mount') {
      // 新老state比较，相同则不进行update
      // 这里用比较偷懒的方法判断
      if (JSON.stringify(this.state) === JSON.stringify(this.oldState)) return

      // 生命周期-shouldComponentUpdate
      if (this.shouldComponentUpdate) {
        const shouldUpdate = this.shouldComponentUpdate(this.props, this.state)
        if (!shouldUpdate) return
      }
      // 生命周期-componentWillUpdate
      this.componentWillUpdate && (console.warn('[unsafe] componentWillUpdate'), this.componentWillUpdate())
    }

    const vDom = this.vDom
    if (this.oldVDom) {
      replace(vDom, this.oldVDom)
    } else {
      vDom.mountTo(this.range)
    }
    this.oldVDom = vDom

    // 生命周期-componentDidUpdate
    if (type !== 'mount') {
      this.componentDidUpdate && this.componentDidUpdate()
    }
  }
}

ToyReactComponent.$$type = 1

export const ToyReactCreateElement = (type, attrs, ...children) => {
  let wrapperOrComponent

  // 元素处理
  if (typeof type === 'string') {
    // 标准html标签形式
    wrapperOrComponent = new ElementWrapper(type)
  } else if (typeof type === 'function') {
    // 类组件/函数式形式
    // 相当于 new Component()
    const isClassComponent = type.$$type === 1
    if (isClassComponent) {
      // 类组件
      wrapperOrComponent = new type()
    } else {
      // 函数式组件
      wrapperOrComponent = type(attrs)
    }
  }

  // 属性梳理
  for (const name in attrs) {
    wrapperOrComponent.setAttribute(name, attrs[name])
  }

  //元素子节点处理
  let insertChildren = (children) => {
    for (let ch of children) {
      if (typeof ch === 'object' && ch instanceof Array) {
        // 数组形式子元素，递归处理
        insertChildren(ch)
      } else {
        // 处理子元素是空的情况
        if (ch === null || ch === void 0) ch = ''
        // 如果子元素不是可识别元素，强制转为string形式
        if (!(ch instanceof ToyReactComponent) && !(ch instanceof ElementWrapper) && !(ch instanceof TextWrapper)) {
          ch = String(ch)
        }
        if (typeof ch === 'string') {
          // 字符串子元素，需要特殊包裹一次
          ch = new TextWrapper(ch)
        }
        // 非数组形式子元素，直接添加
        wrapperOrComponent.appendChild(ch)
      }
    }
  }
  insertChildren(children)
  return wrapperOrComponent
}

export const ToyReactRender = (vDom, el) => {
  const range = document.createRange()
  if (el.children.length) {
    range.setStartAfter(el.lastChild)
    range.setEndAfter(el.lastChild)
  } else {
    range.setStart(el, 0)
    range.setEnd(el, 0)
  }
  vDom.mountTo(range)
}
