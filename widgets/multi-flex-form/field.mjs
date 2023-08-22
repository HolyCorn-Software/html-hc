/*
Copyright 2021 HolyCorn Software
The MultiFlexForm widget
This module produces the MultiFlexFormField widget, which produces dynamic input fields

*/

import { MultiFlexFormItem } from "./item.mjs";
import { Widget } from "../../lib/widget/index.mjs";
import { hc } from "../../lib/widget/index.mjs";
import { UniqueFileUpload } from "../fileUpload/upload.mjs";
import { InlineSelect } from "../inline-select/index.mjs";
import DualSwitch from "../dual-switch/switch.mjs";

hc.importModuleCSS(import.meta.url)

export class MultiFlexFormField extends MultiFlexFormItem {

    constructor({ label, values, name, css } = {}) {
        super(arguments[0]);
        this.html.classList.add('hc-multi-flex-form-field');

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        /** @type {string} */ this.label
        /** @type {{[x:string]: string|number|boolean}} */ this.values
        /** @type {InputTypes} */ this.type

        for (let _key of ['label', 'values', 'type']) {
            const key = _key;
            Reflect.defineProperty(this, _key, {
                get: () => this[`__${key}__`],
                set: v => this[`__${key}__`] = v,
                configurable: true,
                enumerable: true
            })
        }

    }

    /**
     * @param {htmlhc.widget.multiflexform.InputTypes} type The new input type
     * @param {htmlhc.widget.multiflexform.MultiFlexFormFieldData} params extra parameters that can be passed to control how the overall outcome will be
     * Possible values of the type attribute are
     * text, number, date, password, textarea, and choose
     * 
     * If the type is set to 'choose', you must pass the values parameter, which is an of object structured as 'value':'label'
     * For example 
     * 
     * {
     * 
     *      values:{
     * 
     *          'btc': 'Bitcoin',
     * 
     *          'ltc' : 'Litecoin'
     * 
     *      }
     * 
     * }
     * Now if the user selects Bitcoin, the value you'll get is the value as 'btc'
     * 
     * @param {string} params.label
     * @param {{string:string}[]} params.values
     * 
     */
    setType(type, params) {

        let widget_types = [[/choose/, InlineSelect], [/uniqueFileUpload/, UniqueFileUpload], [/boolean/, DualSwitch]] //This object contains the input types that will require custom widgets. The rest will require input boxes

        //If the type can be handled by a custom input
        for (let [regexp, Widget] of widget_types) {
            if (regexp.test(type)) {

                //Now that the type of input we want to instantiate needs a custom widget.
                //The widget_types object is a map of which type belongs to which widget.
                let WIDGET_CLASS = Widget
                let widget = new WIDGET_CLASS({ ...(type == 'boolean' ? { positive: 'Yes', negative: 'No' } : {}), ...params, type })
                if (type == 'choose') {
                    if (!params.values) {
                        throw new Error(`Since input type is '${type}', please pass a 'values' parameter in the second function argument`)
                    }
                }
                widget.addEventListener('change', () => {
                    this.dispatchEvent(new CustomEvent('change'));
                });

                //Always remove the existing input element. The reason is simple, we can set the type variable over and over again.
                //Therefore, we have to clear previous traces.
                this.html.$('.container').children[0]?.remove();

                this.html.$('.container').appendChild(widget.html);

                return;
            }
        }

        if (type === 'customWidget') {
            if (!params.customWidgetUrl) {
                throw new Error(`Cannot set input type to custom widget because customWidgetUrl is missing`)
            }
            return (async () => {
                //Fetch the widget
                let WidgetClass = (await import(params.customWidgetUrl)).default

                //First time checking
                if (!WidgetClass?.constructor) {
                    throw new Error(`Custom widget ${params.customWidgetUrl} is invalid because it's default export is not a class that extends Widget`)
                }
                //Instantiate the widget
                let widget = new WidgetClass(params)



                //Final checks
                if (!widget.html) {
                    throw new Error(`Custom widget ${params.customWidgetUrl} is invalid because it doesn't have an html property`)
                }
                const valueProperty = params.valueProperty || 'value'
                if (!(valueProperty in widget)) {
                    throw new Error(`Custom widget ${params.customWidgetUrl} is invalid because it doesn't have a property called '${valueProperty}'`)
                }

                if (!(widget instanceof EventTarget)) {
                    throw new Error(`Custom widget ${params.customWidgetUrl} is invalid because it is not an EventTarget`)
                }

                widget.addEventListener('change', () => {
                    this.dispatchEvent(new CustomEvent('change'));
                });

                if (widget.html.widgetObject !== widget) {
                    throw new Error(`Custom widget ${params.customWidgetUrl} is invalid because it's html lacks the 'widgetObject' property. This property is a link back to the original widget. That is widget.html.widgetObject = widget;`)
                }

                //Append the widget
                this.html.$('.container').children[0]?.remove();
                this.html.$('.container').appendChild(widget.html)

            })()
        }




        this.html.$('.container').children[0]?.remove();
        const txtB = new MultiFlexFormTextbox(...arguments)
        this.html.$('.container').appendChild(txtB.html)

        txtB.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change'))
        });


        //Hidden fields should not occupy any space
        if (type == 'hidden') this.html.classList.add('hidden')

        this.__type__ = type;
        this.__label__ = params.label;
        this.__values__ = params.values;
    }
    get definition() {
        const dat = {
            label: this.label,
            name: this.name,
            type: this.type,
            value: this.value,
            values: this.values
        }
        if (typeof dat.values === 'undefined') {
            delete dat.values
        }
        return dat
    }

    get value() {
        return this.html.$('.container').children[0]?.widgetObject?.value
    }
    set value(value) {
        let obj = this.html.$('.container').children[0]?.widgetObject
        obj && (obj.value = value)
    }

    get name() {

        return this.html.$('.container').children[0]?.widgetObject?.name
    }

    set name(name) {

        try {
            return this.html.$('.container').children[0].widgetObject.name = name;
        } catch (e) {
            console.log(e)
        }
    }

}


