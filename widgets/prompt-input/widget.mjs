/**
 * Copyright 2022 HolyCorn Software
 * This widget is borrowed from the zone-input widget of cayofedpeople
 * This widget allows developers to develop other widgets that are based on users navigating a hierarchical data
 */


import { hc, Widget } from '../../lib/widget/index.mjs';
import AlarmObject from '../../lib/alarm/alarm.mjs';



const fetchFxn_symbol = Symbol()


export default class PromptInput extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name This is optional
     * @param {string} param0.label This is optional
     * @param {{id:string, label:string}} param0.value This is optional. If set the widget will take this value
     * @param {object} param0.prompt
     * @param {string} param0.prompt.image The url of the icon to be shown on the widget
     * @param {string} param0.prompt.text A text that will be displayed on the widget, before the user clicks it
     */
    constructor({ name, label, value, prompt } = {}) {

        super();

        this.html = hc.spawn(
            {
                classes: PromptInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'></div>

                        <div class='main'>
                            <img src="${new URL('./res/zone.png', import.meta.url).href}">
                            <div class='prompt'>Tap to Select</div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.name
        /** @type {string} */ this.max_top_path


        /** @type {{image: string, text: string}} */ this.prompt
        const prompt_storage = new AlarmObject()

        Reflect.defineProperty(this, 'prompt', {
            get: () => prompt_storage,
            set: (object) => Object.assign(prompt_storage, object),
            configurable: true,
            enumerable: true
        })

        this.prompt.$0.addEventListener('image-change', () => {
            this.html.$('.container >.main >img').setAttribute('src', this.prompt.image)
        })
        this.prompt.$0.addEventListener('text-change', () => {
            this.html.$('.container >.main >.prompt').innerHTML = this.prompt.text
        })

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {function(('change'|'dismiss-popup'|'error'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.html.$('.main').addEventListener('click', () => {
            this.show()
        });

        /** @type {boolean} */ this.hidden_n_disabled
        this.htmlProperty(undefined, 'hidden_n_disabled', 'class', undefined, 'hidden-disabled')


        const { value: val, ...args } = arguments[0]

        Object.assign(this, args)


    }

    /**
     * The inheriting widget should override this method to show a popup when clicked
     */
    show() {
        

    }

    static get classList() {
        return ['hc-prompt-input']
    }

    /**
     * The id of the selected zone
     * @returns {{id: string, label: string}}
     */
    get value() {
        return this[value_symbol]
    }
    set value(value) {
        this[value_symbol] = value
        this.dispatchEvent(new CustomEvent('change'))
    }

}


const value_symbol = Symbol()