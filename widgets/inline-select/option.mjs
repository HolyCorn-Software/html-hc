/*
Copyright 2021 HolyCorn Software
The InlineSelect widget.
This widget (Option) represents a single option that can be selected
*/

import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";


export class Erhi1d extends Widget {

    constructor({ name, content } = {}) {

        super();

        this.html = hc.spawn({
            classes: Erhi1d.classList,
            innerHTML: `
                <div class='container'>
                    <div class='content'></div>
                </div>
            `
        });

        /** @type {string} */ this.content
        Reflect.defineProperty(this, 'content', {
            get: () => this.html.$('.content').innerText,
            set: v => this.html.$('.content').innerText = v,
            configurable: true,
            enumerable: true
        })

        /** @type {string} */ this.name

        Object.assign(this, arguments[0]);

    }

    static get classList() {
        return ['hc-v2-inline-select-option']
    }

}