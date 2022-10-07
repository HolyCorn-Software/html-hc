/*
Copyright 2021 HolyCorn Software
The HCTS Project
This widget allows **popup** menu's that are **branded**
*/

import { HCTSBrandedMenu } from '../branded-menu/index.mjs'
import { PopupMenu } from '../popup-menu/index.mjs'
import { hc } from '../../lib/widget/index.mjs'


hc.importModuleCSS();

const menu_widget_symbol = Symbol(`HCTSBrandedPopup.prototype.menu`)

export default class HCTSBrandedPopup extends PopupMenu {


    constructor({ content } = {}) {

        super()

        let menu = this[menu_widget_symbol] = new HCTSBrandedMenu({
            content
        })

        this.html.classList.add('hc-hcts-branded-popup')

        super.content = menu.html

        Object.assign(this, arguments[0])


    }

    /**
     * @param {HTMLElement} content
     */
    set content(content) {
        this[menu_widget_symbol].content = content
    }
    /**
     * @returns {HTMLElement}
     */
    get content() {
        return this[menu_widget_symbol].content
    }

    loadBlock(html){
        return super.loadBlock(html|| this[menu_widget_symbol].html.$('.main-row >.content'))
    }

}