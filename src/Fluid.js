import React, { Component } from 'react';

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;

export default class Fluid extends Component {
  constructor(props) {
    super(props);

    this.state = { width: null, height: null };

    window.addEventListener('resize', this.setSize.bind(this));
  }

  componentWillMount() {
    this.setSize();
  }

  render() {
    const styles = {
      background: 'lightblue',
      width: `${this.state.width}px`,
      height: `${this.state.height}px`
    };

    return (
      <div style={styles}>
        {React.Children.map(this.props.children, child => React.cloneElement(child, {
          width: this.state.width,
          height: this.state.height
        }))}
      </div>
    );
  }

  setSize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let width, height;

    if (windowWidth / MAX_WIDTH < windowHeight / MAX_HEIGHT) {
      width = windowWidth < MAX_WIDTH ? windowWidth : MAX_WIDTH;
      height = Math.floor(width * MAX_HEIGHT / MAX_WIDTH);
    } else {
      height = windowHeight < MAX_HEIGHT ? windowHeight : MAX_HEIGHT;
      width = Math.floor(height * MAX_WIDTH / MAX_HEIGHT);
    }

    this.setState({
      width,
      height
    });
  }
}
