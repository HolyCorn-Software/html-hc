/**
 * Copyright 2022 HolyCorn Software
 * In the year of Covid 2
 * This widget allows a user to select one or more options
*/

import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";
import { PluralWidgetArray } from "../../lib/widget/pluralWidgetProperty.mjs";
import { LabelListItem } from "./item.mjs";
import LabelListNewItemPopup from "./new-item-popup.mjs";


export default class LabelList extends Widget {

    /**
     * The 'value' property defines the items that are currently visible, the ones selected
     * The 'items_store' property defines all the elements that can exist.
     * @param {object} param0 
     * @param {[import("./types.js").LabelListItemData]} param0.value
     * @param {[import("./types.js").LabelListItemData]} param0.items_store
     * @param {boolean} param0.readonly
     */
    constructor({ value, items_store, readonly } = {}) {
        super();

        this.html = hc.spawn({
            classes: LabelList.classList,
            innerHTML: `
                <div class='container'>

                    <div class='main'>
                        
                        <div class='items'>
                            <!-- The selected items of the list go here -->
                        </div>

                        <div class='actions'><!-- The Actions, e.g + button --></div>
                    </div>
                    
                </div>
            `
        });

        /** @type {[import("./types.js").LabelListActionData]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '.action',
                parentSelector: '.container >.main >.actions',
                property: 'actions',
                transforms: {
                    /**
                     * 
                     * @param {import("./types.js").LabelListActionData} action 
                     */
                    set: (action) => {
                        let html = hc.spawn({
                            classes: ['action'],
                            innerHTML: action.label,
                            onclick: action.onclick
                        });

                        return html;
                    },
                    get: (html) => {
                        return {
                            label: html.innerHTML,
                            onclick: html.onclick
                        }
                    }
                }
            }
        );


        /** @type {[import("./types.js").LabelListItemData]} The list of items that have been selected by the user */ this.items
        this.pluralWidgetProperty(
            {
                selector: '.hc-label-list-item',
                parentSelector: '.container >.main >.items',
                property: 'items',
                transforms: {
                    /**
                     * 
                     * @param {import("./types.js").LabelListItemData} data 
                     */
                    set: (data) => {

                        if (this.items.filter(x => x.id === data.id).length !== 0) {
                            return PluralWidgetArray.ignore_element; //Already exists. Let's prevent duplicate content
                        }

                        let widget = new LabelListItem(data)
                        widget.addEventListener('action', (ev) => {
                            switch (ev.detail.name) {
                                case 'delete': {
                                    setTimeout(() => {
                                        this.items = this.items.filter(x => x.id !== data.id)
                                    }, 100);
                                    break;
                                }
                            }
                        })
                        return widget.html;
                    },
                    get: (html) => {
                        /** @type {LabelListItem} */
                        const widget = html?.widgetObject
                        if (!widget) {
                            console.trace(`Why was `, html, ` sent to us ?`)
                        }
                        return {
                            label: widget?.label,
                            id: widget?.id
                        }
                    }
                }
            }
        );

        this.items = [];

        /** @type {[import("./types.js").LabelListItemData]} This contains all the possibilities of what can be added to the list */
        this.items_store = []

        this.actions = [
            {
                label: '+',
                onclick: () => {
                    this.onAdd()
                }
            }
        ];


        /** @type {boolean} */ this.readonly //This one property determines a lot. It could hide X, and + buttons
        this.htmlProperty(undefined, 'readonly', 'class', undefined, 'readonly')

        Object.assign(this, arguments[0]);
    }
    onAdd() {
        //Open a popup where the user can select what to add to the list
        let popup = new LabelListNewItemPopup({
            items: this.items_store
        });
        popup.show()
        popup.addEventListener('complete', () => {
            this.items.push(popup.value)
        })

        return popup
    }

    static get classList() {
        return ['hc-label-list'];
    }

    /**
     * @param {[import("./types.js").LabelListItemData]}
     */
    set value(value) {
        this.items = value
    }

    /**
     * @returns {[import("./types.js").LabelListItemData]}
     */
    get value() {
        return [...this.items]
    }

}