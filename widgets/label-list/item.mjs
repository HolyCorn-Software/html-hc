/**
 * Copyright 2022 HolyCorn Software
 * This widget (item) is part of the label-list widget which is essentially a widget where a user can add and substract a huge number of items
 */

import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";


export class LabelListItem extends Widget {

    /**
     * 
     * @param {import("./types.js").LabelListItemData} data 
     */
    constructor(data) {
        super();

        this.html = hc.spawn({
            classes: ['hc-label-list-item'],
            innerHTML: `
                <div class='container'>
                    <div class='actions'></div>
                    
                    <div class='label'></div>
                </div>
            `
        });


        /** @type {function(('action'), function(CustomEvent<{name: ('delete')}>), AddEventListenerOptions)} */ this.addEventListener

        /** @type {string} */ this.id

        /** @type {string} */ this.label

        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {[import("./types.js").LabelListActionData]} */ this.actions

        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.actions',
            property: 'actions',
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").LabelListActionData} data 
                 */
                set: (data) => {
                    const html = hc.spawn({
                        classes: ['action'],
                        innerHTML: `${data.label}`,
                        onclick: () => {
                            data?.onclick()
                        }
                    })

                    return html;
                },
                get: (html) => {
                    return {
                        label: html.innerHTML,
                        onclick: html.onclick
                    }
                }
            }
        });

        this.actions = [
            {
                label: 'X',
                onclick: () => this.dispatchEvent(new CustomEvent('action', { detail: { name:'delete' } }))
            }
        ];

        /** @type {function(('action'), function(CustomEvent<{id: string, action:('delete')}>), AddEventListenerOptions)} */ this.addEventListener
        

        Object.assign(this, data);

    }

}