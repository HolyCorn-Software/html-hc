/**
 * Copyright 2022 HolyCorn Software
 * This widget (location-picker) allows a user to pick a location
 */

import GoogleLocationPickerPopup from "./picker-popup.mjs";
import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class GoogleLocationInput extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.apiKey
     * @param {string} param0.label
     * @param {string} param0.name
     * @param {import("./types.js").Geolocation} param0.value
     */
    constructor({ apiKey, label, name, value } = {}) {
        super();


        this.html = hc.spawn(
            {

                classes: GoogleLocationInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'>Select Location</div>
                        <div class='main'>
                            <img src='${new URL('./location.png', import.meta.url).href}'><div class='caption'>Tap to Select</div>
                        </div>
                    </div>
                `
            }
        );


        this.loadBlock()

        const init = () => {
            this.html.$('.container >.main').addEventListener('click', () => {
                const popup = new GoogleLocationPickerPopup(this.value)
                popup.show()
                popup.addEventListener('hide', () => {
                    if(popup.value){
                        this.value = popup.value
                    }
                });
            })
            this.loadUnblock()
        };

        if (window.google?.maps) {
            init()
        } else {


            const randomFxnName = `fxn_${`${Math.random()}`.substring(3)}`
            window[randomFxnName] = init

            document.head.appendChild(
                hc.spawn(
                    {
                        tag: 'script',
                        src: `https://maps.googleapis.com/maps/api/js?callback=${randomFxnName}&key=${apiKey}`
                    }
                )
            )
        }

        /** @type {string} */ this.apiKey
        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')
        /** @type {string} */ this.name
        /** @type {string} */ this.caption
        this.htmlProperty('.container >.main >.caption', 'caption', 'innerHTML')

        /** @type {function(('change'), function(), AddEventListenerOptions)} */ this.addEventListener

        //Remove the 'value' parameter
        let { value: val, ...args } = arguments[0]

        Object.assign(this, args)

        if (val) { //Then set it differently, to prevent unwanted dispatching of events
            this[valueSymbol] = value
            this.updateLabel()
        }

    }



    /**
     * @returns {import("./types.js").Geolocation}
     */
    get value() {
        return this[valueSymbol]
    }

    /**
     * @param {import("./types.js").Geolocation} value
     */
    set value(value) {
        this.updateLabel()
        this[valueSymbol] = value
        this.dispatchEvent(new CustomEvent('change'))
    }
    updateLabel() {
        if (this.value) {
            this.caption = `${this.value.lattitude}, ${this.value.longitude}`
        }
    }

    static get classList() {
        return ['hc-google-location-input']
    }

}

const valueSymbol = Symbol()