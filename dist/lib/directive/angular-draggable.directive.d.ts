import { ElementRef, Renderer2, OnInit, EventEmitter } from '@angular/core';
export declare class AngularDraggableDirective implements OnInit {
    private el;
    private renderer;
    private allowDrag;
    private moving;
    private orignal;
    private oldTrans;
    private tempTrans;
    private oldZIndex;
    private oldPosition;
    private _zIndex;
    started: EventEmitter<any>;
    stopped: EventEmitter<any>;
    edge: EventEmitter<any>;
    lastPosition: EventEmitter<any>;
    /** Make the handle HTMLElement draggable */
    handle: HTMLElement;
    /** Set the bounds HTMLElement */
    bounds: HTMLElement;
    /** Set z-index when dragging */
    zIndexMoving: string;
    /** Set z-index when not dragging */
    zIndex: string;
    /** Whether to limit the element stay in the bounds */
    inBounds: boolean;
    /** Whether the element should use it's previous drag position on a new drag event. */
    trackPosition: boolean;
    /** Input css scale transform of element so translations are correct */
    scale: number;
    /** Whether to prevent default event */
    preventDefaultEvent: boolean;
    ngDraggable: any;
    X: number;
    Y: number;
    constructor(el: ElementRef, renderer: Renderer2);
    ngOnInit(): void;
    resetPosition(): void;
    private moveTo(p);
    private transform();
    private pickUp();
    private boundsCheck();
    private putBack();
    onMouseDown(event: any): void;
    checkHandleTarget(target: Element, element: Element): boolean;
    onMouseUp(): void;
    onMouseLeave(): void;
    onMouseMove(event: any): void;
    onTouchEnd(): void;
    onTouchStart(event: any): void;
    onTouchMove(event: any): void;
}
