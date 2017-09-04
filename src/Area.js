import React, { Component } from 'react';
import Dropzone from './Dropzone';

const MIN_SIDE = 30;

export default class Area extends Component {
    state = {
        dropzones: [
            { x: 20, y: 25, width: 100, height: 31, orientation: 'left' },
            { x: 25, y: 10, width: 100, height: 50, orientation: 'bottom' },
            { x: 32, y: 30, width: 100, height: 45, orientation: 'top' },
            { x: 35, y: 52, width: 100, height: 40, orientation: 'bottom' },
            { x: 35, y: 10, width: 100, height: 40, orientation: 'top' },
            // { x: 35, y: 95, width: 100, height: 40, orientation: 'top' },
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
    const shouldHide = container => container.width <= MIN_SIDE || container.height <= MIN_SIDE;
    const isColliding = collisions => collisions.left || collisions.right || collisions.top || collisions.bottom;
    let done = false;

    while (!done) {
        done = true;

        for (let i = 0; i < containers.length; i++) {
            const container = containers[i];
            const { orientation } = container;

            // let outOfBounds = this.detectOutOfBounds(container);
            //
            // while (isColliding(outOfBounds) && !shouldHide(container)) {
            //     if (orientation === 'left' && outOfBounds.right) {
            //         container.width--;
            //     }
            //     if (orientation === 'right' && outOfBounds.left) {
            //         container.width--;
            //         container.left++;
            //     }
            //     if (orientation === 'top' && outOfBounds.bottom) {
            //         container.height--;
            //     }
            //     if (orientation === 'bottom' && outOfBounds.top) {
            //         container.height--;
            //         container.top++;
            //     }
            //
            //     done = false;
            //
            //     outOfBounds = this.detectOutOfBounds(container);
            // }
            //
            // if (shouldHide(container)) {
            //     container.width = container.height = MIN_SIDE;
            //     container.left = container.top = -MIN_SIDE * .5;
            //
            //     continue;
            // }

            for (let j = 0; j < containers.length; j++) {
                if (i === j) {
                    continue;
                }

                const c = containers[j];

                let collisions = this.detectCollisions(container, c);
                let alt = false;

                if (shouldHide(container) && shouldHide(c)) {
                    continue;
                }

                while (isColliding(collisions) && (!shouldHide(container) || !shouldHide(c))) {
                    if (alt) {
                        if (orientation === 'left' && collisions.right) {
                            container.width -= 1;
                        }
                        if (orientation === 'right' && collisions.left) {
                            container.width -= 1;
                            container.left += 1;
                        }
                        if (orientation === 'top' && collisions.bottom) {
                            container.height -= 1;
                        }
                        if (orientation === 'bottom' && collisions.top) {
                            container.height -= 1;
                            container.top += 1;
                        }
                        if (shouldHide(container)) {
                            container.width = container.height = MIN_SIDE;
                            container.left = container.top = -MIN_SIDE * .5;
                        }
                    } else {
                        if (c.orientation === 'right' && collisions.right) {
                            c.width -= 1;
                            c.left += 1;
                        }
                        if (c.orientation === 'left' && collisions.left) {
                            c.width -= 1;
                        }
                        if (c.orientation === 'bottom' && collisions.bottom) {
                            c.height -= 1;
                            c.top += 1;
                        }
                        if (c.orientation === 'top' && collisions.top) {
                            c.height -= 1;
                        }
                        if (shouldHide(c)) {
                            c.width = c.height = MIN_SIDE;
                            c.left = c.top = -MIN_SIDE * .5;
                        }
                    }

                    done = false;
                    alt = !alt;
                    collisions = this.detectCollisions(container, c);
                }
            }
        }
    }

    return containers;
  }

  detectOutOfBounds = c1 => {
    const props = this.props;
    const areaWidth = props.width;
    const areaHeight = props.height;
    const c1Left = c1.refLeft + c1.left;
    const c1Top = c1.refTop + c1.top;

    return {
        left: c1Left < 0,
        top: c1Top < 0,
        right: c1Left + c1.width > areaWidth,
        bottom: c1Top + c1.height > areaHeight
    };
  }

  detectCollisions = (c1, c2) => {
    const c1Left = c1.refLeft + c1.left;
    const c1Top = c1.refTop + c1.top;
    const c2Left = c2.refLeft + c2.left;
    const c2Top = c2.refTop + c2.top;
    const isColliding = (
      c1Left < c2Left + c2.width &&
      c1Left + c1.width > c2Left &&
      c1Top < c2Top + c2.height &&
      c1.height + c1Top > c2Top
    );

    return {
      left: isColliding && c1Left > c2Left,
      top: isColliding && c1Top > c2Top,
      right: isColliding && c1Left + c1.width > c2Left,
      bottom: isColliding && c1Top + c1.height > c2Top
    };
  }
}