/**
 * We don't expect third-parties to use this class
 * The idea is to have a widget that dynamically generate input fields
 */
export class MultiFlexFormTextbox extends MultiFlexFormItem {


    /**
     * 
     * @param {htmlhc.widget.multiflexform.InputTypes} type The input type
     * @param {object} params customization for the text box
     * @param {string} params.label The label for the text box
     * @param {string} params.name Optional (but very recommended) name of field
     * @param {any} params.value
     * @param {string} params.valueProperty Optional. If set, instead of the 'value' property being manipulated on the textbox, this one will. For example,
     * you can set this to 'valueAsDate'
     * @param {object} params.htmlDirect
     */
    constructor(type, params) {
        super();

        this.html.classList.add('hc-multi-flex-form-textbox')
        this.html.$('.container').classList.add('empty')


        this.html.$('.container').spawn({
            tag: ['textarea'].indexOf(type) != -1 ? type : 'input',
            type,
            direct: params.htmlDirect
        })



        this.htmlProperty('textarea,input', 'type', 'attribute')
        this.htmlProperty('.container', 'label', 'attribute')

        let changeTimeout;
        let doIt = () => {
            this.html.$('.container').classList[this.value == '' ? 'add' : 'remove']('empty')
            changeTimeout = undefined;
        };
        this.addEventListener('change', function () {
            if (changeTimeout) return;
            changeTimeout = setTimeout(doIt, 200);
            changeTimeout = setTimeout(doIt, 1000);
        })

        this.waitTillDOMAttached().then(() => doIt())


        // We don't want to wait till the user exits the textbox before a change event is fired. We want it on the fly
        for (let event of ['keydown', 'keypress', 'change', 'blur', 'focus', 'keyup']) {

            this.html.$('.container >*').addEventListener(event, () => {
                this.dispatchEvent(new CustomEvent('change'));
            });
        }
        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        Object.assign(this, params);

        /** @type {string} */ this.valueProperty

    }

    get value() {
        return this.html.$('input,textarea')?.[this.valueProperty || 'value']
    }
    set value(value) {
        const input = this.html.$('input,textarea');
        if (input.type === 'date' || input.type == 'time') {
            if (typeof value === 'number') {
                input.valueAsNumber = value
            }
            if (Date.prototype.isPrototypeOf(value)) {
                input.valueAsDate = value
            }
            if (typeof value === 'string') {
                input.value = value
            }
        } else {
            input[this.valueProperty || 'value'] = value
        }
        this.html.$('.container >*').dispatchEvent(new CustomEvent('change'))
    }


}


/**
 * Again! We don't expect you to make use of this class, but we export it all the same
 * This class just functions to wrap custom inputs, and provide a means of labeling them, as well as proxying input value 
 */
export class MultiFlexFormCustomInput extends MultiFlexFormItem {

    /**
     * 
     * @param {Widget} input_widget 
     */
    constructor(input_widget) {
        super();

        this.html.classList.add('multi-flex-form-custom-input');

        input_widget && (this.input = input_widget)



    }

    set input(input) {
        this.html.$('.container').appendChild(input.html);
        this.__input__ = input
    }

    get input() {
        return this.__input__;
    }

    get value() {
        return this.input.value
    }
    set value(value) {
        this.input.value = value;
    }


}