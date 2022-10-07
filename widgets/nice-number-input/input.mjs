/**
 * Copyright 2022 HolyCorn Software
 * This widget (nice-number-input) allows users to easily input number, especially over short ranges
 * It offers a "+" and a "-" button, as well as allowing the user to manually type in a value
 */

import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";


export class NiceNumberInput extends Widget {

    constructor() {
        super();
        super.html = hc.spawn({
            classes: ['hc-nice-number-input'],
            innerHTML: `
                <div class='container'>
                    <div class='control negative'>-</div>
                    <input>
                    <div class='control positive'>+</div>
                </div>
            `
        });

        /** @type {[HTMLElement]} */ this.controls
        this.pluralWidgetProperty({
            selector: '.control',
            parentSelector: '.container',
            property: 'controls',
            childType: 'html'
        });


        /** @type {number} */ this.value
        this.htmlProperty('.container >input', 'value', 'inputValue')

        let deltas = [-1, +1]
        for (let i = 0; i < deltas.length; i++) {
            let index = i;
            this.controls[index].addEventListener('click', () => {
                this.value += deltas[index]
                this.html.$('.container >input').dispatchEvent(new CustomEvent('change'))
            })
        }

        for (let _event of ['change', 'keydown']) {
            this.html.$('.container >input').addEventListener(_event, () => {
                this.dispatchEvent(new CustomEvent('change'))
            })
        }

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


    }

}