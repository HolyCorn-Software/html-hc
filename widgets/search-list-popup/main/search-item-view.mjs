/**
 * Copyright 2023 HolyCorn Software
 * Adapted from the Donor Forms Project
 * This widget represents a single item on the search list
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

/**
 * @template T
 */
export default class SearchListItemView extends Widget {


    /**
     * 
     * @param {SearchListPopupTypes.SearchListPopupItemData<T>} data 
     */
    constructor(data) {
        super();

        super.html = hc.spawn({
            classes: ['hc-sarch-list-popup-search-item'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <img>
                        <div class='data'>
                            <div class='label'></div>
                            <div class='id'></div>
                        </div>
                    </div>
                </div>
            `
        });

        /** @type {string} */ this.label

        for (const prop of ['label', 'id']) {
            this.htmlProperty(`.container >.main >.data >.${prop}`, prop, 'innerHTML')
        }

        /** @type {string} */ this.image
        this.htmlProperty(`.container >.main >img`, 'image', 'attribute', undefined, 'src')

        /** @type {T} */ this.value

        Object.assign(this, data);
    }

}