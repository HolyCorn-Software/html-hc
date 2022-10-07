/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * Adapated from the Donor Forms Project
 * 
 * This widget is the main widget of it's parent (roles-data-manager). 
 * It contains a list of all role entries
 */

import AlarmObject from "../../../../lib/alarm/alarm.mjs";
import { hc, Widget } from "../../../../lib/widget/index.mjs";
import { Checkbox } from "../../../checkbox/checkbox.mjs";
import ListingsEntry from "./entry.mjs";



export default class ListingsMainWidget extends Widget {


    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-generic-listings-main'],
            innerHTML: `
                <table class='container'>
                    <thead>
                        <tr class='headers'>
                            <td class='checkbox'></td>
                            <!-- The other headers go here. Such as Role, ID ... -->
                        </tr>
                    </thead>

                    <tbody>
                    </tbody>
                    
                </table>
            `
        });


        /** @type {function(('selectionchange'), function( CustomEvent<>), AddEventListenerOptions)} */ this.addEventListener

        /** @type {import("../../types.js").ListingsStatedata} */ this.statedata
        this.statedata = new AlarmObject()


        /** @type {[import("../../types.js").ListingsItemData]} */ this.itemsData

        this.pluralWidgetProperty({
            selector: '.hc-generic-listings-item',
            parentSelector: '.container >tbody',
            property: 'itemsData',
            immediate: true,
            transforms: {
                /**
                 * 
                 * @param {any} data 
                 */
                set: (data) => {

                    const transformed = this.execMiddleware(data)

                    let widget = new ListingsEntry(transformed, this);

                    let timeoutHandle;
                    const onselect = () => {
                        if (!this.html.contains(widget.checkbox.html)) {
                            return widget.checkbox.removeEventListener('change', onchange)
                        }
                        this.dispatchEvent(new CustomEvent('selectionchange'))
                        if (this.mainCheckbox.checked && !widget.checkbox.checked) {
                            this.mainCheckbox.silent_value = false
                        }

                        clearTimeout(timeoutHandle);
                        //Now, we want to update the state of the mainCheckbox to either checked, or unchecked, depending on if all checkboxes have been checked
                        timeoutHandle = setTimeout(() => {
                            this.mainCheckbox.silent_value = this.checkboxes.every(box => box.checked)
                        }, 200)
                    }

                    widget.addEventListener('selectionchange', onselect)

                    return widget.html
                },
                /** @returns {import('../../types.js').ListingsItemData} */
                get: (html) => {
                    /** @type {ListingsEntry} */
                    const widget = html?.widgetObject
                    return widget?.data

                }
            }
        });

        this.statedata.$0.addEventListener('content-change', () => {
            this.itemsData = this.statedata.content;
        })

        this.statedata.$0.addEventListener('content-$array-item-change', (event) => {
            const field = event.detail.field
            this.itemsData[field] = this.statedata.content[field]
        })


        /** @type {[ListingsEntry]} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-generic-listings-item',
            parentSelector: '.container >tbody',
            childType: 'widget',
            property: 'itemWidgets',
            immediate: true,
        });

        /** @type {[ListingsEntry]} */ this.checked_items
        Reflect.defineProperty(this, 'checked_items', {
            get: () => this.itemWidgets.filter(x => x.checkbox.checked),
            /** @param {[string]} array */
            set: (array) => {
                const widgets = this.itemWidgets;

                for (let item_id of array) {
                    const widget = widgets.filter(w => w.id === item_id)[0]
                    if (widget) {
                        widget.checkbox.checked = true
                    }
                }
            },
            enumerable: true,
            configurable: true
        });

        /** @type {[Checkbox]} */ this.checkboxes
        Reflect.defineProperty(this, 'checkboxes',
            {
                get: () => this.itemWidgets.map(x => x.checkbox),
                set: () => {
                    throw new Error(`This property 'checkboxes', cannot be set.`)
                },
                configurable: true,
                enumerable: true
            }
        )

        /** @type {Checkbox} */ this.mainCheckbox
        this.widgetProperty({
            selector: '.hc-uCheckbox',
            childType: 'widget',
            property: 'mainCheckbox',
            parentSelector: '.container .headers .checkbox',

            /**
             * 
             * @param {Checkbox} widget 
             */
            onchange: (widget) => {
                const onchange = () => {
                    if (!this.html.contains(widget.html)) {
                        return widget.removeEventListener('change', onchange)
                    }

                    for (const checkbox of this.checkboxes) {
                        checkbox.checked = widget.checked
                    }

                }
                widget.addEventListener('change', onchange)
            }
        });

        this.mainCheckbox = new Checkbox()


        /** @type {[import("../../types.js").HeaderItemData]} */ this.__headers
        this.pluralWidgetProperty({
            selector: '.header',
            parentSelector: '.headers ',
            childType: 'html',
            property: '__headers',
            transforms: {
                /**
                 * 
                 * @param {import("../../types.js").HeaderItemData} data 
                 * @returns {HTMLElement}
                 */
                set: (data) => {
                    return hc.spawn({
                        tag: 'td',
                        innerHTML: data.label,
                        classes: ['header'],
                    });
                },
                get: (html) => {
                    return {
                        label: html?.innerHTML,
                        highlightable: html?.getAttibute('highlightable')
                    }
                }
            }
        });

        this.statedata.contentMiddleware ||= []
        this.statedata.content = []
        this.statedata.headers ||= []

        this.statedata.$0.addEventListener('headers-change', (event) => {
            this.__headers = this.statedata.headers
        })




        true && this.statedata.contentMiddleware.push(
            {
                set: (data) => {

                    const fields = ['id', 'label', 'inherited', 'supervised', 'description']

                    const returns = []

                    for (let field of fields) {
                        returns.push(
                            {
                                content: data[field],
                                style: {
                                    highlightable: true
                                }
                            }
                        )
                    }

                    return returns
                },
                get: (data) => {
                    return {
                        id: data[0]?.content,
                        label: data[1]?.content,
                        inherited: data[2]?.content,
                        supervised: data[3]?.content,
                        description: data[4]?.content
                    }
                },
                name: 'test'
            }
        );

    }


    /**
     * This method is used internally to get the final output of a piece of data, by running through the bunch of middleware
     * @param {any} input 
     * @returns {import("../../types.js").ContentMiddleWareReturn}
     */
    execMiddleware(input) {


        const check_data = (data) => {
            return Array.isArray(data?.columns)
        }


        const data_okay = check_data(input)


        if (this.statedata.contentMiddleware.length > 0) {



            /** @type {import("../../types.js").ContentMiddleWareReturn} */
            let transformed = JSON.parse(JSON.stringify(input));


            for (let i = 0; i < this.statedata.contentMiddleware.length; i++) {
                const middleware = this.statedata.contentMiddleware[i]
                if (!middleware || typeof middleware !== 'object' || !middleware.get || !middleware.set) {
                    throw new Error(`The middleware ${middleware?.name || ' with no name'} at position ${i} is invalid. Every middleware must have 'get', 'set', 'name'`)
                }

                transformed = middleware.set(transformed)

                return transformed

            }



            if (!data_okay) {
                throw new Error(`The most recent middleware did not return what was expected of it.
                It was supposed to return an array with the structure of [
                    {
                        content: string,
                        style:{ //optional
                            highlightable: boolean
                        }
                    }
                ]

                Rather, it returned: ${(JSON.stringify(input || '"undefined"'))}
            `)
            }


        } else {

            if (!data_okay) {
                throw new Error(`Data supplied to the listings widget was incorrect. Either you specify a middleware that will accept that data and return something proper
                or, pass in something proper. Check the definition of ContentMiddleWareReturn in ./types.d.ts to understand what something proper is.
            `)
            }
            return input
        }

    }

    static get testWidget() {
        let widget = new this()

        return widget;
    }


}
