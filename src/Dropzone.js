import React from 'react';

const Ghost = props => (
  <div
    className="ghost"
    style={props.style}
  />
);

const Container = props => (
  <div
    className="container"
    style={props.style}
  />
);

const Target = props => (
  <div className="target" />
);

export default props => {
  const { ghost, container } = props;
  const style = {
    left: `${props.left}px`,
    top: `${props.top}px`
  };
  const ghostStyle = {
    left: `${ghost.left}px`,
    top: `${ghost.top}px`,
    width: `${ghost.width}px`,
    height: `${ghost.height}px`
  };
  const containerStyle = {
    left: `${container.left}px`,
    top: `${container.top}px`,
    width: `${container.width}px`,
    height: `${container.height}px`
  };

  return (
    <div
      className="dropzone"
      style={style}
    >
      <Ghost style={ghostStyle} />
      <Container style={containerStyle} />
      <Target />
    </div>
  );
}
