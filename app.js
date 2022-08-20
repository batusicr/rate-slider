class Slider {

    /**
     * @constructor
     * 
     * @param {string} DOM selector
     * @param {array} sliders
     */
    constructor({ DOMselector, slider }) {
        this.DOMselector = DOMselector;
        this.container = document.querySelector(this.DOMselector);  // Slider container
        this.slider = slider;                                       // Slider options
        this.minAngle = 36;                                         // Slider minimum angle
        this.maxAngle = 324;                                        // Slider maximum angle
        this.sliderRadius = 150;                                    // Slider radius
        this.sliderWidth = 400;                                     // Slider width
        this.sliderHeight = 400;                                    // Slider length
        this.cx = this.sliderWidth / 2;                             // Slider center X coordinate
        this.cy = this.sliderHeight / 2;                            // Slider center Y coordinate
        this.tau = 2 * Math.PI;                                     // Tau constant
        this.arcFractionThickness = 15;                             // Arc fraction thickness
        this.arcBgFractionColor = '#D8D8D8';                        // Arc fraction color for background slider
        this.handleFillColor = '#fff';                              // Slider handle fill color
        this.handleStrokeColor = '#888888';                         // Slider handle stroke color
        this.handleStrokeThickness = 3;                             // Slider handle stroke thickness    
        this.mouseDown = false;                                     // Is mouse down
        this.currentValue = 0;                                      // Current value
    }

    /**
     * Draw slider on init
     * 
     */
    draw() {
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0, 0, ${this.sliderWidth}, ${this.sliderHeight}`)

        // Create SVG container
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('rate-slider');
        svgContainer.appendChild(svg);

        this.container.appendChild(svgContainer);

        // Draw slider
        this.drawSlider(svg);

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
     */
    drawSlider(svg) {
        const slider = this.slider;

        // Default slider options
        slider.color = slider.color ?? '#FF5733';
        slider.min = 0;
        slider.max = 10;
        slider.step = 0.5;
        slider.initialValue = 0;

        // Create a single slider group - holds all paths and handle
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('class', 'sliderSingle');
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.cx + ',' + this.cy + ')');
        sliderGroup.setAttribute('rad', this.sliderRadius);
        svg.appendChild(sliderGroup);

        // Calculate initial angle
        const initialAngle = Math.floor((slider.initialValue / (slider.max - slider.min)) * 360) + this.minAngle;
        
        // Draw background and active arc paths
        this.drawArcPath(this.arcBgFractionColor, this.sliderRadius, this.maxAngle, 'bg', sliderGroup);
        this.drawArcPath(slider.color, this.sliderRadius, initialAngle, 'active', sliderGroup);

        // Draw handle
        this.drawHandle(slider, initialAngle, sliderGroup);

        //Draw text
        this.drawText(sliderGroup);
    }

    /**
     * Output arch path
     * 
     * @param {number} cx 
     * @param {number} cy 
     * @param {string} color 
     * @param {number} angle
     * @param {string} type 
     */
    drawArcPath( color, radius, angle, type, group ) {

        // Slider path class
        const pathClass = (type === 'active') ? 'sliderSinglePathActive' : 'sliderSinglePath';

        // Create svg path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add(pathClass);
        path.setAttribute('d', this.describeArc(this.cx, this.cy, radius, this.minAngle, angle));
        path.style.stroke = color;
        path.style.strokeWidth = this.arcFractionThickness;
        path.style.fill = 'none';
        group.appendChild(path);
    }

    /**
     * Draw handle for single slider
     * 
     * @param {object} slider 
     * @param {number} initialAngle 
     * @param {group} group 
     */
    drawHandle(slider, initialAngle, group) {

        // Calculate handle center
        const handleCenter = this.calculateHandleCenter(initialAngle * this.tau / 360, this.sliderRadius);

        // Draw handle
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);
        handle.setAttribute('r', this.arcFractionThickness);
        handle.classList.add('sliderHandle');
        handle.style.stroke = this.handleStrokeColor;
        handle.style.strokeWidth = this.handleStrokeThickness;
        handle.style.fill = this.handleFillColor;
        group.appendChild(handle);
    }

    /**
     * Draw text for slider
     *
     * @param {group} group
     */
    drawText(group) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('transform', 'rotate(90, 0, 0)');
        text.setAttribute('x', '200');
        text.setAttribute('y', '-350');
        text.classList.add('sliderValue');
        text.style.textAnchor = 'middle';
        text.style.fontSize = '3em';
        text.textContent = this.slider.initialValue;
        group.appendChild(text);
    }

    /**
     * Redraw slider
     *
     * @param {obj} rmc
     */
    redrawSlider(rmc) {
        const sliderGroup = this.container.querySelector('.rate-slider g')
        const activePath = sliderGroup.querySelector('.sliderSinglePathActive');
        const radius = +sliderGroup.getAttribute('rad');
        let currentAngle = this.calculateMouseAngle(rmc) * 0.999;
        const newValue = this.calculateValue(currentAngle);

        if (this.currentValue === newValue) {
            return;
        }

        this.currentValue = newValue;
        currentAngle = this.calculateAngle(newValue);

        // Redraw active path
        activePath.setAttribute('d', this.describeArc(this.cx, this.cy, radius, this.minAngle, this.radiansToDegrees(currentAngle)));

        // Redraw handle
        const handle = sliderGroup.querySelector('.sliderHandle');
        const handleCenter = this.calculateHandleCenter(currentAngle, radius);
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);

        // Redraw text
        const text = sliderGroup.querySelector('.sliderValue');
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

        return this.degreesToRadians((currentValue / this.slider.step * offset) + this.minAngle);
    }

    /**
     * Mouse down / Touch start event
     * 
     * @param {object} e 
     */
    mouseTouchStart(e) {
        if (this.mouseDown) return;
        this.mouseDown = true;
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

  
  