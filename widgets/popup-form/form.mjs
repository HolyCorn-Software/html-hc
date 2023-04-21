/*
Copyright 2021 HolyCorn Software
The HCTS Project
This widget is used by other widgets that create popups consisting mainly of input fields
*/


import { MultiFlexForm, MultiFlexFormConfiguration } from '../multi-flex-form/index.mjs'
import { hc } from "../../lib/widget/index.mjs";
import HCTSBrandedPopup from '../branded-popup/popup.mjs';
import { handle } from '../../../errors/error.mjs';
import ActionButton from '../action-button/button.mjs';

/**
 * @typedef {function(('complete'|'cancel'|'execute'), function(CustomEvent), AddEventListenerOptions)} PopupFormEventHandler
 */

/**
 * @typedef FormField
 * @property {string} FormField.label
 * @property {'text'|'textarea'|'number'|'date'} FormField.type
 * @property {string} FormField.name
 */

hc.importModuleCSS(import.meta.url);

/**
 * @template ValueType
 */
export default class PopupForm extends HCTSBrandedPopup {

    /**
     * @param {object} param0
     * @param {htmlhc.widget.popupform.CreateForm<ValueType>} param0.form
     * @param {string} param0.title
     * @param {string} param0.caption
     * @param {string} param0.positive 
     * @param {string} param0.negative
     * @param {()=>Promise<void>} param0.execute
     */
    constructor({ form, title = '', caption = '', positive, negative, execute } = {}) {

        super()

        this.formWidget = new MultiFlexForm()


        let mainHTML = document.spawn({
            class: 'hc-hcts-moderation-popupForm',
            innerHTML: `
                <div class='top'>
                    <div class='title'></div>
                    <div class='caption'></div>
                </div>
                <div class='form'></div>
                <div class='actions'>
                    
                </div>
            `
        });
        this.content = mainHTML

        /** @type {string} */ this.title
        /** @type {string} */ this.caption
        for (var x of ['title', 'caption']) {
            this.htmlProperty(`.${x}`, x, 'innerHTML')
        }

        /** @type {()=>Promise<void>} */ this.execute



        mainHTML.$('.form').appendChild(this.formWidget.html)
        this.content = mainHTML

        this.positiveButton = new ActionButton({
            content: 'Create',

        });

        /** @type {PopupFormEventHandler} */ this.addEventListener
        /** @type {typeof this.addEventListener} */ this.addEventListener

        this.positiveButton.html.on('click', async () => {
            this.dispatchEvent(new CustomEvent('complete'))
            if (this.execute) {
                this.positiveButton.state = 'waiting'
                try {
                    await this.execute()
                    this.positiveButton.state = 'success'
                    this.dispatchEvent(new CustomEvent('execute'))
                } catch (e) {
                    handle(e)
                    this.positiveButton.state = 'initial'
                }
            }
        });

        let cancel = document.spawn({
            innerHTML: `
                Cancel
            `,
            class: 'cancel',
            onclick: () => {
                this.hide()
                this.dispatchEvent(new CustomEvent('cancel'))
            }
        });


        //We want that when this.positive is set, it should affect the content of the button
        //When this.negative is set it should affect the innerHTML of the cancel HTMLElement
        /** @type {string} */ this.positive
        /** @type {string} */ this.negative
        let btn_map = { 'positive': this.positiveButton, 'negative': cancel }
        for (var _x in btn_map) {
            let x = _x

            Reflect.defineProperty(this, x, {
                get: () => btn_map[x].content || btn_map.html.innerHTML,
                set: v => {
                    if ('content' in btn_map[x]) {
                        btn_map[x].content = v
                    } else {
                        btn_map[x].innerHTML = v
                    }
                }
            })
        }

        for (var action of [this.positiveButton, cancel]) mainHTML.$('.actions').appendChild(action.html || action)


        Object.assign(this, arguments[0])


    }

    /**
     * @type {import('../multi-flex-form/types.js').MultiFlexFormDefinitionData}
     */
    set form(form) {
        MultiFlexFormConfiguration.quickCreate(form).apply(this.formWidget)
    }
    /**
     * @returns {import('../multi-flex-form/types.js').MultiFlexFormDefinitionData}
     */
    get form() {
        return this.formWidget.quickStructure
    }

    /**
     * @returns {ValueType}
     */
    get value() {
        return this.formWidget.value;
    }

    /**
     * @param {ValueType} value
     */
    set value(value) {
        this.formWidget.values = value;
    }

}