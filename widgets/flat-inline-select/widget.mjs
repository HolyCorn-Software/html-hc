/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This widget (flat-inline-select) widget, allows a user to choose from a list of options, in a simple fashion, whereby, all options are painted infront of him. No click to expand.
 */

import { Widget, hc } from "../../lib/widget/index.mjs";



/**
 * @extends Widget<FlatInlineSelect>
 */
export default class FlatInlineSelect extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {FlatInlineSelect['label']} param0.label
     * @param {FlatInlineSelect['value']} param0.value
     * @param {FlatInlineSelect['items']} param0.items
     */
    constructor({ label, value, items } = {}) {
        super();
        this.html = hc.spawn(
            {
                classes: FlatInlineSelect.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'></div>
                        <div class='content'></div>
                    </div>
                `
            }
        );

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {htmlhc.widget.flat_inline_select.Item[]} */ this.items
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.content',
                property: 'items',
                transforms: {
                    set: (input) => new Item(input).html,
                    /** @param {htmlhc.lib.widget.ExtendedHTML<Item>} html */
                    get: (html) => {
                        const widget = html.widgetObject
                        return {
                            content: widget?.content,
                            name: widget?.name
                        }
                    }
                },
                onchange: () => {
                    if (this.itemWidgets.every(x => !x.selected)) {
                        this.itemWidgets[0].selected = true
                    }
                }
            }
        );



        /** @type {Item[]} */ this.itemWidgets
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.content',
                property: 'itemWidgets',
                childType: 'widget'
            }
        );




        this.items = [
            {
                name: 'holycorn',
                content: `HolyCorn Software`
            },
            {
                name: 'vtc',
                content: `VTC`
            },
            {
                name: 'camsol',
                content: `Camsol.io`
            }
        ]

        // Now, when an item is clicked, move the highlighter to it
        this.html.$('.container >.content').addEventListener('click', (event) => {
            /** @type {HTMLElement} */
            let target = event.target
            /** @type {Item} */
            let item;
            const parent = this.html.$('.container >.content')
            while (target !== parent) {
                if (Item.classList.every(item => target.classList.contains(item))) {
                    item = target.widgetObject
                    break
                }
                target = target.parentElement
            }
            if (!item) {
                return;
            }

            this.itemWidgets.forEach(x => x.selected = (x == item))

            this.dispatchEvent(new CustomEvent('change'))


        })

        /** @type {(event: "change", cb: (ev: CustomEvent)=> void, opts: AddEventListenerOptions)=>void} */ this.addEventListener;

        Object.assign(this, arguments[0])

    }

    get value() {
        /** @type {Item} */
        const item = (this.html.$('.container >.content >.selected').widgetObject) || this.itemWidgets[0]
        return item.name
    }
    set value(name) {
        this.itemWidgets.forEach(x => x.selected = (x.name == name))
    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-htmlhc-flat-inline-select']
    }

}



/**
 * @extends Widget<Item>
 */
class Item extends Widget {
    /**
     * 
     * @param {htmlhc.widget.flat_inline_select.Item} param0 
     */
    constructor({ content, name } = {}) {
        super();
        this.html = hc.spawn(
            {
                classes: Item.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'></div>
                    </div>
                `
            }
        );

        /** @type {boolean} */ this.selected
        this.htmlProperty(undefined, 'selected', 'class')

        /** @type {string} */ this.name

        Object.assign(this, arguments[0])


    }
    /**
     * @param {HTMLElement|string} content
     */
    set content(content) {
        this.html.$(':scope >.container >.main >*')?.remove()
        this.html.$('.container >.main').appendChild(
            content instanceof Node ? content : hc.spawn({ innerHTML: content })
        )
    }
    /**
     * @return {HTMLElement}
     */
    get content() {
        return this.html.$('.container >.main').children[0]
    }

    /** @readonly */
    static get classList() {
        return ['hc-htmlhc-flat-inline-select-item']
    }

}