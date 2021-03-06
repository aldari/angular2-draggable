import { Directive, ElementRef, EventEmitter, HostListener, Input, NgModule, Output, Renderer2 } from '@angular/core';

class Position {
    /**
     * @param {?} x
     * @param {?} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    static fromEvent(e) {
        return new Position(e.clientX, e.clientY);
    }
    /**
     * @param {?} p
     * @return {?}
     */
    add(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    }
    /**
     * @param {?} p
     * @return {?}
     */
    subtract(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    }
    /**
     * @return {?}
     */
    reset() {
        this.x = 0;
        this.y = 0;
        return this;
    }
    /**
     * @param {?} p
     * @return {?}
     */
    set(p) {
        this.x = p.x;
        this.y = p.y;
        return this;
    }
}
class AngularDraggableDirective {
    /**
     * @param {?} el
     * @param {?} renderer
     */
    constructor(el, renderer) {
        this.el = el;
        this.renderer = renderer;
        this.allowDrag = true;
        this.moving = false;
        this.orignal = null;
        this.oldTrans = new Position(0, 0);
        this.tempTrans = new Position(0, 0);
        this.oldZIndex = '';
        this.oldPosition = '';
        this._zIndex = '';
        this.started = new EventEmitter();
        this.stopped = new EventEmitter();
        this.edge = new EventEmitter();
        this.lastPosition = new EventEmitter();
        /**
         * Whether to limit the element stay in the bounds
         */
        this.inBounds = false;
        /**
         * Whether the element should use it's previous drag position on a new drag event.
         */
        this.trackPosition = true;
        /**
         * Input css scale transform of element so translations are correct
         */
        this.scale = 1;
        /**
         * Whether to prevent default event
         */
        this.preventDefaultEvent = false;
        this.X = 0;
        this.Y = 0;
    }
    /**
     * Set z-index when not dragging
     * @param {?} setting
     * @return {?}
     */
    set zIndex(setting) {
        this.renderer.setStyle(this.el.nativeElement, 'z-index', setting);
        this._zIndex = setting;
    }
    /**
     * @param {?} setting
     * @return {?}
     */
    set ngDraggable(setting) {
        if (setting !== undefined && setting !== null && setting !== '') {
            this.allowDrag = !!setting;
            let /** @type {?} */ element = this.handle ? this.handle : this.el.nativeElement;
            if (this.allowDrag) {
                this.renderer.addClass(element, 'ng-draggable');
            }
            else {
                this.renderer.removeClass(element, 'ng-draggable');
            }
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        if (this.allowDrag) {
            let /** @type {?} */ element = this.handle ? this.handle : this.el.nativeElement;
            this.renderer.addClass(element, 'ng-draggable');
        }
        this.orignal = new Position(0, 0);
        this.pickUp();
        this.moveTo(new Position(this.X, this.Y));
        this.putBack();
    }
    /**
     * @return {?}
     */
    resetPosition() {
        this.oldTrans.reset();
        this.tempTrans.reset();
        this.transform();
    }
    /**
     * @param {?} p
     * @return {?}
     */
    moveTo(p) {
        if (this.orignal) {
            p.subtract(this.orignal);
            this.tempTrans.set(p);
            this.transform();
            if (this.bounds) {
                this.edge.emit(this.boundsCheck());
            }
        }
    }
    /**
     * @return {?}
     */
    transform() {
        let /** @type {?} */ value = `translate(${this.tempTrans.x + this.oldTrans.x}px, ${this.tempTrans.y + this.oldTrans.y}px)`;
        if (this.scale !== 1) {
            value += ` scale(${this.scale})`;
        }
        this.renderer.setStyle(this.el.nativeElement, 'transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-webkit-transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-ms-transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-moz-transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-o-transform', value);
    }
    /**
     * @return {?}
     */
    pickUp() {
        // get old z-index:
        this.oldZIndex = this.el.nativeElement.style.zIndex ? this.el.nativeElement.style.zIndex : '';
        if (window) {
            this.oldZIndex = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue('z-index');
        }
        if (this.zIndexMoving) {
            this.renderer.setStyle(this.el.nativeElement, 'z-index', this.zIndexMoving);
        }
        if (!this.moving) {
            this.started.emit(this.el.nativeElement);
            this.moving = true;
        }
    }
    /**
     * @return {?}
     */
    boundsCheck() {
        if (this.bounds) {
            let /** @type {?} */ boundary = this.bounds.getBoundingClientRect();
            let /** @type {?} */ elem = this.el.nativeElement.getBoundingClientRect();
            let /** @type {?} */ result = {
                'top': boundary.top < elem.top,
                'right': boundary.right > elem.right,
                'bottom': boundary.bottom > elem.bottom,
                'left': boundary.left < elem.left
            };
            if (this.inBounds) {
                if (!result.top) {
                    this.tempTrans.y -= elem.top - boundary.top;
                }
                if (!result.bottom) {
                    this.tempTrans.y -= elem.bottom - boundary.bottom;
                }
                if (!result.right) {
                    this.tempTrans.x -= elem.right - boundary.right;
                }
                if (!result.left) {
                    this.tempTrans.x -= elem.left - boundary.left;
                }
                this.transform();
            }
            return result;
        }
    }
    /**
     * @return {?}
     */
    putBack() {
        if (this._zIndex) {
            this.renderer.setStyle(this.el.nativeElement, 'z-index', this._zIndex);
        }
        else if (this.zIndexMoving) {
            if (this.oldZIndex) {
                this.renderer.setStyle(this.el.nativeElement, 'z-index', this.oldZIndex);
            }
            else {
                this.el.nativeElement.style.removeProperty('z-index');
            }
        }
        if (this.moving) {
            this.stopped.emit(this.el.nativeElement);
            this.lastPosition.emit(this.oldTrans);
            if (this.bounds) {
                this.edge.emit(this.boundsCheck());
            }
            this.moving = false;
            if (this.trackPosition) {
                this.oldTrans.add(this.tempTrans);
            }
            this.tempTrans.reset();
            if (!this.trackPosition) {
                this.transform();
            }
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onMouseDown(event) {
        // 1. skip right click;
        // 2. if handle is set, the element can only be moved by handle
        if (event.button === 2 || (this.handle !== undefined && !this.checkHandleTarget(event.target, this.handle))) {
            return;
        }
        if (this.preventDefaultEvent) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.orignal = Position.fromEvent(event);
        this.pickUp();
    }
    /**
     * @param {?} target
     * @param {?} element
     * @return {?}
     */
    checkHandleTarget(target, element) {
        // Checks if the target is the element clicked, then checks each child element of element as well
        // Ignores button clicks
        // Ignore elements of type button
        if (element.tagName === 'BUTTON') {
            return false;
        }
        // If the target was found, return true (handle was found)
        if (element === target) {
            return true;
        }
        // Recursively iterate this elements children
        for (let /** @type {?} */ child in element.children) {
            if (element.children.hasOwnProperty(child)) {
                if (this.checkHandleTarget(target, element.children[child])) {
                    return true;
                }
            }
        }
        // Handle was not found in this lineage
        // Note: return false is ignore unless it is the parent element
        return false;
    }
    /**
     * @return {?}
     */
    onMouseUp() {
        this.putBack();
    }
    /**
     * @return {?}
     */
    onMouseLeave() {
        this.putBack();
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onMouseMove(event) {
        if (this.moving && this.allowDrag) {
            if (this.preventDefaultEvent) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.moveTo(Position.fromEvent(event));
        }
    }
    /**
     * @return {?}
     */
    onTouchEnd() {
        this.putBack();
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onTouchStart(event) {
        if (this.handle !== undefined && !this.checkHandleTarget(event.target, this.handle)) {
            return;
        }
        if (this.preventDefaultEvent) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.orignal = Position.fromEvent(event.changedTouches[0]);
        this.pickUp();
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onTouchMove(event) {
        if (this.moving && this.allowDrag) {
            if (this.preventDefaultEvent) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.moveTo(Position.fromEvent(event.changedTouches[0]));
        }
    }
}
AngularDraggableDirective.decorators = [
    { type: Directive, args: [{
                selector: '[ngDraggable]',
                exportAs: 'ngDraggable'
            },] },
];
/**
 * @nocollapse
 */
AngularDraggableDirective.ctorParameters = () => [
    { type: ElementRef, },
    { type: Renderer2, },
];
AngularDraggableDirective.propDecorators = {
    'started': [{ type: Output },],
    'stopped': [{ type: Output },],
    'edge': [{ type: Output },],
    'lastPosition': [{ type: Output },],
    'handle': [{ type: Input },],
    'bounds': [{ type: Input },],
    'zIndexMoving': [{ type: Input },],
    'zIndex': [{ type: Input },],
    'inBounds': [{ type: Input },],
    'trackPosition': [{ type: Input },],
    'scale': [{ type: Input },],
    'preventDefaultEvent': [{ type: Input },],
    'ngDraggable': [{ type: Input },],
    'X': [{ type: Input },],
    'Y': [{ type: Input },],
    'onMouseDown': [{ type: HostListener, args: ['mousedown', ['$event'],] },],
    'onMouseUp': [{ type: HostListener, args: ['document:mouseup',] },],
    'onMouseLeave': [{ type: HostListener, args: ['document:mouseleave',] },],
    'onMouseMove': [{ type: HostListener, args: ['document:mousemove', ['$event'],] },],
    'onTouchEnd': [{ type: HostListener, args: ['document:touchend',] },],
    'onTouchStart': [{ type: HostListener, args: ['touchstart', ['$event'],] },],
    'onTouchMove': [{ type: HostListener, args: ['document:touchmove', ['$event'],] },],
};

class AngularDraggableModule {
}
AngularDraggableModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    AngularDraggableDirective
                ],
                exports: [
                    AngularDraggableDirective
                ]
            },] },
];
/**
 * @nocollapse
 */
AngularDraggableModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { AngularDraggableModule, AngularDraggableDirective };
//# sourceMappingURL=angular2-draggable.js.map
