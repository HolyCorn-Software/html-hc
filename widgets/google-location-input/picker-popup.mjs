/**
 * Copyright 2022 HolyCorn Software
 * This widget picker-popup is part of the google-location-input widget, and is the popup where the user selects the intended location
 */

import { hc } from "../../lib/widget/index.mjs";
import ActionButton from "../action-button/button.mjs";
import HCTSBrandedPopup from "../branded-popup/popup.mjs";



export default class GoogleLocationPickerPopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {import("./types.js").Geolocation} value 
     */
    constructor(value) {
        super();

        this.content = hc.spawn(
            {
                classes: ['hc-google-location-input-picker-popup-content'],
                innerHTML: `
                    <div class='container'>
                        <div class='caption'>Drag the marker to desired location</div>
                        <div class='frame'></div>
                        <div class='actions'>
                            <div class='positive'></div>
                            <div class='negative'>Cancel</div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {ActionButton} */ this.btnPositive
        this.widgetProperty(
            {
                selector: ['', ...ActionButton.classList].join("."),
                parentSelector: `.container >.actions >.positive`,
                childType: 'widget',
                property: 'btnPositive'
            }
        );
        this.btnPositive = new ActionButton(
            {
                content: `Select this`,
                onclick: () => {
                    this.hide()
                }
            }
        );

        const defaultCoords = {
            lat: 5.9631,
            lng: 10.1591
        }
        const mapCenter = value ? { lat: value.lattitude, lng: value.longitude } : defaultCoords
        
        this.map = new google.maps.Map(this.html.$('.container >.frame'),
            {
                zoom: 15,
                center: mapCenter,
            }
        );

        this.marker = new google.maps.Marker(
            {
                position: mapCenter,
                map: this.map,
                draggable: true
            }
        );

        this.hideOnOutsideClick = false;

        /** @type {HTMLElement} */ this.negative
        this.widgetProperty(
            {
                parentSelector: '.container >.actions',
                selector: '.negative',
                property: 'negative',
                childType: 'html',
            }
        );

        this.negative.addEventListener('click', () => {
            this.hide()
        })


    }

    /**
     * @returns {import("./types.js").Geolocation}
     */
    get value() {
        const pos = this.marker.getPosition()

        if(!pos){
            return
        }

        return {
            lattitude: pos?.lat(),
            longitude: pos?.lng()
        }
    }

    /**
     * @param {import("./types.js").Geolocation} value
     */
    set value(value) {
        this.marker.setPosition({
            lat: value.lattitude,
            lng: value.longitude
        })
    }


}

hc.importModuleCSS(import.meta.url)