/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library.
 * This widget (list-data-manager), allows us to create views that manage lists of data of a given type,
 * by simply defining the structure of data expected
 */

import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import { Widget, hc } from "../../lib/widget/index.mjs";
import ActionButton from "../action-button/button.mjs";
import BrandedBinaryPopup from "../branded-binary-popup/widget.mjs";
import GenericListings from "../generic-listings/widget.mjs";
import PopupForm from "../popup-form/form.mjs";


const main = Symbol()

const maxItems = Symbol()


/**
 * @template DataType
 */
export default class ListDataManager extends Widget {

    /**
     * @param {object} param0 
     * @param {string} param0.title
     * @param {htmlhc.widget.list_data_manager.Config<DataType>} param0.config
     */
    constructor({ title, config } = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: ListDataManager.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'></div>
                        <div class='actions'></div>
                    </div>
                `
            }
        );

        this[maxItems] = 50;
        // TODO: Deal with max elements per view UI


        /** @type {HTMLElement[]} */ this.actions
        this.pluralWidgetProperty({
            parentSelector: ':scope >.container >.actions',
            selector: '*',
            property: 'actions',
            childType: 'html',
            sticky: false

        });



        hc.watchToCSS(
            {
                source: this.html.$('.container >.actions'),
                target: this.html,
                watch: {
                    dimension: 'width'
                },
                apply: '--actions-content-width',
                signal: this.destroySignal
            }
        );


        /** @type {(event: 'item-selected', cb: (ev: CustomEvent<DataType>) => void, opts: AddEventListenerOptions )} */ this.addEventListener


        this.widgetProperty(
            {
                selector: ['', ...GenericListings.classList].join('.'),
                parentSelector: '.container >.main',
                property: main,
                childType: 'widget',
                onchange: () => {
                    /**@type {GenericListings<DataType>} */
                    const listings = this[main];
                    listings.statedata.contentMiddleware = [
                        {
                            name: 'list-data-manager',
                            set: (input) => {
                                /**
                                 * 
                                 * @param {htmlhc.widget.list_data_manager.Display<DataType, string>} config 
                                 * @returns 
                                 */
                                const specific = (config) => {
                                    if (!/[^.]+\.[^.]+/gi.test(config.name)) {
                                        return input[config.name]
                                    }
                                    /** @type {string[]} */
                                    const parts = config.name.split('.')
                                    let data = input
                                    for (let i = 0; i < parts.length; i++) {
                                        // Imagine a caller trying to access system.io.console.log

                                        // Imagine we are somewhere at system.io
                                        // Let's check if system.io has a property called 'console.log'
                                        const tmp = data[parts.slice(i).join('.')]

                                        if (tmp != undefined) {
                                            // If it has, then whooooah! All good.
                                            return tmp
                                        }

                                        // Since there's no property called 'console.log',
                                        // We should only continue if there's a property called 'console'

                                        data = data[parts[i]];


                                        if (data == undefined) {
                                            // And if not, we return
                                            return
                                        }

                                    }
                                }
                                return {
                                    columns: config.display.map((conf, index) => {
                                        return {
                                            metadata: index == 0 ? input : undefined,
                                            content: new ItemView(conf.view, specific(conf), input).html
                                        }
                                    })
                                }
                            },
                            get: (data) => data.columns[0].metadata,
                        }
                    ];

                    listings.statedata.headers = config.display.map(x => ({ label: x.label }))

                    listings.statedata.content = []
                    const btnNw = new ActionButton(
                        {
                            content: `New`,
                            onclick: async () => {
                                const form = new PopupForm(
                                    {
                                        title: `New`,
                                        caption: `Enter details`,
                                        negative: `Cancel`,
                                        positive: `Create`,
                                        form: config.input,
                                        execute: async () => {
                                            const form_value = form.value

                                            // Let's provide assistance with nested fields
                                            for (const field in form_value) {
                                                if (ListDataManager.NESTED_REGEXP.test(field)) {
                                                    const [, superName, separator, subName] = ListDataManager.NESTED_REGEXP.exec(field);
                                                    if (separator == '$') {
                                                        console.warn(`Using '$' as a nested field separator, is deprecated. Use the standard '.' notation`)
                                                    }
                                                    (form_value[superName] ||= {})[subName] = form_value[field]
                                                    delete form_value[field]
                                                }
                                            }

                                            const value = await config.create([form_value]) || [form_value]
                                            listings.statedata.content.push(...value)
                                            setTimeout(() => form.hide(), 1200)
                                        }
                                    }
                                );

                                form.show()
                            },
                            state: config.create ? 'initial' : 'disabled'
                        }
                    );

                    const btnDel = new ActionButton(
                        {
                            content: `Delete`,
                            state: 'disabled',
                            onclick: async () => {
                                if (listings.listings.checked_items.length < 1) { return }
                                const popup = new BrandedBinaryPopup(
                                    {
                                        title: `Delete`,
                                        question: `Do you really want to delete?`,
                                        positive: `Delete`,
                                        negative: `No`,
                                        execute: async () => {
                                            const items = listings.listings.checked_items.map(x => x.columns[0].metadata)
                                            await config.delete(items)
                                            listings.statedata.content = listings.statedata.content.filter(x => items.findIndex(it => eq(it, x)) == -1)
                                            setTimeout(() => popup.hide(), 1250)
                                        }
                                    }
                                )
                                popup.show()
                            }
                        }
                    )

                    if (config.create) {
                        listings.actions.push(btnNw)
                    }

                    if (config.delete) {
                        listings.actions.push(btnDel)
                    }

                    listings.headerCustom.push(...(config.topActions || []))

                    /**
                     * This method tries to figure out which data item the user has clicked, by clicking any area of the UI
                     * @param {HTMLElement} target 
                     * @returns {DataType}
                     */
                    const getDataFromHTML = (target) => {
                        while ((target != this[main].html) && !target?.classList.contains('checkbox')) {
                            target = target.parentElement
                            if (target.tagName.toLowerCase() == 'tr') {
                                return target.widgetObject?.columns[0].metadata;
                            }

                        }
                    }

                    if (config.edit && (config.edit.execute || config.create)) {

                        this.addEventListener('item-selected', (event) => {
                            const formData = config.edit.form || config.input;
                            const popup = new PopupForm(
                                {
                                    form: formData,
                                    execute: async () => {
                                        const value = JSON.parse(JSON.stringify(event.detail))

                                        Object.assign(value, popup.value)
                                        const newValue = (await (config.edit.execute || ((i) => config.create([i]).then(ret => ret?.[0])))(value)) || value;
                                        this.content = this.content.map(item => eq(item, event.detail) ? newValue : item)
                                        setTimeout(() => popup.hide(), 1250)
                                    },
                                    positive: `Update`,
                                    negative: `Cancel`,
                                    title: `Modify Content`,
                                    caption: `Enter new details`
                                }
                            );
                            popup.waitTillDOMAttached().then(() => popup.blockWithAction(
                                async () => {

                                    const value = (await config.edit?.setForm?.(event.detail)) || event.detail;

                                    // Let's assist developers, who may use nested fields
                                    const nestedDeleteList = new Set()
                                    for (const field of formData.flat(2)) {
                                        if (ListDataManager.NESTED_REGEXP.test(field.name)) {
                                            if (typeof value[field.name] == 'undefined') {
                                                const [, supName, separator, subName] = ListDataManager.NESTED_REGEXP.exec(field.name)
                                                value[field.name] = value[supName]?.[subName]
                                                nestedDeleteList.add(supName)
                                                if (separator == '$') {
                                                    console.warn(`Using '$' as a nested field separator, is deprecated. Use the standard '.' notation`)
                                                }
                                            }
                                        }
                                    }

                                    nestedDeleteList.forEach(field => delete value[field])

                                    popup.value = value
                                }
                            ));

                            popup.show()

                        })
                    }

                    listings.listings.addEventListener('selectionchange', () => {
                        btnDel.state = listings.listings.checked_items.length == 0 ? 'disabled' : 'initial'
                    })



                    // The logic of dispatching events when the user selects a data item
                    this[main].html.addEventListener("click", (event) => {
                        const data = getDataFromHTML(event.target)
                        if (!data) {
                            return;
                        }
                        this.dispatchEvent(new CustomEvent('item-selected', { detail: data }))
                    })



                    // This section deals with the logic of showing a menu when the user hovers over an item on the listings widget.

                    /** This variable tells us if the mouse is over the actions html */
                    let mouseIsOverActions;

                    /** This variable stores the timeout key, that can be used to abort hiding of the actions html */
                    let actionsHideTimeout;

                    /** This variable contains the last listings item that the user hovered on */
                    let lastTarget;

                    /** This method hides the actions html */
                    const hide = () => {
                        cancelHide()

                        actionsHideTimeout = setTimeout(() => {
                            this.html.classList.remove('actions-visible')
                        }, 20_000)
                    }

                    /** This method stops the system from hiding the actions html */
                    const cancelHide = () => clearTimeout(actionsHideTimeout)

                    /**
                     * This method is called for whenever the mouse leaves an item on the listings widget
                     */
                    const onMouseLeaveItem = () => {
                        if (!mouseIsOverActions) {
                            hide()
                        }
                    }

                    /** @type {DataType} */
                    let selectedItem;

                    this[main].html.addEventListener('mousemove', new DelayedAction(
                        /**
                         * 
                         * @param {MouseEvent} event 
                         * @returns 
                         */
                        async (event) => {
                            /** @type {HTMLElement} */
                            let target = event.target
                            let done;

                            const dataItem = getDataFromHTML(event.target)

                            if (!dataItem) {
                                return
                            }
                            const actionsVisible = this.html.classList.contains('actions-visible');
                            if ((!actionsVisible) || (lastTarget !== target)) {
                                this.html.style.setProperty('--actions-top', `${target.getBoundingClientRect().bottom - this.html.getBoundingClientRect().top}px`)
                                this.html.style.setProperty('--actions-left', `${event.pageX - this.html.getBoundingClientRect().left}px`)
                                this.html.classList.add('actions-visible')
                                target.addEventListener('mouseleave', onMouseLeaveItem, { once: true })
                                cancelHide()
                                lastTarget = target;
                                done = true
                                await Promise.race(
                                    [
                                        new Promise(x => this.html.$('.container >.actions').addEventListener('transitionend', x)),
                                        new Promise(x => setTimeout(x, actionsVisible ? 350 : 0))
                                    ]
                                )
                            }


                            while (target != this[main].html) {
                                target = target.parentElement
                                if (target.tagName.toLowerCase() == 'tr') {
                                    const entry = target.widgetObject;
                                    selectedItem = entry?.columns[0].metadata;
                                    if (!selectedItem) return;

                                    break;
                                }

                            }

                            if (done) {

                                const loader = new Widget();
                                loader.html = hc.spawn({});
                                this.actions = [loader.html];

                                loader.blockWithAction(
                                    async () => {
                                        this.actions = (await config.actions?.(selectedItem)) || []
                                        loader.html.remove()
                                    }
                                );
                            }

                        }, 250, 2500))

                    this.html.$('.container >.actions').addEventListener('mouseenter', () => {
                        cancelHide()
                        mouseIsOverActions = true
                    })


                    this.html.$('.container >.actions').addEventListener('mouseleave', () => {
                        hide()
                        mouseIsOverActions = false
                    })







                    this.blockWithAction(async () => {
                        return await config.fetch()
                    }).then(async stream => {
                        for await (let item of stream) {
                            if (listings.statedata.content.length >= this[maxItems]) {
                                await new Promise(resolve => this.addEventListener('max-items-increased', resolve, { once: true }))
                            }

                            listings.statedata.content.push(item)

                        }
                    })
                }
            }
        );

        /** @type {GenericListings<DataType>} */
        this[main] = new GenericListings({ title });



    }

    get content() {
        /** @type {GenericListings<DataType>} */
        const listings = this[main]
        return listings.statedata.content
    }
    /**
     * @param {DataType[]} content
     */
    set content(content) {

        /** @type {GenericListings<DataType>} */
        const listings = this[main]
        listings.statedata.content = content
    }

    set title(title) {
        this[main].title = title;
    }

    get title() {
        return this[main].title
    }

    /** @readonly */
    static get classList() {
        return ['hc-htmlhc-list-data-manager']
    }

    /** @readonly */
    static NESTED_REGEXP = /^([^$]+)(\$|\.)([^$]+)$/

}


/**
 * @extends Widget<ItemView>
 */
class ItemView extends Widget {

    /**
     * 
     * @param {htmlhc.widget.list_data_manager.Display['view'])} view
     * @param {any} data 
     * @param {any} superdata
     */
    constructor(view, data, superdata) {
        super()

        this.html = hc.spawn(

            {
                classes: ItemView.classList,
                innerHTML: `
                    <div class='container'>
                    </div>
                `
            }
        );

        if (typeof view === 'string') {
            // For example ::image, ::text


            const standardRegExp = /^::(.+)$/
            if (standardRegExp.test(view)) {
                let html;
                switch (view) {
                    case "::image":
                        html = hc.spawn({
                            classes: ['hc-htmlhc-list-data-manager-item-standard-image'],
                            tag: 'img',
                            attributes: { src: data }
                        });
                        break;
                    default:
                        html = hc.spawn({ innerHTML: data })
                        break;
                }
                this.html.$('.container').appendChild(html)
            } else {
                this.blockWithAction(
                    async () => {
                        /** @type {Widget} */
                        const widget = new (await import(view)).default(data)
                        this.html.$('.container').appendChild(
                            widget.html
                        )
                    }
                )
            }
        }

        if (typeof view === 'function') {
            this.blockWithAction(
                async () => {
                    const value = await view(data, superdata)
                    this.html.$(':scope >.container').appendChild(
                        value instanceof HTMLElement ? value : hc.spawn({ innerHTML: value })
                    )
                }
            );
        }

    }

    /** @readonly */
    static get classList() {
        return ['hc-htmlhc-list-data-manager-item-view']
    }


}


const eq = (a, b) => JSON.stringify(a) == JSON.stringify(b)