/*
Copyright 2021 HolyCorn Software
This widget is an animable form, that can receive various configurations, as to where input fields are placed and how they look

The success of this widget is based on the fact that it is built up of tiny components called items
These items in themselves are animable, and form the building blocks of the two essential components: Spaces and Fields
*/

import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";
import { MultiFlexFormConfiguration } from "./config.mjs";
import { MultiFlexFormField } from "./field.mjs";
import { MultiFlexFormItem } from "./item.mjs";
import { MultiFlexFormRow } from "./row.mjs";


/**
 * @template FormDataType
 */
export default class MultiFlexForm extends Widget {


    constructor({ css, ...args } = {}) {

        super({ css: [import.meta.url, css] });

        super.html = document.spawn({
            class: 'hc-multi-flex-form',
            innerHTML: `
                <div class='container'>
                    
                </div>
            `
        });

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener
        /** @type {function(('change'), function())} */ this.removeEventListener

        Object.assign(this, args)

    }

    /**
     * 
     * @param {MultiFlexFormItem} item 
     */
    add(item) {
        item.addEventListener('change', () => {
            // It is just but normal that any child (probably a input box) that changes should cause a notable change at the level of the parent
            this.dispatchEvent(new CustomEvent('change'))
        })
        this.html.$('.container').appendChild(item.html);
    }

    /**
     * @returns {[MultiFlexFormField]}
     */
    get fieldWidgets() {
        return [...this.html.$$('.hc-multi-flex-form-field')].map(x => x.widgetObject)
    }

    /**
     * The MultiFlexFormItem's that are a part of this
     * @returns {[MultiFlexFormRow|MultiFlexFormField]}
     */
    get items() {
        return [...this.html.$('.container').children].map(x => x.object)
    }

    hide_field(name) {
        const html = this.fieldWidgets.find(x => x.name == name).html.parentElement.parentElement
        html.classList.add('multi-flex-form-hidden')
    }
    show_field(name) {
        const html = this.fieldWidgets.find(x => x.name == name).html.parentElement.parentElement
        html.classList.remove('multi-flex-form-hidden')
    }



    /**
     * @return {FormDataType}
     */
    get value() {
        let value = {}
        for (var field of this.fieldWidgets) {
            value[field.name] = field.value
        }
        return value
    }

    /**
     * This is an object that can be used to set the values of fields on the form directly, one at a time.
     * If you want to get all values at once, use the 'value' attribute instead
     * E.g myform.values.name = 'Bernard'
     * @returns {FormDataType}
     */
    get values() {

        let fields;

        const populate_fields = () => {
            fields = [...this.html.$$('.hc-multi-flex-form-field')].map(x => x.widgetObject)
        }

        populate_fields()

        return new Proxy(() => 1, {
            set: (target, property, value) => {
                const do_set = async (last_try) => {
                    try { await this.__customization_promise__ } catch { }

                    if (last_try) {
                        populate_fields();
                    }


                    let [field] = fields.filter(x => x.name == property)
                    if (field) {
                        field.value = value;
                    } else {
                        if (!last_try) {
                            return setTimeout(() => do_set(true), 10)
                        }
                        console.warn(`Could not set form field ${property}`)
                    }
                }
                do_set()
                return true;
            },
            get: (target, property) => {
                return fields.filter(x => x.name == property)[0]?.value
            },
            apply: () => {
                return this.value
            }
        })

    }

    /**
     * This is used to set the value of multiple fields at once
     * E.g myform.values = {name:'Bernard', sex:'Male'}
     */
    set values(object) {
        //This delay is because at times, values are set immediately a form is just been initialized. By then, there are no elements in the DOM
        //With this delay, the elements that were added would have actually been part of the DOM
        (async () => {
            try { await this.__customization_promise__ } catch { }
            if (typeof object === 'object' && Reflect.ownKeys(object).length === 0) {
                return await this.empty()
            }
            setTimeout(() => Object.assign(this.values, object), 50);
        })()

    }

    empty() {
        (async () => {
            try { await this.__customization_promise__ } catch { }
            let { values } = this;
            for (let key in this.value) {
                values[key] = ''
            }
        })()

    }

    /**
     * This is used used to define the layout of the form by just passing an array (of arrays (of object that look like {name:string, label:string, type:string, values: string, value:number|string}) )
     * Refer to the docs for ```MultiFlexFormConfiguration.quickCreate```
     * @see {MultiFlexFormConfiguration.quickCreate}
     * @param {import("./types.js").MultiFlexFormDefinitionData} structure
     */
    set quickStructure(structure) {
        let caller = hc.getCaller(1);
        MultiFlexFormConfiguration.quickCreate(structure, caller).apply(this);
    }

    /**
     * Tells us the layout of the form, in terms of which field is positioned where
     * @returns {import("./types.js").MultiFlexFormDefinitionData}
     */
    get quickStructure() {

        /**
         * @typedef {import("./types.js").MultiFlexFormFieldData|Items[]} Items
         */


        /**
         * 
         * @param {MultiFlexFormRow} row 
         * @returns {Items}
         */
        const getItems = (row) => {
            let items = []
            for (let item of row.items) {
                if (item instanceof MultiFlexFormField) {
                    items.push(item.definition)
                } else {
                    items.push(
                        getItems(item)
                    )
                }
            }
            return items
        }

        return getItems(this)
    }

    static get classList() {
        return ['hc-multi-flex-form']
    }

    /**
     * This method returns a an object structured like this ['label', 'answer'] e.g ['Names', 'Awosi Bicobert']
     * @param {import("./types.js").MultiFlexFormDefinitionData} structure 
     * @param {object} answers 
     * @returns {[[string, string]]}
     */
    static labelAnswerPair(structure, answers) {
        const find_field = (name) => {
            return structure.filter(row => row.filter(field => field.name === name)[0])[0][0]
        }
        let pairs = []

        for (let key in answers) {
            let entry = []
            const field = find_field(key)
            entry.push(field.label)
            let content = answers[key]

            if (field.type === 'choose') {
                content = field.values[content]
            }

            entry.push(content)

            pairs.push(entry)

        }

        return pairs
    }


}





