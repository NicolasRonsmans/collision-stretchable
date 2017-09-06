import React, { Component } from 'react';
import Dropzone from './Dropzone';

const MIN_SIDE = 30;
const CONTAINER_GAP = 30;
const DROPZONE_MIN_GAP = 4;

export default class Area extends Component {
    state = {
        dropzones: [
            { x: 25, y: 10, width: 100, height: 50, orientation: 'bottom' },
            { x: 35, y: 10, width: 100, height: 40, orientation: 'top' },
            { x: 50, y: 10, width: 100, height: 40, orientation: 'top' },
            { x: 20, y: 25, width: 100, height: 35, orientation: 'left' },
            { x: 32, y: 30, width: 100, height: 45, orientation: 'top' },
            { x: 35, y: 52, width: 100, height: 40, orientation: 'bottom' },
            { x: 35, y: 95, width: 100, height: 40, orientation: 'top' },
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
      left = CONTAINER_GAP;
    } else if (orientation === 'right') {
      left = -CONTAINER_GAP - width;
    } else if (orientation === 'top') {
      top = CONTAINER_GAP;
    } else if (orientation === 'bottom') {
      top = -CONTAINER_GAP - height;
    }

    return {
      width,
      height,
      left,
      top,
      orientation,
      refLeft: x * areaWidth / 100,
      refTop: y * areaHeight / 100,
      original: { width, height, left, top },
      max: { width, height, left, top }
    };
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

            if (shouldHide(container)) {
                continue;
            }

            const expanded = {
                left: Object.assign({}, container, { width: container.width + 1, left: container.left - 1 }),
                right: Object.assign({}, container, { width: container.width + 1 }),
                top: Object.assign({}, container, { height: container.height + 1, top: container.top - 1 }),
                bottom: Object.assign({}, container, { height: container.height + 1 }),
            };
            const { orientation } = container;
            const overallCollisions = { left: false, right: false, top: false, bottom: false };
            const expandedCollisions = { left: false, right: false, top: false, bottom: false };
            const outOfBounds = this.detectOutOfBounds(container);
            const outOfBoundsExpandedLeft = this.detectOutOfBounds(expanded.left);
            const outOfBoundsExpandedRight = this.detectOutOfBounds(expanded.right);
            const outOfBoundsExpandedTop = this.detectOutOfBounds(expanded.top);
            const outOfBoundsExpandedBottom = this.detectOutOfBounds(expanded.bottom);

            if (isColliding(outOfBounds)) {
                if (outOfBounds.right && !overallCollisions.right) {
                    overallCollisions.right = true;
                }
                if (outOfBounds.left && !overallCollisions.left) {
                    overallCollisions.left = true;
                }
                if (outOfBounds.bottom && !overallCollisions.bottom) {
                    overallCollisions.bottom = true;
                }
                if (outOfBounds.top && !overallCollisions.top) {
                    overallCollisions.top = true;
                }
            }

            if (outOfBoundsExpandedLeft.left && !expandedCollisions.left) {
                expandedCollisions.left = true;
            }
            if (outOfBoundsExpandedRight.right && !expandedCollisions.right) {
                expandedCollisions.right = true;
            }
            if (outOfBoundsExpandedTop.top && !expandedCollisions.top) {
                expandedCollisions.top = true;
            }
            if (outOfBoundsExpandedBottom.bottom && !expandedCollisions.bottom) {
                expandedCollisions.bottom = true;
            }

            for (let j = 0; j < containers.length; j++) {
                if (i === j) {
                    continue;
                }

                const c = containers[j];
                const collisions = this.detectCollisions(container, c);
                const collisionsExpandedLeft = this.detectCollisions(expanded.left, c);
                const collisionsExpandedRight = this.detectCollisions(expanded.right, c);
                const collisionsExpandedTop = this.detectCollisions(expanded.top, c);
                const collisionsExpandedBottom = this.detectCollisions(expanded.bottom, c);

                if (isColliding(collisions)) {
                    if (collisions.left && !overallCollisions.left) {
                        overallCollisions.left = true;
                    }
                    if (collisions.right && !overallCollisions.right) {
                        overallCollisions.right = true;
                    }
                    if (collisions.top && !overallCollisions.top) {
                        overallCollisions.top = true;
                    }
                    if (collisions.bottom && !overallCollisions.bottom) {
                        overallCollisions.bottom = true;
                    }
                }

                if (collisionsExpandedLeft.left && !expandedCollisions.left) {
                    expandedCollisions.left = true;
                }
                if (collisionsExpandedRight.right && !expandedCollisions.right) {
                    expandedCollisions.right = true;
                }
                if (collisionsExpandedTop.top && !expandedCollisions.top) {
                    expandedCollisions.top = true;
                }
                if (collisionsExpandedBottom.bottom && !expandedCollisions.bottom) {
                    expandedCollisions.bottom = true;
                }
            }

            if (isColliding(overallCollisions)) {
                if (orientation !== 'right' && overallCollisions.right) {
                    container.width -= 1;
                }
                if (orientation !== 'left' && overallCollisions.left) {
                    container.width -= 1;
                    container.left += 1;
                }
                if (orientation !== 'bottom' && overallCollisions.bottom) {
                    container.height -= 1;
                }
                if (orientation !== 'top' && overallCollisions.top) {
                    container.height -= 1;
                    container.top += 1;
                }

                if (shouldHide(container)) {
                    container.width = container.height = MIN_SIDE;
                    container.left = container.top = -MIN_SIDE * .5;
                }

                done = false;
            } else {
                if (
                    orientation !== 'right' && !expandedCollisions.right &&
                    container.left + container.width < container.original.left + container.original.width
                ) {
                    container.width += 1;

                    done = false;
                }
                if (
                    orientation !== 'left' && !expandedCollisions.left &&
                    container.width < container.original.width && container.left !== container.original.left
                ) {
                    container.width += 1;
                    container.left -= 1;

                    done = false;
                }
                if (
                    orientation !== 'bottom' && !expandedCollisions.bottom &&
                    container.top + container.height < container.original.top + container.original.height
                ) {
                    container.height += 1;

                    done = false;
                }
                if (
                    orientation !== 'top' && !expandedCollisions.top &&
                    container.height < container.original.height && container.top !== container.original.top
                ) {
                    container.height += 1;
                    container.top -= 1;

                    done = false;
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
