import React, { Component } from 'react';
import Dropzone from './Dropzone';

const MIN_SIDE = 30;

export default class Area extends Component {
  state = {
    dropzones: [
      { x: 20, y: 25, width: 100, height: 30, orientation: 'left' },
      { x: 25, y: 5, width: 100, height: 50, orientation: 'top' },
      { x: 32, y: 30, width: 100, height: 45, orientation: 'top' },
      { x: 35, y: 52, width: 100, height: 40, orientation: 'bottom' },
    ]
  }
  render() {
    const dropzones = this.dropzones;

    return (
      <div className="area">
        {dropzones.map((props, index) => (
          <Dropzone
            key={`dropzone_${index}`}
            {...props}
          />
        ))}
      </div>
    );
  }

  get dropzones() {
    const props = this.props;
    const { dropzones } = this.state;
    const areaWidth = props.width;
    const areaHeight = props.height;
    const ghosts = this.ghosts;
    const containers = this.getContainers(ghosts);

    return dropzones.map((dropzone, index) => ({
      left: dropzone.x * areaWidth / 100,
      top: dropzone.y * areaHeight / 100,
      ghost: ghosts[index],
      container: containers[index]
    }));
  }

  get ghosts() {
    return this.state.dropzones.map(this.getGhost);
  }

  getGhost = dropzone => {
    const props = this.props;
    const areaWidth = props.width;
    const areaHeight = props.height;
    const { width, height, orientation, x, y } = dropzone;
    let left = 0;
    let top = 0;

    if (orientation === 'left' || orientation === 'right') {
      top = -height * .5;
    } else if (orientation === 'top' || orientation === 'bottom') {
      left = -width * .5;
    }

    if (orientation === 'left') {
      left = 20;
    } else if (orientation === 'right') {
      left = -20 - width;
    } else if (orientation === 'top') {
      top = 20;
    } else if (orientation === 'bottom') {
      top = -20 - height;
    }

    return { width, height, left, top, orientation, refLeft: x * areaWidth / 100, refTop: y * areaHeight / 100 };
  }

  getContainers = ghosts => {
    const containers = JSON.parse(JSON.stringify(ghosts));

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const otherContainers = containers.filter((c, index) => index !== i);
      const { orientation } = container;
      let shouldHide = () => container.width < MIN_SIDE || container.height < MIN_SIDE;

      for (let j = 0; j < otherContainers.length;) {
        const c = otherContainers[j];
        let collisions = this.detectCollisions(container, c);
        let isColliding = () => collisions.left || collisions.right || collisions.top || collisions.bottom;

        while (isColliding() && !shouldHide()) {
          if (orientation === 'left' && collisions.right) {
            container.width--;
          } else if (orientation === 'right' && collisions.left) {
            container.width--;
            container.left++;
          } else if (orientation === 'top' && collisions.bottom) {
            container.height--;
          } else if (orientation === 'bottom' && collisions.top) {
            container.height--;
            container.top++;
          }

          if (shouldHide() && j > 0) {
            // j--;
          } else {
            collisions = this.detectCollisions(container, c);
            j++;
          }
        }
      }

      if (shouldHide()) {
        container.width = container.height = 40;
        container.left = container.top = -20;
      }
    }

    return containers;
  }

  detectCollisions = (d1, d2) => {
    const d1Left = d1.refLeft + d1.left;
    const d1Top = d1.refTop + d1.top;
    const d2Left = d2.refLeft + d2.left;
    const d2Top = d2.refTop + d2.top;
    const isColliding = (
      d1Left < d2Left + d2.width &&
      d1Left + d1.width > d2Left &&
      d1Top < d2Top + d2.height &&
      d1.height + d1Top > d2Top
    );

    return {
      left: isColliding && d1Left > d2Left,
      top: isColliding && d1Top > d2Top,
      right: isColliding && d1Left + d1.width > d2Left,
      bottom: isColliding && d1Top + d1.height > d2Top
    };
  }
}
