import { ElementWrapper, TextWrapper } from './wrapper'

export class ToyReactComponent {
  constructor () {
    this.children = []
    this.props = Object.create(null)
    this.state = null
    this.oldState = null
  }

  setState (state) {
    // const merge = (oldState, newState) => {
    //   for (const s in newState) {
    //     if (typeof newState[s] === 'object') {
    //       if (typeof oldState[s] !== 'object') oldState[s] = {}
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

    this.range.deleteContents()
    // 由于range清理，会导致后续节点向前移动，导致range offset 发生改变
    // 删除后追加注释节点，使得offset可以保持不变
    const placeholder = document.createComment('')
    const range = document.createRange()
    range.setStart(this.range.endContainer, this.range.endOffset)
    range.setEnd(this.range.endContainer, this.range.endOffset)
    range.insertNode(placeholder)
    const vDom = this.render()
    vDom.mountTo(this.range)
    // placeholder 不可以移除
    // placeholder.parentNode.removeChild(placeholder)

    // 生命周期-componentDidUpdate
    if (type !== 'mount') {
      this.componentDidUpdate && this.componentDidUpdate()
    }
  }

  shouldComponentUpdate () {}

  componentWillUpdate () {}

  componentDidUpdate () {}

  componentWillMount () {}

  componentDidMount () {}
}

export const ToyReactCreateElement = (type, attrs, ...children) => {
  let wrapperOrComponent

  // 元素处理
  if (typeof type === 'string') {
    // 标准html标签形式
    wrapperOrComponent = new ElementWrapper(type)
  } else if (typeof type === 'function') {
    // 类组件/函数式形式
    // 相当于 new Component()
    wrapperOrComponent = new type()
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
