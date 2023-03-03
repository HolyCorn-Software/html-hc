/**
 * Copyright 2023 HolyCorn Software
 * This widget (option) is part of the search-list-popup widget.
 * This widget represents a single option that has been selected by the user
 */

import { hc, Widget } from "../../../lib/widget/index.mjs";



/**
 * @template T
 */
export default class SearchListPopupItem extends Widget {


    /**
     * 
     * @param {SearchListPopupTypes.SearchListPopupItemData<T>} data 
     */
    constructor(data) {

        super();

        this.html = hc.spawn(
            {
                classes: SearchListPopupItem.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <img src='/$/finance/$plugins/binancepay/@public/icon.png'>
                            <div class='label'>Binance</div>
                        </div>

                        <div class='actions'>
                            <div class='remove'>Remove</div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.label
        this.htmlProperty('.container >.main >.label', 'label', 'innerHTML')

        /** @type {string} */ this.image
        this.htmlProperty('.container >.main >img', 'image', 'attribute', undefined, 'src')

        /** @type {T} */ this.value

        /** @type {function(('remove'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.html.$('.container >.actions >.remove').addEventListener('click', () => this.dispatchEvent(new CustomEvent('remove')))

        Object.assign(this, data)

    }
    removeUI() {
        for (const property of ['width', 'height']) {
            this.html.style.setProperty(`--current-max-${property}`, window.getComputedStyle(this.html).width)
        }
        this.html.classList.add('removed')
        this.html.addEventListener('animationend', () => this.html.remove())
    }

    static get classList() {
        return ['hc-search-list-popup-item']
    }

}