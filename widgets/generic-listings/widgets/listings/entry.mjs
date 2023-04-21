/**
 * Copyright 2022 HolyCorn Software
 * Adapted from the Donor Forms Project
 * This widget represents a single entry in the payment listings widget
 */


import ListingsMainWidget from "./widget.mjs";
import { hc, Widget } from "../../../../lib/widget/index.mjs";
import { Checkbox } from "../../../checkbox/checkbox.mjs";

/**
 * @template DataType
 */
export default class ListingsEntry extends Widget {

    /**
     * @param {import("../../types.js").ContentMiddleWareReturn<DataType>} data
     * @param {ListingsMainWidget} parent
     */
    constructor(data, parent) {
        super();

        this.html = hc.spawn({
            classes: ['hc-generic-listings-item'],
            tag: 'tr',
            innerHTML: `
                <td class='checkbox'></td>
            `
        });

        const dataSymbol = Symbol()


        /** @type {import("../../types.js").ListingsFieldData<DataType>[]} */ this.columns
        this.pluralWidgetProperty(
            {
                selector: 'td.field',
                parentSelector: undefined,
                property: 'columns',
                transforms: {
                    /**
                     * 
                     * @param {import("../../types.js").ListingsFieldData<DataType>} field 
                     */
                    set: (field) => {
                        const html = hc.spawn({
                            tag: 'td',
                            classes: ['field', field.style?.highlightable ? 'highlightable' : 'no-highlight'],
                        });


                        if (field.content instanceof HTMLElement) {
                            html.appendChild(field.content)
                        } else {
                            if (typeof field.content !== 'string') {
                                console.trace(`How come ? `, field)
                            }
                            html.innerHTML = field.content
                        }

                        html[dataSymbol] = field

                        return html
                    },
                    /**
                     * 
                     * @param {HTMLElement} td_html 
                     * @returns {import("../../types.js").ListingsFieldData<DataType>}
                     */
                    get: (td_html) => {
                        return td_html?.[dataSymbol]
                    }
                }
            }
        )

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'checkbox',
            parentSelector: '.checkbox',
            immediate: false,
            /** @param {Checkbox} checkbox */
            onchange: (checkbox) => {
                const onCheckbox = () => {
                    if (!this.html.contains(checkbox.html)) {
                        return checkbox.removeEventListener('change', onCheckbox)
                    }
                    this.dispatchEvent(new CustomEvent('selectionchange'))
                }

                checkbox.addEventListener('change', onCheckbox)
            }
        });


        /** @type {function(('selectionchange'), ()=> void, AddEventListenerOptions)} */ this.addEventListener


        this.checkbox = new Checkbox();


        this.columns = data.columns
        this.data = data

    }

}
