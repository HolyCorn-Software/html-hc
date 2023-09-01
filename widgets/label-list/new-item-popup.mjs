/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows the user to select an item from the global list of all items
 */

import HCTSBrandedPopup from "../branded-popup/popup.mjs";
import { InlineSelect } from "../inline-select/index.mjs";
import { hc } from "../../lib/widget/index.mjs";
import ActionButton from "../action-button/button.mjs";


export default class LabelListNewItemPopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {object} data 
     * @param {string} data.caption
     * @param {import("./types.js").LabelListItemData[]} data.items
     */
    constructor(data) {
        super();

        const select = new InlineSelect({
            label: data.caption || `Select New Role`
        })

        this.html.classList.add('hc-label-list-new-item-popup')

        this.content = hc.spawn({
            children: [
                select.html,
                hc.spawn({
                    classes: ['actions'],
                    children: [
                        new ActionButton({
                            content: `Add`,
                            onclick: () => {
                                if (!select.value) {
                                    return;
                                }
                                this.dispatchEvent(new CustomEvent('complete'))
                                this.hide();
                            }
                        }).html
                    ]
                })
            ],
            classes: ['hc-label-list-new-item-popup-content'],
        })

        select.options = [
            ...data?.items.map(x => {
                return {
                    content: x.label,
                    name: x.id
                }
            }) || []
        ]

        /** @type {function(('complete'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        /** @type {import("./types.js").LabelListItemData} */ this.value
        Reflect.defineProperty(this, 'value', {
            get: () => {
                return data.items.filter(x => x.id == select.value)[0]
            },
            set: (v) => select.value,
            configurable: true,
            enumerable: true
        })

    }

}

hc.importModuleCSS()