import ToyReact, { Component } from '../React'

class Square extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: null
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    // return nextProps.value !== 0
    return true
  }

  componentWillUpdate () {
    console.log('willUpdate')
  }

  componentDidUpdate () {
    console.log('didUpdate')
  }

  render () {
    return (
      <button className="square" onClick={() => this.setState({ value: 'X' })}>
        {this.state.value ? this.state.value : ''}
      </button>
    )
  }
}

class Board extends Component {
  renderSquare (i) {
    return <Square value={i}/>
  }

  componentWillMount () {
    console.log('willMount')
  }

  componentDidMount () {
    console.log('didMount')
  }

  render () {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    )
  }
}

const root = (
  <div>
    <Board/>
  </div>
)

ToyReact.render(root, document.body)
