/*
Copyright 2021 HolyCorn Software
This widget is a line that is typically used to divide the UI into two (top - bottom)
*/

import { Widget } from "../../lib/widget/index.mjs";



export class DivisionLine extends Widget {

    constructor({ label } = {}) {
        super();
        this.html = document.spawn({
            class: 'hc-division-line',
            innerHTML: `
                <div class='container'>
                    <div class='line-stroke'></div>
                    <div class='line-label'></div>
                </div>
            `
        })
        this.htmlProperty('.line-label', 'label', 'innerHTML')


        Object.assign(this, arguments[0])
    }
}
