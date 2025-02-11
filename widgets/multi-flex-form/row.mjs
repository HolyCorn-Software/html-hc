/*
Copyright 2021 HolyCorn Software
The MultiFlexForm widget
This module (space widget) is one that can hold others like it, as well as others unlike it.
The main aim of this widget is to create distinction, because these features are already implemented at the base level of MultiFlexFormItem

*/

import { hc } from "../../lib/widget/index.mjs";
import { MultiFlexFormItem } from "./item.mjs";


export class MultiFlexFormRow extends MultiFlexFormItem {

    constructor(args) {
        super(args)

        this.html.classList.add('hc-multi-flex-form-row')
    }

    get elements() {
        return this.html.$('.container').children.map(x => x.widgetObject);
    }
    append(element) {
        this.html.$('.container').appendChild(element.html)
    }
    prepend(element) {
        this.html.$('.container').prepend(element.html)
    }


}

hc.importModuleCSS(import.meta.url)