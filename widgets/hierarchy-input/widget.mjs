/**
 * Copyright 2022 HolyCorn Software
 * This widget is borrowed from the zone-input widget of cayofedpeople
 * This widget allows developers to develop other widgets that are based on users navigating a hierarchical data
 */



import HierarchyInputPopup from './popup.mjs'
import { hc, Widget } from '../../lib/widget/index.mjs';
import AlarmObject from '../../lib/alarm/alarm.mjs';



const fetchFxn_symbol = Symbol()


export default class HierarchyInput extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name This is optional
     * @param {string} param0.label This is optional
     * @param {{id:string, label:string}} param0.value This is optional. If set the widget will take this value
     * @param {boolean} param0.modal If set to true, the popup will not close untill the user has selected something
     * @param {string} param0.max_top_path The id of the maximum item that can be selected up the chain.
     * @param {object} param0.prompt
     * @param {string} param0.prompt.image The url of the icon to be shown on the widget
     * @param {string} param0.prompt.text A text that will be displayed on the widget, before the user clicks it
     * @param {()=>Promise<[import("../file-explorer/types.js").DirectoryData]>} param0.fetchData This method should return an array of inputs 
     */
    constructor({ name, label, value, modal, max_top_path, prompt, fetchData } = {}) {

        super();

        this.html = hc.spawn(
            {
                classes: HierarchyInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'></div>

                        <div class='main'>
                            <img src="${new URL('./res/zone.png', import.meta.url).href}">
                            <div class='prompt'>Select Zone</div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.name
        /** @type {boolean}  */ this.modal
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

        this[fetchFxn_symbol] = async () => {

            this.loadBlock()

            try {

                const results = await fetchData()
                for (let item of results) {
                    item.icon ||= this.prompt.image
                }

                if (this.value?.id) { //Setting the UI, if there was already an existing value before the widget could load
                    const existingItem = results.find(x => x.id === this.value.id)
                    if (existingItem) {
                        this[value_symbol] = { id: existingItem.id, label: existingItem.label }
                        this.prompt.text = existingItem.label
                        this.prompt.image = existingItem.icon
                    }
                }

                this.loadUnblock()
                return results
            } catch (e) {
                this.loadUnblock()
                throw e
            }
        }

        const { value: val, fetchData: ftch, ...args } = arguments[0]

        Object.assign(this, args)

        if (val?.id) {
            this[value_symbol] = val
            this[fetchFxn_symbol]()
        }

    }

    show() {
        let popup = new HierarchyInputPopup({ max_top_path: this.max_top_path, modal: this.modal })
        popup.show()

        let completed = false;

        popup.addEventListener('complete', () => {
            this.value = popup.value
            if (popup.value) {
                this.prompt.image = popup.explorer.statedata.items.find(x => x.id == popup.value.id)?.icon || this.prompt.image
            }
            popup.hide()
            completed = true;
        })

        popup.addEventListener('hide', () => {
            if (!completed) {
                this.dispatchEvent(new CustomEvent('dismiss-popup'))
            }
        })

        popup.waitTillDOMAttached().then(async () => {
            popup.loadBlock()

            try {

                const data = await this[fetchFxn_symbol]()
                popup.explorer.statedata.items = data
                setTimeout(() => popup.explorer.statedata.current_path = this.value?.id || '', 100)

            } catch (e) {
                this.dispatchEvent(new CustomEvent('error', { detail: e }))

            }

            popup.loadUnblock()
        })

    }

    static get classList() {
        return ['hc-hierarchy-input']
    }

    /**
     * The id of the selected zone
     * @returns {{id: string, label: string}}
     */
    get value() {
        return this[value_symbol]
    }
    set value(value) {
        if (this.value !== value) {
            this[fetchFxn_symbol]()
        }
        this[value_symbol] = value
        this.dispatchEvent(new CustomEvent('change'))
        if (value?.label) {
            this.prompt.text = value.label
        }
    }

}


const value_symbol = Symbol(`ZoneInputPopup.prototype.value`)