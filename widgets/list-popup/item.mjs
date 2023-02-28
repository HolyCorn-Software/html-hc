/**
 * Copyright 2023 HolyCorn Software
 * This widget is part of the list-popup widget, and represents a single action that can be selected by the user
 */

import { hc, Widget } from "../../lib/widget/index.mjs";
import { Checkbox } from "../checkbox/checkbox.mjs";


export default class ListPopupItem extends Widget {

    /**
     * 
     * @param {ListPopupOption} data 
     */
    constructor(data) {

        super();

        this.html = hc.spawn(
            {
                classes: ListPopupItem.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='details'>
                                <div class='label'>Retry</div>
                                <div class='caption'>Try transaction again</div>
                            </div>

                            <div class='marker'>
                                <!-- A checkbox goes here -->
                            </div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {object} */ this.value

        /** @type {string} */ this.label
        /** @type {string} */ this.caption
        for (const property of ['label', 'caption']) {
            this.htmlProperty(`.container >.main >.details >.${property}`, property, 'innerHTML')
        }

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty(
            {
                selector: ['', ...Checkbox.classList].join('.'),
                parentSelector: '.container >.main >.marker',
                childType: 'widget',
                property: 'checkbox',
            }
        );

        Object.assign(this, data)

        this.checkbox = new Checkbox()

        this.html.addEventListener('click', (ev) => {
            if (this.checkbox.html === ev.target || this.checkbox.html.contains(ev.target)) {
                return; //The checkbox would have handled this on it's own
            }
            this.checkbox.value = !this.checkbox.value
        })

    }
    get selected() {
        return this.checkbox.value
    }

    static get classList() {
        return ['hc-list-popup-item']
    }

}