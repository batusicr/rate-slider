class Slider {

    /**
     * @constructor
     * 
     * @param {string} DOM selector
     * @param {array} sliders
     */
    constructor({ DOMselector }) {
        this.DOMselector = DOMselector;
        this.container = document.querySelector(this.DOMselector);  // Slider container
        this.minAngle = 36;                                         // Slider minimum angle
        this.maxAngle = 324;                                        // Slider maximum angle
        this.sliderRadius = 80;                                     // Slider radius
        this.sliderWidth = 200;                                     // Slider width
        this.sliderHeight = 200;                                    // Slider length
        this.cx = this.sliderWidth / 2;                             // Slider center X coordinate
        this.cy = this.sliderHeight / 2;                            // Slider center Y coordinate
        this.tau = 2 * Math.PI;                                     // Tau constant

        this.arcFractionThickness = 8;                              // Arc fraction thickness
        this.arcActiveFractionThickness = 4;                        // Arc active fraction thickness
        this.arcBgFractionColor = '#CCCCCC';                        // Arc fraction color for background slider
        this.handleFillColor = '#fafafa';                           // Slider handle fill color
        this.handleStrokeColor = '#888888';                         // Slider handle stroke color
        this.handleStrokeThickness = 1;                             // Slider handle stroke thickness
        this.mouseDown = false;                                     // Is mouse down
        this.currentValue = 0;                                      // Current value

        //Slider configuration
        this.slider = {
            color: '#FF5733',
            min: 0,
            max: 10,
            step: 0.5,
            initialValue: 0
        };
    }

    /**
     * Gets slider current value
     */
    getValue() {
        return this.currentValue;
    }

    /**
     * Draw slider on init
     */
    draw() {
        // Create SVG container
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('rate-slider');
        this.container.appendChild(svgContainer);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0, 0, ${this.sliderWidth}, ${this.sliderHeight}`)
        svgContainer.appendChild(svg);

        // Draw slider
        svg.appendChild(this.drawSlider(svg));

        //Draw text
        svg.appendChild(this.drawText());

        // Event listeners
        svgContainer.addEventListener('mousedown', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('touchstart', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('mousemove', this.mouseTouchMove.bind(this), false);
        svgContainer.addEventListener('touchmove', this.mouseTouchMove.bind(this), false);
        window.addEventListener('mouseup', this.mouseTouchEnd.bind(this), false);
        window.addEventListener('touchend', this.mouseTouchEnd.bind(this), false);
    }

    /**
     * Draw slider
     * 
     * @param {object} svg
     * @returns {element} slider group
     */
    drawSlider(svg) {
        let path;

        // Create a slider group
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.cx + ',' + this.cy + ')');

        // Calculate initial angle
        const initialAngle = Math.floor((this.slider.initialValue / (this.slider.max - this.slider.min)) * 360) + this.minAngle;

        // Draw slider background
        sliderGroup.appendChild(this.drawArcPath(this.arcBgFractionColor, this.sliderRadius, this.maxAngle, 'bg'));

        // Draw slider ticks
        path = sliderGroup.appendChild(this.drawArcPath(this.arcBgFractionColor, this.sliderRadius - 4, this.maxAngle, 'bg'));
        path.style.strokeDasharray = '1 37.2';
        path.style.strokeDashoffset = '19.6';

        // Draw active slider background
        path = sliderGroup.appendChild(this.drawArcPath(this.slider.color, this.sliderRadius, initialAngle, 'active'));
        path.style.strokeWidth = this.arcActiveFractionThickness;

        // Draw slider points
        this.drawPoints(sliderGroup);

        // Draw handle
        path = sliderGroup.appendChild(this.drawHandle(initialAngle, this.arcFractionThickness));
        path.classList.add('sliderHandle');
        path.style.stroke = this.slider.color;
        path.style.fill = '#fce7dc';

        return sliderGroup;
    }

    /**
     * Output arch path
     *
     * @param {string} color
     * @param {radius} radius
     * @param {number} angle
     * @param {string} type
     * @returns {element} path
     */
    drawArcPath(color, radius, angle, type) {
        // Slider path class
        const pathClass = (type === 'active') ? 'sliderSinglePathActive' : 'sliderSinglePath';

        // Create svg path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add(pathClass);
        path.setAttribute('d', this.describeArc(this.cx, this.cy, radius, this.minAngle, angle));
        path.style.stroke = color;
        path.style.strokeWidth = this.arcFractionThickness;
        path.style.fill = 'none';

        return path;
    }

    drawPoints(container) {
        for (let i = this.slider.min; i <= this.slider.max; i += 2*this.slider.step) {
            const point = this.drawHandle(this.calculateAngle(i), this.arcFractionThickness - 2);
            point.style.stroke = this.arcBgFractionColor;
            container.appendChild(point);
        }
    }

    /**
     * Draw handle for single slider
     *
     * @param {number} initialAngle
     * @param {radius} radius
     * @returns {element} handle
     */
    drawHandle(initialAngle, radius) {
        // Calculate handle center
        const handleCenter = this.calculateHandleCenter(initialAngle * this.tau / 360, this.sliderRadius);

        // Draw handle
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);
        handle.setAttribute('r', radius);
        handle.style.stroke = this.handleStrokeColor;
        handle.style.strokeWidth = this.handleStrokeThickness;
        handle.style.fill = this.handleFillColor;

        return handle;
    }

    /**
     * Draw text for slider
     */
    drawText() {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', this.cx);
        text.setAttribute('y', '35');
        text.classList.add('sliderValue');
        text.style.textAnchor = 'middle';
        text.style.fontSize = '1.5em';
        text.textContent = this.slider.initialValue;

        return text;
    }

    /**
     * Redraw slider
     *
     * @param {obj} rmc
     */
    redrawSlider(rmc) {
        const sliderGroup = this.container.querySelector('.rate-slider g');
        const activePath = sliderGroup.querySelector('.sliderSinglePathActive');
        let currentAngle = this.calculateMouseAngle(rmc) * 0.999;
        const newValue = this.calculateValue(currentAngle);

        if (this.currentValue === newValue) {
            return;
        }

        this.currentValue = newValue;
        currentAngle = this.calculateAngle(newValue);

        // Redraw active path
        activePath.setAttribute('d', this.describeArc(this.cx, this.cy, this.sliderRadius, this.minAngle, currentAngle));

        // Redraw handle
        const handle = sliderGroup.querySelector('.sliderHandle');
        const handleCenter = this.calculateHandleCenter(this.degreesToRadians(currentAngle), this.sliderRadius);
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);

        // Redraw text
        const text = this.container.querySelector('.sliderValue');
        text.textContent = newValue;
    }

    /**
     * Calculate value from current angle
     *
     * @param {number} currentAngle
     */
    calculateValue(currentAngle) {
        currentAngle = this.radiansToDegrees(currentAngle);

        if (currentAngle <= this.minAngle) {
            return this.slider.min;
        } else if (currentAngle >= this.maxAngle) {
            return this.slider.max;
        }

        const maxNumOfSteps = (this.slider.max - this.slider.min) / this.slider.step;
        const offset = (this.maxAngle - this.minAngle) / maxNumOfSteps;
        const numOfSteps = Math.round(Math.max((currentAngle - this.minAngle), 0) / offset);

        return (this.slider.min + numOfSteps * this.slider.step);
    }

    /**
     * Calculate angle from current value
     *
     * @param {number} currentValue
     */
    calculateAngle(currentValue) {
        const maxNumOfSteps = (this.slider.max - this.slider.min) / this.slider.step;
        const offset = (this.maxAngle - this.minAngle) / maxNumOfSteps;

        return (currentValue / this.slider.step * offset) + this.minAngle;
    }

    /**
     * Mouse down / Touch start event
     *
     * @param {object} e
     */
    mouseTouchStart(e) {
        if (this.mouseDown) return;
        this.mouseDown = true;

        if (e instanceof TouchEvent) {
            const sliderGroup = this.container.querySelector('.rate-slider g');
            const handle = sliderGroup.querySelector('.sliderHandle');
            handle.setAttribute('r', this.arcFractionThickness * 1.5);
        }

        const rmc = this.getRelativeMouseOrTouchCoordinates(e);
        this.redrawSlider(rmc);
    }

    /**
     * Mouse move / touch move event
     *
     * @param {object} e
     */
    mouseTouchMove(e) {
        if (!this.mouseDown) return;
        e.preventDefault();
        const rmc = this.getRelativeMouseOrTouchCoordinates(e);
        this.redrawSlider(rmc);
    }

    /**
     * Mouse move / touch move event
     * Deactivate slider
     * 
     */
    mouseTouchEnd() {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        const sliderGroup = this.container.querySelector('.rate-slider g');
        const handle = sliderGroup.querySelector('.sliderHandle');
        handle.setAttribute('r', this.arcFractionThickness);
    }

    /**
     * Helper function - describe arc
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} startAngle 
     * @param {number} endAngle 
     * 
     * @returns {string} path
     */
    describeArc (x, y, radius, startAngle, endAngle) {
        let endAngleOriginal = endAngle,
            path, start, end, arcSweep;

        if (endAngleOriginal - startAngle === 360) {
            endAngle = 359;
        }

        start = this.polarToCartesian(x, y, radius, endAngle);
        end = this.polarToCartesian(x, y, radius, startAngle);
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
     * Helper function - polar to cartesian transformation
     * 
     * @param {number} centerX 
     * @param {number} centerY 
     * @param {number} radius 
     * @param {number} angleInDegrees 
     * 
     * @returns {object} coords
     */
     polarToCartesian (centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = angleInDegrees * Math.PI / 180;
        const x = centerX + (radius * Math.cos(angleInRadians));
        const y = centerY + (radius * Math.sin(angleInRadians));

        return { x, y };
    }

    /**
     * Helper function - calculate handle center
     * 
     * @param {number} angle 
     * @param {number} radius
     * 
     * @returns {object} coords 
     */
    calculateHandleCenter (angle, radius) {
        const x = this.cx + Math.cos(angle) * radius;
        const y = this.cy + Math.sin(angle) * radius;

        return { x, y };
    }

    /**
     * Get mouse/touch coordinates relative to the top and left of the container
     *  
     * @param {object} e event
     * @returns {object} relative mouse/touch coordinates
     */ 
    getRelativeMouseOrTouchCoordinates(e) {
        const containerRect = this.container.querySelector('.rate-slider').getBoundingClientRect();
        let x, y, clientPosX, clientPosY;
 
        if (e instanceof TouchEvent) {
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
     * Calculate mouse angle in radians
     * 
     * @param {object} rmc relative mouse/touch coordinates
     * @returns {number} angle in radians
     */
    calculateMouseAngle(rmc) {
        const containerRect = this.container.querySelector('.rate-slider').getBoundingClientRect();
        const angle = Math.atan2(rmc.y - (containerRect.height / 2), rmc.x - (containerRect.width / 2));

        if (angle > - this.tau / 2 && angle < - this.tau / 4) {
            return angle + this.tau * 1.25;
        } else {
            return angle + this.tau * 0.25;
        }
    }

    /**
     * Transform radians to degrees
     *
     * @param {number} angle in radians
     * @returns {number} angle in degrees
     */
    radiansToDegrees(angle) {
        return angle * 180 / Math.PI;
    }

    /**
     * Transform degrees to radians
     *
     * @param {number} angle in degrees
     * @returns {number} angle in radians
     */
    degreesToRadians(angle) {
        return angle * Math.PI / 180;
    }
}

  
  