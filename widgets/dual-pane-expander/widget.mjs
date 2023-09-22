/**
 * Copyright 2022 HolyCorn Software
 * Incorporated from the CAYOFED People System Project
 * 
 * This widget is a generic widget featuring two panes, one with clickable items and the other with text-heavy items and buttons
 */

import { hc, Widget } from "../../lib/widget/index.mjs";
import Option from "./option.mjs";
import Screen from "./screen.mjs";



export default class DualPaneExpander extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: DualPaneExpander.classList,
            innerHTML: `
                <div class='container'>
                    <div class='title'>Payments</div>

                    <div class='main'>
                        <div class='left'>
                            <div class='options'>
                                <!-- The options go here -->
                            </div>
                        </div>

                        <div class='right'>
                            <div class='screen'>
                                <!-- The Screen widget goes here -->
                            </div>
                        </div>
                        
                    </div>

                </div>
            `
        });

        /** @type {Screen} */ this.screen
        this.widgetProperty({
            selector: '.hc-dual-pane-expander-screen',
            parentSelector: '.container >.main >.right >.screen',
            property: 'screen',
            childType: 'widget',
            immediate: true
        })

        /** @type {string} **/ this.title
        this.htmlProperty('.container >.title', 'title', 'innerHTML')

        this.screen = new Screen(this)

        const waitTillTransitionEnd = (maxTime = 5000) => {
            return new Promise((resolve) => {
                const done = () => {
                    clearTimeout(timeout)
                    resolve()
                    this.html.removeEventListener('transitionend', done)
                }
                let timeout = setTimeout(resolve, maxTime)
                this.html.addEventListener('transitionend', done)
            })
        }


        /** @type {import('./types.js').ItemData[]} */ this.items
        this.pluralWidgetProperty({
            parentSelector: '.container >.main >.left >.options',
            selector: '*',
            immediate: true,
            property: 'items',
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").ItemData} data 
                 */
                set: (data) => {
                    //TODO: Employ proper cleaning practices
                    let widget = new Option(data)

                    widget.addEventListener('select', () => {
                        for (let widget_child of this.itemWidgets) {
                            if (widget_child !== widget) {
                                widget_child.selected = false;
                            }
                        }

                        this.html.classList.add('content-switch-state-1')
                        waitTillTransitionEnd(1500).then(() => {
                            this.html.classList.add('content-switch-state-2')
                            this.html.classList.remove('content-switch-state-1')
                            this.screen.title = data.contentLabel
                            this.screen.content = widget.content
                            this.screen.actions = [...data.actions || []]
                            waitTillTransitionEnd(1000).then(() => {
                                this.html.classList.remove('content-switch-state-2')
                            })
                        })

                        this.dispatchEvent(new CustomEvent('select', {
                            detail: { data, widget }
                        }))

                    });

                    if (this.items.length === 0) {
                        setTimeout(() => widget.select(), 200)
                    }

                    return widget.html
                },
                get: (html) => {
                    let widget = html?.widgetObject
                    return {
                        title: widget?.title,
                        content: widget?.content,
                        name: widget?.name,
                        actions: widget?.actions
                    }
                }
            }
        })

        /** @type {function(('select'), function(CustomEvent<{data: import("./types.js").ItemData, widget: Option}>), AddEventListenerOptions)} */ this.addEventListener




        /** @type {Option[]} */ this.itemWidgets
        this.pluralWidgetProperty({
            parentSelector: '.container >.main >.left >.options',
            selector: '.hc-dual-pane-expander-option',
            immediate: true,
            property: 'itemWidgets',
            childType: 'widget'
        });

        /** @type {{label: string, onclick: (data:{widget:Option})=>void}[]} */ this.actions
        Reflect.defineProperty(this, 'actions', {
            get: () => this.screen.actions,
            set: (v) => this.screen.actions = v,
            configurable: true,
            enumerable: true
        })


    }

    /** @readonly */
    static get classList() {
        return ['hc-dual-pane-expander']
    }

}