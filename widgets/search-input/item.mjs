/**
 * Copyright 2022 HolyCorn Software
 * This widget is part of the search-input widget.
 * It represents a single item in the list of choices
 */

import { Checkbox } from "../checkbox/checkbox.mjs";
import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";



export class SearchInputItem extends Widget {

    constructor({ multi_select }) {
        super();

        this.html = hc.spawn({
            classes: ['hc-search-input-item'],
            innerHTML: `
                <div class='container'>
                    <div class='checkbox'></div>

                    <div class='content'>
                        <!-- The content will go here -->
                    </div>

                </div>
            `
        });

        /** @type {Checkbox} */ this.checkbox
        this.widgetProperty(
            {
                selector: `.${Checkbox.classList.join('.')}`,
                parentSelector: '.container >.checkbox',
                property: 'checkbox',
                childType: 'widget',
                /**
                 * 
                 * @param {Checkbox} checkbox 
                 */
                onchange: (checkbox) => {
                    checkbox.addEventListener('change', () => {
                        this.dispatchEvent(new CustomEvent(this.checkbox.value ? 'select' : 'deselect'))
                    })
                }
            }
        );

        this.checkbox = new Checkbox()

        this.html.addEventListener('click', (ev) => {

            this.checkbox.value = this.multi_select ? !this.checkbox.value : true
        })

        /** @type {HTMLElement} */ this.content
        this.widgetProperty({
            selector: '*',
            parentSelector: '.container >.content',
            property: 'content',
            childType: 'html',
        });


        /** @type {boolean} */ this.multi_select
        this.htmlProperty(undefined, 'multi_select', 'class', undefined, 'multi_select')

        /** @type {string|boolean|number} */ this.value

        Object.assign(this, arguments[0])
    }


}