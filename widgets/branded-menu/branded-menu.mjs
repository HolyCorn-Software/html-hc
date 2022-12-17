/*
Copyright 2021 HolyCorn Software
The HCTS Project
This widget is meant to contain other widgets
The idea is to show certain information in a consistent way.
For example, always having the logo at the top-left
*/


import { HCTSLogo } from "../logo/logo.mjs"
import { Widget } from "../../lib/widget/index.mjs"



export class HCTSBrandedMenu extends Widget {

    constructor({ content, css } = {}) {
        super({ css: [css, import.meta.url] })

        this.html = document.spawn({
            class: 'hc-hcts-branded-menu',
            innerHTML: `
                <div class='container'>
                    <div class='top-row'></div>
                    <div class='hold-logo'></div>
                    <div class='main-row'>
                        <div class='content'>
                            <!-- The content of the widget goes here -->
                        </div>
                    </div>
                </div>
            `
        })

        this.html.$('.hold-logo').appendChild(new HCTSLogo({ returnHomeOnClick: false }).html)

        /** @type {HTMLElement} */ this.__content__
        this.widgetProperty({
            selector: '*',
            parentSelector: '.container >.main-row >.content',
            immediate: true,
            property: '__content__',
            childType: 'html'
        })



        Object.assign(this, arguments[0])

    }

    /**
     * What is the widget holding ?
     * @param {HTMLElement} content
     */
    set content(content) {
        if (!content) return;
        if (!(content instanceof HTMLElement)) {
            throw new Error(`Please pass an instance of HTMLElement`)
        }
        this.__content__ = content;
    }
    /**
     * @returns {HTMLElement}
     */
    get content() {
        return this.__content__
    }

}