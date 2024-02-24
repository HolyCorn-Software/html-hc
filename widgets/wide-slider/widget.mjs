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
        )


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
        const paddingLeft = new Number(window.getComputedStyle(this.html.$('.container >.items')).paddingLeft.split(/[^0-9_.]/)[0]).valueOf()
        const offset = item.getBoundingClientRect().left - item.parentElement.getBoundingClientRect().left - paddingLeft
        this.html.style.setProperty('--hc-wide-slider-transform', `translateX(${this[xTransform] - offset}px)`)
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

    /** @readonly */
    static get classList() {
        return ['hc-wide-slider']
    }

}