/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The sections-thread widget
 * This sub widget (map), is the part of the sections-thread widget, that shows the 
 * reader's current position
 */



import Item from "./item.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
/**
 * This widget, is part of the sections-thread widget, that is responsible for showing
 * the readers current position 
 * @extends Widget<Map>
 */
export default class Map extends Widget {


    constructor() {

        super();

        super.html = hc.spawn({
            classes: Map.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'>
                        
                    </div>
                </div>
            `
        });

        /** @type {string[]} */ this.items
        this.pluralWidgetProperty(
            {
                property: 'items',
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.items',
                transforms: {
                    set: (str) => {
                        return new Item({ label: str }).html
                    },
                    get: html => html.widgetObject?.label
                }
            }
        );

        const items = Symbol();

        /** @type {string[]} */ this[items];
        this.pluralWidgetProperty(
            {
                property: items,
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.items',
                childType: 'html'
            }
        );




        /** @type {number[]} */ this.selections
        Reflect.defineProperty(
            this,
            'selections',
            {
                /**
                 * 
                 * @param {number[]} v 
                 */
                set: (v) => {
                    this[items].forEach((x, i) => x.classList.toggle('selected', v.findIndex(n => n === i) !== -1))
                },
                get: () => {
                    return this[items].filter(x => x.classList.contains('selected')).map(
                        x => this[items].findIndex(it => it === x)
                    )
                }
            }
        );

        /** @type {(event: "change", cb: (event: CustomEvent)=> void )=> void} */ this.addEventListener

        this.html.$('.items').addEventListener('click', (evnt) => {
            let changed;

            for (const item of this[items]) {
                if (item.contains(evnt.target)) {
                    this.selections = [this[items].findIndex(x => x === item)]
                    changed = true
                }
            }
            if (changed) {
                this.dispatchEvent(new CustomEvent('change'))
            }
        })
    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-sections-thread-map'];
    }
}