export class ElementWrapper {
  constructor (type) {
    this.type = type
    this.props = Object.create(null)
    this.children = []
    this.range = null
  }

  setAttribute (name, val) {
    this.props[name] = val
  }

  appendChild (vChild) {
    this.children.push(vChild)
  }

  mountTo (range) {
    this.range = range
    range.deleteContents()
    let el = document.createElement(this.type)
    for (let name in this.props) {
      const val = this.props[name]
      // 如果是on开头，绑定事件
      if (name.match(/^on([\s\S]+)$/)) {
        // 据说有的事件是含有大写字符的，所以不能整个字符串转小写
        // 此处姑且认为自定义的事件，标准事件都是小写字母。
        // const event = RegExp.$1.toLowerCase()
        const event = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
        el.addEventListener(event, val)
      } else {
        // 如果是 className，则还原为 class
        if (name === 'className') name = 'class'
      }
      el.setAttribute(name, val)
    }

    for (const child of this.children) {
      const range = document.createRange()
      if (el.children.length) {
        range.setStartAfter(el.lastChild)
        range.setEndAfter(el.lastChild)
      } else {
        range.setStart(el, 0)
        range.setEnd(el, 0)
      }
      child.mountTo(range)
    }

    range.insertNode(el)
  }
}

export class TextWrapper {
  constructor (content) {
    this.root = document.createTextNode(content)
    this.type = '#text'
    this.props = Object.create(null)
    this.children = []
    this.range = null
  }

  mountTo (range) {
    this.range = range
    range.deleteContents()
    range.insertNode(this.root)
  }
}
