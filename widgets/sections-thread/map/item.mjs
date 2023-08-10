/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The sections-thread/map widget
 * This sub-widget (item), represents an item on the map
 */


import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
/**
 * This widget is reponsible for the layout and behaviour of each of the items
 *  on the reading map 
 * @extends Widget<Item>
 */
export default class Item extends Widget {


    constructor({ label } = {}) {

        super();

        super.html = hc.spawn({
            classes: Item.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='dot'></div>
                        <div class='label'></div>
                    </div>
                </div>
            `
        });

        /** @type {string} */ this.label
        this.htmlProperty('.container >.main >.label', 'label', 'innerHTML')

        Object.assign(this, arguments[0])
    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-sections-thread-map-item'];
    }
}