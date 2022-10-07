/**
 * Copyright 2022 HolyCorn Software
 * This widget (option) is part of the dual-pane-expander widget, and controls the clickable primary UI
 */

import { hc, Widget } from "../../lib/widget/index.mjs";



export default class Option extends Widget {

    constructor({ actionLabel, name } = {}) {
        super();

        this.html = hc.spawn({
            classes: ['hc-dual-pane-expander-option'],
            innerHTML: `
                <div class='container'>
                    <div class='label'></div>
                </div>
            `,
        });

        /** @type {string} */ this.actionLabel
        this.widgetProperty(
            {
                parentSelector: '.container >.label',
                selector: '*',
                property: 'actionLabel',
            }
        );

        /** @type {string} */ this.name

        /** @type {string} */ this.content

        /** @type {function(('select'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.html.$('.container').addEventListener('click', () => {
            this.selected = !this.selected;
            if(this.selected){
                this.dispatchEvent(new CustomEvent('select'));
            }
        })

        /** @type {boolean} */ this.selected
        this.htmlProperty(undefined, 'selected', 'class', undefined, 'selected')

        Object.assign(this, arguments[0])
    }

    async select(){
        this.selected = true;
        this.dispatchEvent(new CustomEvent('select'));
    }

}