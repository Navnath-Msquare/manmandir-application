import { Directive, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';

@Directive({
    selector: '[swipeSegment]'
})

export class SwipeSegmentDirective implements OnInit {
    el: HTMLElement;

    @Input() tabsList: Array<string> = [];
    @Input() currentTab: string = '';
    @Output() tabChanged: EventEmitter<string> = new EventEmitter<string>();

    constructor(public _el: ElementRef,private gestureCtrl: GestureController) {
        this.el = _el.nativeElement;
    }

    ngOnInit() {
        const gesture: Gesture = this.gestureCtrl.create({
            el: this.el,
            gestureName: 'my-gesture',
            onMove: ev => this.swipeHandler(ev)
        }, true);
    }

    swipeHandler(event:any) {
        if (event.direction == '2') {
            // move forward
            const currentIndex = this.tabsList.indexOf(this.currentTab),
                nextIndex = currentIndex + 1;

            if (nextIndex < this.tabsList.length) {
                this.currentTab = this.tabsList[nextIndex];
                this.tabChanged.emit(this.currentTab);
            }
        } else if (event.direction == '4') {
            // move backward
            const currentIndex = this.tabsList.indexOf(this.currentTab),
                nextIndex = currentIndex - 1;

            if (nextIndex >= 0) {
                this.currentTab = this.tabsList[nextIndex];
                this.tabChanged.emit(this.currentTab);
            }
        }
    }
}