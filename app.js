class Slider {

    /**
     * Creates a new instance of Slider class
     * 
     * @param {object} DOM container for slider
     */
    constructor({container}) {
        this.container = container;             // DOM container for slider
        this._currentValue = 0;                 // Slider current value
        this._minAngle = 36;                    // Slider minimum angle
        this._maxAngle = 324;                   // Slider maximum angle
        this._width = 200;                      // Slider width
        this._height = 200;                     // Slider length
        this._radius = 80;                      // Slider radius
        this._cx = this._width / 2;             // Slider center X coordinate
        this._cy = this._height / 2;            // Slider center Y coordinate
        this._tau = 2 * Math.PI;                // Tau constant
        this._arcThickness = 8;                 // Arc thickness
        this._arcStrokeColor = '#CCCCCC';       // Arc color for background slider
        this._circleThickness = 1;              // Circle thickness
        this._circleFillColor = '#FFFFFF';      // Circle color
        this._circleStrokeColor = '#CCCCCC';    // Circle stroke color
        this.mouseDown = false;                 // Is mouse down

        //Slider configuration
        this.slider = {
            min: 0,
            max: 10,
            step: 0.5,
            initialValue: 0,
            color: '#FF5733',
            handleFillColor: '#FCE7DC'
        };
    }

    /**
     * Gets the slider current value
     */
    getValue() {
        return this._currentValue;
    }

    /**
     * Draw slider on init
     */
    draw() {
        // Create SVG container
        this._svgContainer = this.container.appendChild(document.createElement('div'));

        // Create SVG
        const svg = this._svgContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        svg.setAttribute('viewBox', `0, 0, ${this._width}, ${this._height}`)
        svg.appendChild(this._drawSlider(svg));
        svg.appendChild(this._drawText());

        // Event listeners
        this._svgContainer.addEventListener('mousedown', this._mouseTouchStart.bind(this), false);
        this._svgContainer.addEventListener('touchstart', this._mouseTouchStart.bind(this), false);
        this._svgContainer.addEventListener('mousemove', this._mouseTouchMove.bind(this), false);
        this._svgContainer.addEventListener('touchmove', this._mouseTouchMove.bind(this), false);
        window.addEventListener('mouseup', this._mouseTouchEnd.bind(this), false);
        window.addEventListener('touchend', this._mouseTouchEnd.bind(this), false);
    }

    /**
     * Draw slider
     * 
     * @param {object} svg
     * @returns {object} slider group
     */
    _drawSlider(svg) {
        let sliderElement;

        // Calculate initial angle
        const initialAngle = this._calculateAngle(this.slider.initialValue);

        // Create a slider group
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('transform', `rotate(-90, ${this._cx}, ${this._cy})`);

        // Draw slider background
        sliderGroup.appendChild(this._drawArcPath(this._radius, this._maxAngle, this._arcThickness));

        // Draw slider ticks
        sliderElement = sliderGroup.appendChild(this._drawArcPath(this._radius - 4, this._maxAngle, this._arcThickness));
        sliderElement.style.strokeDasharray = '1 37.2';
        sliderElement.style.strokeDashoffset = '19.6';

        // Draw active slider background
        sliderElement = sliderGroup.appendChild(this._drawArcPath(this._radius, initialAngle, this._arcThickness));
        sliderElement.setAttribute('data-type', 'active');
        sliderElement.style.strokeWidth = (this._arcThickness / 2);
        sliderElement.style.stroke = this.slider.color;

        // Draw slider points
        this._drawPoints(sliderGroup);

        // Draw handle
        this._sliderHandle = sliderGroup.appendChild(this._drawCircle(initialAngle, this._arcThickness));
        this._sliderHandle.style.stroke = this.slider.color;
        this._sliderHandle.style.fill = this.slider.handleFillColor;

        return sliderGroup;
    }

    /**
     * Draw arc path
     *
     * @param {number} radius
     * @param {number} angle
     * @param {string} thickness
     * @returns {object} arc path
     */
    _drawArcPath(radius, angle, thickness) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this._describeArc(this._cx, this._cy, radius, this._minAngle, angle));
        path.style.stroke = this._arcStrokeColor;
        path.style.strokeWidth = thickness;
        path.style.fill = 'none';

        return path;
    }

    /**
     * Describe arc
     *
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {number} startAngle
     * @param {number} endAngle
     * @returns {string} path
     */
    _describeArc(x, y, radius, startAngle, endAngle) {
        let endAngleOriginal = endAngle,
            path, start, end, arcSweep;

        if (endAngleOriginal - startAngle === 360) {
            endAngle = 359;
        }

        start = this._polarToCartesian(x, y, radius, endAngle);
        end = this._polarToCartesian(x, y, radius, startAngle);
        arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

        path = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y
        ];

        if (endAngleOriginal - startAngle === 360) {
            path.push('z');
        }

        return path.join(' ');
    }

    /**
     * Transform polar to cartesian coordinates
     *
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} radius
     * @param {number} angleInDegrees in degrees
     * @returns {object} coordinates
     */
    _polarToCartesian(centerX, centerY, radius, angle) {
        const angleInRadians = angle * Math.PI / 180;
        const x = centerX + (radius * Math.cos(angleInRadians));
        const y = centerY + (radius * Math.sin(angleInRadians));

        return { x, y };
    }

    /**
     * Draw points
     *
     * @param {object} element
     */
    _drawPoints(element) {
        for (let i = this.slider.min; i <= this.slider.max; i++) {
            const pointAngle = this._calculateAngle(i);
            const point = this._drawCircle(pointAngle, this._arcThickness - 2);

            element.appendChild(point);
        }
    }

    /**
     * Calculate angle from value
     *
     * @param {number} value
     * @return {number} angle in degrees
     */
    _calculateAngle(value) {
        const maxNumOfSteps = (this.slider.max - this.slider.min) / this.slider.step;
        const offset = (this._maxAngle - this._minAngle) / maxNumOfSteps;

        return (value / this.slider.step * offset) + this._minAngle;
    }

    /**
     * Draw circle
     *
     * @param {number} initialAngle
     * @param {number} radius
     * @returns {object} circle
     */
    _drawCircle(initialAngle, radius) {
        const centerCoords = this._calculateCircleCenter(initialAngle * this._tau / 360, this._radius);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerCoords.x);
        circle.setAttribute('cy', centerCoords.y);
        circle.setAttribute('r', radius);
        circle.style.stroke = this._circleStrokeColor;
        circle.style.strokeWidth = this._circleThickness;
        circle.style.fill = this._circleFillColor;

        return circle;
    }

    /**
     * Calculate circle center
     *
     * @param {number} angle
     * @param {number} radius
     * @returns {object} coordinates
     */
    _calculateCircleCenter(angle, radius) {
        const x = this._cx + Math.cos(angle) * radius;
        const y = this._cy + Math.sin(angle) * radius;

        return { x, y };
    }

    /**
     * Draw text
     */
    _drawText() {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', this._cx);
        text.setAttribute('y', this._cy / 3);
        text.classList.add('sliderValue');
        text.style.textAnchor = 'middle';
        text.style.fontSize = '1.5em';
        text.textContent = this.slider.initialValue;

        return text;
    }

    /**
     * Mouse down/touch start event
     *
     * @param {object} e
     */
    _mouseTouchStart(e) {
        if (this.mouseDown) {
            return;
        }

        this.mouseDown = true;

        if (window.TouchEvent && e instanceof TouchEvent) {
            // Increase handle side on touch start event by 50%
            this._sliderHandle.setAttribute('r', (this._arcThickness * 1.5));
        }

        this._redrawSlider(this._getRelativeMouseOrTouchCoordinates(e));
    }

    /**
     * Mouse move/touch move event
     *
     * @param {object} e
     */
    _mouseTouchMove(e) {
        if (!this.mouseDown) {
            return;
        }

        e.preventDefault();
        this._redrawSlider(this._getRelativeMouseOrTouchCoordinates(e));
    }

    /**
     * Mouse up/touch end event
     *
     * @param {object} e
     */
    _mouseTouchEnd(e) {
        if (!this.mouseDown) {
            return;
        }

        if (window.TouchEvent && e instanceof TouchEvent) {
            // Reset handle side on touch end event
            this._sliderHandle.setAttribute('r', this._arcThickness);
        }

        this.mouseDown = false;
    }

    /**
     * Get mouse/touch coordinates relative to the top and left of the container
     *
     * @param {object} e event
     * @returns {object} relative mouse/touch coordinates
     */
    _getRelativeMouseOrTouchCoordinates(e) {
        const containerRect = this._svgContainer.getBoundingClientRect();
        let x, y, clientPosX, clientPosY;

        if (window.TouchEvent && e instanceof TouchEvent) {
            clientPosX = e.touches[0].pageX;
            clientPosY = e.touches[0].pageY;
        } else {
            clientPosX = e.clientX;
            clientPosY = e.clientY;
        }

        x = clientPosX - containerRect.left;
        y = clientPosY - containerRect.top;

        return { x, y };
    }

    /**
     * Redraw slider
     *
     * @param {object} rmc
     */
    _redrawSlider(rmc) {
        let currentAngle = this._calculateMouseAngle(rmc) * 0.999;
        const newValue = this._calculateValue(currentAngle);

        if (this._currentValue === newValue) {
            return;
        }

        // Recalculate angle from value
        this._currentValue = newValue;
        currentAngle = this._calculateAngle(newValue);

        // Redraw active path
        const activePath = this._svgContainer.querySelector('[data-type="active"]');
        activePath.setAttribute('d', this._describeArc(this._cx, this._cy, this._radius, this._minAngle, currentAngle));

        // Redraw handle
        const handleCenter = this._calculateCircleCenter(this._degreesToRadians(currentAngle), this._radius);
        this._sliderHandle.setAttribute('cx', handleCenter.x);
        this._sliderHandle.setAttribute('cy', handleCenter.y);

        // Redraw text
        this.container.querySelector('.sliderValue').textContent = newValue;
    }

    /**
     * Calculate mouse angle in radians
     *
     * @param {object} rmc relative mouse/touch coordinates
     * @returns {number} angle in radians
     */
    _calculateMouseAngle(rmc) {
        const containerRect = this._svgContainer.getBoundingClientRect();
        const angle = Math.atan2(rmc.y - (containerRect.height / 2), rmc.x - (containerRect.width / 2));

        if (angle > - this._tau / 2 && angle < - this._tau / 4) {
            return angle + this._tau * 1.25;
        } else {
            return angle + this._tau * 0.25;
        }
    }

    /**
     * Calculate value from current angle
     *
     * @param {number} angle
     */
    _calculateValue(angle) {
        angle = this._radiansToDegrees(angle);

        if (angle <= this._minAngle) {
            return this.slider.min;
        } else if (angle >= this._maxAngle) {
            return this.slider.max;
        }

        const maxNumOfSteps = (this.slider.max - this.slider.min) / this.slider.step;
        const offset = (this._maxAngle - this._minAngle) / maxNumOfSteps;
        const numOfSteps = Math.round(Math.max((angle - this._minAngle), 0) / offset);

        return (this.slider.min + numOfSteps * this.slider.step);
    }

    /**
     * Transform radians to degrees
     *
     * @param {number} angle in radians
     * @returns {number} angle in degrees
     */
    _radiansToDegrees(angle) {
        return angle * 180 / Math.PI;
    }

    /**
     * Transform degrees to radians
     *
     * @param {number} angle in degrees
     * @returns {number} angle in radians
     */
    _degreesToRadians(angle) {
        return angle * Math.PI / 180;
    }
}
