export class ElementWrapper {
  constructor (type) {
    this.root = document.createElement(type)
  }

  setAttribute (name, val) {
    // 如果是on开头，绑定事件
    if (name.match(/^on([\s\S]+)$/)) {
      // 据说有的事件是含有大写字符的，所以不能整个字符串转小写
      // 此处姑且认为自定义的事件，标准事件都是小写字母。
      // const event = RegExp.$1.toLowerCase()
      const event = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
      this.root.addEventListener(event, val)
    } else {
      // 如果是 className，则还原为 class
      if (name === 'className') name = 'class'

      this.root.setAttribute(name, val)
    }
  }

  appendChild (vChild) {
    const range = document.createRange()
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild)
      range.setEndAfter(this.root.lastChild)
    } else {
      range.setStart(this.root, 0)
      range.setEnd(this.root, 0)
    }
    vChild.mountTo(range)
  }

  mountTo (range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class TextWrapper {
  constructor (content) {
    this.root = document.createTextNode(content)
  }

  mountTo (range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
