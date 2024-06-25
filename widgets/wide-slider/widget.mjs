/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library.
 * The wide-slider widget.
 * This widget allows multiple items to be viewed at once. 
 * Then, the currently focused item could be cycled.
 */

import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import { Widget, hc } from "../../lib/widget/index.mjs";

const realIndex = Symbol()
const xTransform = Symbol()


/**
 */
export default class WideSlider extends Widget {

    constructor() {
        super();

        this.html = hc.spawn(
            {
                classes: WideSlider.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='items'></div>
                    </div>
                `
            }
        );

        /** @type {HTMLElement[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.items',
                property: 'items',
                childType: 'html'
            }
        );

        hc.watchToCSS(
            {
                source: this.html,
                apply: new DelayedAction(() => {
                    this.index = this.index;
                }, 250),
                watch: {
                    dimension: 'width'
                },
                signal: this.destroySignal
            }
        );

        // const scrollAdjust = new DelayedAction(() => {
        //     this.index = this.leastVisibleElementIndex
        // }, 700)
        // this.html.addEventListener('scrollend', scrollAdjust)
        // this.html.addEventListener('touchstart', scrollAdjust)

        this.waitTillDOMAttached().then(() => {
            const observer = new ResizeObserver(new DelayedAction(() => {
                this.index = this.index
            }, 2500, 5000));
            observer.observe(this.html.$(':scope >.container >.items'), { box: 'border-box' })
            this.destroySignal.addEventListener('abort', () => observer.disconnect(), { once: true })
        });

        this.html.$(':scope >.container >.items').addEventListener('wheel', new DelayedAction((event) => {
            const deltaX = Math.abs(event.deltaX);
            if (deltaX <= Math.abs(event.deltaY) || deltaX < 20) return;
            this.index += event.deltaX > 0 ? 1 : -1
        }, 50, 1000));


    }

    /**
     * @param {number} index
     */
    set index(index) {
        const item = this.items[index]
        if (!item) {
            //Change the real index, since the item wasn't found
            return;
        }
        // Scroll to a position gotten by computing the total width of all elements before it.
        const gap = index == 0 ? 0 : new Number(window.getComputedStyle(item.parentElement).rowGap.split(/[^0-9.]/)[0] || '0').valueOf();

        item.parentElement.scrollTo({
            left: [
                // Just getting widths
                ...this.items.slice(0, index).map(x => x.getBoundingClientRect()).map(rect => rect.width)
                , 0]
                // and then summing them
                .reduce((a, b) => a + b) + (gap * index),
            behavior: 'smooth'
        })
        // This hc-wide-slider-spotlight class name can be exploited by other widgets to style the widget that is supposedly in the user's view
        this.items.forEach(elm => elm.classList.toggle('hc-wide-slider-spotlight', elm == item))
        this[realIndex] = index
    }
    get [xTransform]() {
        return new Number(/translateX\((.+)[a-zA-Z]{2}\)/.exec(window.getComputedStyle(this.html).getPropertyValue('--hc-wide-slider-transform'))?.[1] || 0).valueOf() || 0
    }

    /**
     * @returns {number}
     */
    get index() {
        return this[realIndex] || 0
    }

    /**
     * @readonly
     */
    get leastVisibleElementIndex() {
        return this.items.map((item, index) => {

            const iRect = item.getBoundingClientRect();
            const pRect = item.parentElement.getBoundingClientRect();
            /**
             * 
             * @param {DOMRect} rec 
             */
            const center = (rec) => rec.left + (rec.width / 2)
            const offset = (
                center(iRect) - pRect.left
            )
            return { index, offset }
        }).filter(x => x.offset > 0).sort((a, b) => a.offset > b.offset ? 1 : a.offset == b.offset ? 0 : -1)[0]?.index || 0
    }

    /** @readonly */
    static get classList() {
        return ['hc-wide-slider']
    }

}