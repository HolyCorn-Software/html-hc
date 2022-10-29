/**
 * Copyright 2022 HolyCorn Software
 * Adapted from The Donor Forms Project
 * 
 * The CAYOFED People System
 * 
 * This widget allows an authorized personnel to manage the roles of others in the system
 */


import { hc, Widget } from "../../lib/widget/index.mjs";
import ActionButton from "../action-button/button.mjs";
import ListingsMainWidget from "./widgets/listings/widget.mjs";



export default class GenericListings extends Widget {

    constructor({ title } = {}) {
        super();

        this.html = hc.spawn({
            classes: GenericListings.classList,
            innerHTML: `
                <div class='container'>

                    <div class='top-section'>
                        <div class='title'>Roles Data</div>
                        <div class='actions'></div>
                        <div class='custom'></div>
                    </div>

                    <div class='listings'></div>
                
                </div>
            `
        });

        /** @type {[import("../../lib/widget/widget.mjs").ExtendedHTML]} */ this.headerCustom
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.top-section >.custom',
                property: 'headerCustom',
                childType: 'html',
            }
        )

        /** @type {string} */ this.title
        this.htmlProperty('.top-section >.title', 'title', 'innerHTML')

        /** @type {ListingsMainWidget} */ this.listings
        this.widgetProperty({
            selector: '.hc-generic-listings-main',
            parentSelector: '.container >.listings',
            childType: 'widget',
            property: 'listings',
            transforms: {
                /**
                 * 
                 * @param {ListingsMainWidget} widget 
                 * @returns 
                 */
                set: (widget) => {
                    return widget.html
                },
                get: (html) => html?.widgetObject
            }
        });

        this.listings = new ListingsMainWidget()


        /** @type {import("./types.js").ListingsStatedata} */ this.statedata
        Reflect.defineProperty(this, 'statedata', {
            get: () => this.listings.statedata,
            set: (d) => this.listings.statedata = d,
            configurable: true,
            enumerable: true
        })


        this.listings.statedata.headers = [
            {
                label: `ID`
            },
            {
                label: `Label`
            },
            {
                label: `A field`
            },
            {
                label: `Description`
            }
        ]

        this.listings.statedata.contentMiddleware = []

        this.listings.statedata.content = [
            {
                // label: 'abc',
                // id: 'someid',
                columns: [
                    {
                        content: `Some id`
                    },
                    {
                        content: `Some label`
                    },
                    {
                        content: `Some field`
                    },
                    {
                        content: `Some description`
                    }
                ]
            }
        ]

        /** @type {[ActionButton]} */ this.actions
        this.pluralWidgetProperty({
            selector: '.hc-action-button',
            property: 'actions',
            parentSelector: '.top-section >.actions',
            childType: 'widget',
        });

        Object.assign(this, arguments[0])
    }


    static get classList() {
        return ['hc-generic-listings'];
    }
}