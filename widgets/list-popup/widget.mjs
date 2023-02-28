/***
 * Copyright 2023 HolyCorn Software
 * The list-popup widget
 * This is widget is a popup that gives the user one or more choices
 */

import { hc } from "../../lib/widget/index.mjs";
import { PluralWidgetArray } from "../../lib/widget/pluralWidgetProperty.mjs";
import ActionButton from "../action-button/button.mjs";
import { PopupMenu } from "../popup-menu/popup.mjs";
import ListPopupItem from "./item.mjs";

const selectedWidgets = Symbol();


/**
 * @template OptionValueType
 * 
 */
export default class ListPopup extends PopupMenu {


    /**
     * @param {object} params 
     * @param {ListPopup['selectionSize']} params.selectionSize
     * @param {string} params.title
     * @param {string} params.caption
     * @param {ListPopupOption<OptionValueType>[]} params.options
     * @param {PopupMenu['hideOnOutsideClick']} params.hideOnOutsideClick
     * @param {string} params.actionText
     */
    constructor(params) {

        super(

            {
                hideOnOutsideClick: params.hideOnOutsideClick,

                content: hc.spawn(
                    {
                        classes: [`${ListPopup.classList[0]}-content`],
                        innerHTML: `
                            <div class='container'>
                                <div class='top'>
                                    <div class='title'>Choose Action</div>
                                    <div class='caption'>Now that you want to resume the payment... bla bla bla</div>
                                </div>

                                <div class='options'>
                                    <!-- The options go here -->
                                </div>

                                <div class='action'>
                                    <!-- The selection button goes here -->
                                </div>
                                
                            </div>
                        `
                    }
                )

            }
        );

        /** @type {string} */ this.title
        /** @type {string} */ this.caption
        for (const option of ['title', 'caption']) {
            this.htmlProperty(`.container >.top >.${option}`, option, 'innerHTML')
        }

        /** @type {ListPopupItem[]} */this[selectedWidgets] = []

        // So that we can style the overriden popup, more easily
        ListPopup.classList.forEach(cl => this.html.classList.add(cl));

        /** Now, let's do the logic of allowing options on the widget */

        /** @type {ListPopupOption<OptionValueType>[]} */ this.options
        this.pluralWidgetProperty(
            {
                parentSelector: '.container >.options',
                selector: ['', ...ListPopupItem.classList].join('.'),
                property: 'options',
                transforms: {
                    /**
                     * 
                     * @param {this['options']['0']} option 
                     * @returns {HTMLElement}
                     */
                    set: (option) => {
                        if (!option) {
                            return PluralWidgetArray.ignore_element;
                        }
                        const widget = new ListPopupItem(option);
                        widget.checkbox.addEventListener('change', () => {
                            if (!widget.checkbox.value) {
                                this[selectedWidgets] = this[selectedWidgets].filter(x => x !== widget)
                            } else {
                                // Check the minimum size
                                for (let i = 0; i < this[selectedWidgets].length - (this.selectionSize.max - 1); i++) {
                                    const one = this[selectedWidgets].shift();
                                    one.checkbox.silent_value = false;
                                }
                                this[selectedWidgets].push(widget)
                            }

                            for (const sel of this[selectedWidgets]) {
                                sel.checkbox.silent_value = true
                            }

                            this.action.state = (this[selectedWidgets].length <= this.selectionSize.max) && (this[selectedWidgets].length >= this.selectionSize.min) ? 'initial' : 'disabled'
                        })
                        return widget.html
                    },
                    /**
                     * 
                     * @param {HTMLElement} html 
                     * @returns {this['options']['0']}
                     */
                    get: (html) => {
                        /** @type {ListPopupItem} */
                        const widget = html?.widgetObject

                        return {
                            caption: widget.caption,
                            label: widget.label,
                            value: widget.value
                        }
                    }
                }
            }
        );

        /** @type {ListPopupItem[]} */ this.optionWidgets
        this.pluralWidgetProperty(
            {
                parentSelector: '.container >.options',
                selector: ['', ...ListPopupItem.classList].join('.'),
                property: 'optionWidgets',
                childType: 'widget'
            }
        );



        /** @type {{min: number, max: number}} */
        this.selectionSize = { min: 1, max: 1 }



        /** @type {ActionButton} */ this.action
        this.widgetProperty(
            {
                parentSelector: '.container >.action',
                selector: ['', ...ActionButton.classList].join("."),
                childType: 'widget',
                property: 'action'
            }
        );

        this.action = new ActionButton(
            {
                content: `Select`,
                onclick: () => {
                    this.action.state = 'success'
                    this.dispatchEvent(new CustomEvent('change'))
                },
                state: 'disabled'
            }
        );

        /** @type {function(('change'|'hide'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        /** @type {string} */ this.actionText
        Reflect.defineProperty(this, 'actionText', {
            get: () => this.action.content,
            set: v => this.action.content,
            configurable: true,
            enumerable: true
        })

        Object.assign(this, params)


    }

    get value() {
        return this[selectedWidgets].map(x => x.value)
    }

    /**
     * 
     * @returns {Promise<OptionValueType[]>}
     */
    async waitTillSelect() {
        this.show()
        const selection = await new Promise((resolve, reject) => {
            this.addEventListener('change', () => resolve(this.value))
            this.addEventListener('hide', () => reject(new Error(`No option was selected`)))
        });
        setTimeout(() => this.hide(), 750)
        return selection
    }

    static get classList() {
        return ['hc-list-popup']
    }


}

hc.importModuleCSS(import.meta.url);