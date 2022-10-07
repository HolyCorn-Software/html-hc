/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * It's basically an acordion layout
 */

import { hc, Widget } from "../../lib/widget/index.mjs";
import AccordionItem from "./item.mjs";


/**
 * @template DataType
 */
export default class Accordion extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: Accordion.classList,
            innerHTML: `
                <div class='container'>

                </div>
            `
        });

        /** @type {[DataType]} */ this.items
        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-accordion-item',
            parentSelector: '.container',
            immediate: true,
            property: 'items',
            transforms: {
                /** @param {DataType} data*/
                set: (data) => {
                    let item = this.dataToWidget(data);
                    item.addEventListener('expand-change', () => {
                        for (let _widget of this.itemWidgets) {
                            const widget = _widget;
                            if (widget !== item) {
                                setTimeout(() => widget.expanded = false, 750);
                            }
                        }
                    })
                    return item.html
                },
                get: (html) => {
                    let widget = html?.widgetObject
                    return this.widgetToData(widget);
                }
            }
        });

        /** @type {[AccordionItem]} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-accordion-item',
            parentSelector: '.container',
            immediate: true,
            property: 'itemWidgets',
            childType: 'widget'
        })



    }
    static get classList() {
        return ['hc-cayofedpeople-accordion']
    }

    /**
     * This method should be overridden so that the system can pass in data about an item, and receive a widget of type AccordionItem
     * @param {DataType} input
     * @returns {AccordionItem}
     */
    dataToWidget() {
        throw new Error(`This method should be overridden so as to accept data and produce a widget that extends AccordionItem`)
    }

    /**
     * This method should be overridden so that the system can pass in a widget of type AccordionItem, and receive data about the widget. The data should be sufficient to re-construct a similar widget using the dataToWidget() method.
     * @param {AccordionItem} input
     * @returns {DataType}
     */
    widgetToData() {
        throw new Error(`This method should be overridden so as to accept data and produce a widget that extends AccordionItem`)
    }

}