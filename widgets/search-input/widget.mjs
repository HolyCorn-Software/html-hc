/**
 * Copyright 2022 HolyCorn Software
 * This widget is a special type of user input that provides the user the possibility of searching through a list of options, and then finally selecting one. More like providing auto complete. What is technical is that, the widget deals with labels and values
 * As the user types, his input is used to search for items. The list of possible options is built. If he selects an option in the list, the value of the widget becomes the value of the item, and the content of the input box becomes the label of the item
 * 
 * This widget can be used in MultiFlexForm by taking advantage of the customWidget property
 * 
 * Note, if you implement this widget and it happens that items get automatically checked, check that the hooks.getValue() doesn't return undefined
 */

import Spinner from "../infinite-spinner/widget.mjs";
import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";
import { SearchInputItem } from "./item.mjs";


/**
 * @template T
 */
export class SearchInput extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {boolean} param0.is_multi_select
     * @param {import("./types.js").SearchInputHooks<T>} param0.hooks This interface contains the implementation of basic features such as find 
     * @param {string} param0.label
     */
    constructor({ is_multi_select, hooks, label } = {}) {
        super();

        this.html = hc.spawn({
            classes: SearchInput.classList,
            innerHTML: `
                <div class='container'>
                    <div class='input-section'>
                        <input>
                    </div>

                    <div class='details-section'>
                        <div class='actions'></div>
                        <div class='content'></div>
                    </div>
                    
                </div>
            `
        });

        this.html.$('input').addEventListener('click', () => this.details_showing = true)

        /** @type {[SearchInputItem]} */ this.items
        this.pluralWidgetProperty({
            selector: '.hc-search-input-item',
            parentSelector: '.container >.details-section >.content',
            property: 'items',
            childType: 'widget'
        });


        /** @type {{items:[object], filter:string}} */
        this[items_cache_symbol] = { items: [], filter: '' }

        /** @type {boolean} */ this.details_showing
        this.htmlProperty(undefined, 'details_showing', 'class', undefined, 'details-showing')

        this[details_section_spinner] = new Spinner()

        /** @type {string} */ this.label
        this.htmlProperty('.container', 'label', 'attribute')

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        /** @type {boolean} */ this.is_multi_select

        /** @type {[{label:string, onclick:()=>void}]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: '.action',
                parentSelector: '.container >.details-section >.actions',
                property: 'actions',
                transforms: {
                    /**
                     * 
                     * @param {{label:string, onclick: ()=>void}} data 
                     */
                    set: (data) => {
                        return hc.spawn({
                            classes: ['action'],
                            innerHTML: data.label,
                            onclick: data.onclick
                        })
                    },
                    get: (html) => {
                        return {
                            innerHTML: html.innerHTML,
                            onclick: html.onclick
                        }
                    }
                }
            }
        );

        this.actions = [
            {
                label: 'X',
                onclick: () => this.details_showing = false
            }
        ]

        /**
         * @type {[{value:any, label:string}]}
         */
        this[values_symbol] = []


        this.setupListeners();

        Object.assign(this, arguments[0])


    }

    static get classList() {
        return ['hc-search-input']
    }

    /**
     * @param {import("./types.js").SearchInputHooks<T>} hooks
     */
    set hooks(hooks) {
        if (hooks === undefined) {
            return;
        }

        for (let key of ['fetchItems', 'getView', 'getLabel', 'getValue']) {
            if (typeof hooks[key] === 'undefined') {
                throw new Error(`The Hooks object passed lacks the '${key}' method`)
            }
        }

        this[hooks_symbol] = hooks
        this.setupListeners()
    }

    /**
     * @returns {import("./types.js").SearchInputHooks<T>}
     */
    get hooks() {
        return this[hooks_symbol]
    }


    /**
     * This method setups key listeners and general logic controlling when to fetch items and when to display it
     */
    setupListeners() {

        /**
         * This makes sure search is done when the user inputs keys
         */
        const setup_search = () => {
            let input = this.html.$('input')
            input.addEventListener('keydown', () => this.input_keypressed())
        }



        /**
         * This method makes sure the label above the input drops inwards when the input box is empty
         * 
         */
        const setup_label_placeholder = () => {

            let input = this.html.$('input');

            let doIt = () => {
                this.html.$('.container').classList[input.value === '' ? 'add' : 'remove']('empty')
            }


            let changeTimeout;

            this.addEventListener('change', () => {
                clearTimeout(changeTimeout);
                changeTimeout = setTimeout(doIt, 500);
            })


            // We don't want to wait till the user exits the textbox before a change event is fired. We want it on the fly
            for (let event of ['keydown', 'keypress', 'change']) {
                input.addEventListener(event, () => {
                    this.dispatchEvent(new CustomEvent('change'));
                });
            }

            doIt()
        }

        setup_label_placeholder()
        setup_search()
    }
    /**
     * This method is called when a key is pressed
     */
    input_keypressed() {
        //When a key is pressed, and it is time to search,
        //We don't just react immediately
        //We give it 300ms for the user to settle

        clearTimeout(this[timeout_symbol]);

        this[timeout_symbol] = setTimeout(() => {
            //But, first things first, show the list of options
            this.details_showing = true;
            //Now search
            do_search()
        }, 300)


        const do_search = () => {
            //There are two types of search
            //new search and filter search.
            //new search fetches data via the external source
            //filter search looks at the search cache and filters the items according to the input
            //Well, we search as long as the number of characters is less than 5


            let input = this.html.$('input')


            const newSearch = async () => {
                //Now search from the external source.
                await this.block_details_section();
                let filter = input.value;
                let data = await this.hooks.fetchItems(filter)
                await this.unblock_details_section();
                //Store the search results
                this[items_cache_symbol].filter = filter
                this[items_cache_symbol].items = data
                //Display the UI
                this.items = []
                await this.drawItems(data);
            }

            const filterSearch = async (string) => {
                //Searching from our list of pre-fetched items
                const item_matches = (item) => {
                    return Reflect.ownKeys(item).some(key => {
                        return ((typeof item[key] === 'string') || (typeof item[key] === 'number')) && (item[key].toString().toLowerCase().indexOf(string.toLowerCase()) !== -1)
                    })
                }

                let matching_items = this[items_cache_symbol].items.filter(item => item_matches(item))
                this.items = []
                await this.drawItems(matching_items);
            }


            //======================================Logic begins here==========================================
            if (input.value.length < 3 || !this[items_cache_symbol] || this[items_cache_symbol].items.length < 3) {
                newSearch(input.value)
            } else {
                //Do filter search if and only if the keywords used during the last search are contained in the current search
                if (this[items_cache_symbol].filter !== '' && input.value.startsWith(this[items_cache_symbol].filter)) {
                    filterSearch(input.value);
                } else {
                    newSearch(input.value)
                }
            }

        }
    }

    get value() {
        return this.is_multi_select ? [...this[values_symbol]].map(x => x.value) : this[values_symbol][0]?.value
    }

    updateStrings() {
        this.html.$('input').value = this.is_multi_select ? "" : this[values_symbol].map(x => x.label).join(' ')
    }

    setValue(item) {
        if (typeof item !== 'undefined') {
            const input = { value: this.hooks.getValue(item), label: this.hooks.getLabel(item) }
            this[values_symbol] = this.is_multi_select ? [...this[values_symbol], input] : [input]
        } else {
            this[values_symbol] = []
            this.details_showing = false
        }
        this.updateStrings()
        this.dispatchEvent(new CustomEvent('change'))
    }

    unsetValue(item) {
        //TODO: If this is multiselect, add the value to list of items
        const value = this.hooks.getValue(item);
        const new_items = this[values_symbol].filter(x => x == x.value === value)

        this[values_symbol] = new_items

        this.updateStrings()
        this.dispatchEvent(new CustomEvent('change'))
    }

    invalidateCache() {
        this[items_cache_symbol].items = []
        this[items_cache_symbol].filter = ''
        this.items = []
    }

    /**
     * This takes in a set of items and draws it on the details section
     * @param {[object]} items 
     */
    async drawItems(items) {

        //When displaying an item...
        //We create some empty space for it, and start a loader, while fetching the HTML content
        //When we are done fetching the content, we append it and take away the loader
        for (let _item of items) {
            let widget = new SearchInputItem({ multi_select: this.is_multi_select });
            this.items.push(widget)
            let item = _item;
            if (this.is_multi_select) {
                for (let old_item of this[values_symbol]) {
                    if (this.hooks.getValue(item) === old_item.value) {
                        widget.checkbox.checked = true
                    }
                }
            }
            (async () => {
                await widget.loadBlock()
                try {
                    let content = await this.hooks.getView(item)
                    await widget.loadUnblock();

                    widget.content = content;

                    let widget_on_select = () => {
                        if (!this.html.contains(widget.html)) {
                            return widget.removeEventListener('select', widget_on_select)
                        }
                        this.setValue(item)

                        if (!this.is_multi_select) {
                            this.details_showing = false;
                        }
                    }

                    widget.addEventListener('select', widget_on_select)


                    let widget_on_deselect = () => {
                        if (!this.html.contains(widget.html)) {
                            return widget.removeEventListener('deselect', widget_on_select)
                        }

                        this.unsetValue(item)
                    }

                    widget.addEventListener('deselect', widget_on_deselect)

                } catch (e) {
                    console.warn(`Unhandled error `, e)
                }
            })()
        }
    }

    async block_details_section() {
        await this[details_section_spinner].start()
        await this[details_section_spinner].attach(this.html.$('.details-section >.content'))
    }
    async unblock_details_section() {
        await this[details_section_spinner].detach()
        await this[details_section_spinner].stop();
    }


    static get testWidget() {
        let si = new SearchInput()
        let items = [];

        const randomSelect = (array) => array[Math.floor(Math.random() * 10) % array.length]

        for (let i = 0; i < 20; i++) {
            items.push({
                email: randomSelect(['akwotom@gmail.com', 'ngwaemail@gmail.com', 'customer@dears.com']),
                names: randomSelect(['Akwo Tom', 'Email Service', 'Dear Customer'])
            })
        }
        // console.log(`Starting with `, items)
        si.hooks = {
            fetchItems: async () => items,
            getLabel: (item) => item.names,
            getView: (item) => {
                return hc.spawn({
                    innerHTML: `
                        <div class='container' style="display:flex;flex-direction:column;gap:1em;padding-left:0.5em;">
                            <div class='names'>${item.names}</div>
                            <div class='email'>${item.email}</div>
                        </div>
                    `
                })
            },
            getValue: (item) => item.email
        }

        return si;
    }

}


const hooks_symbol = Symbol(`SearchInput.prototype.hooks`)

const items_cache_symbol = Symbol(`SearchInput.prototype.items_cache`)

const timeout_symbol = Symbol(`SearchInput.prototype.timeout`)

const details_section_spinner = Symbol(`SearchInput details section spinner widget`)


const values_symbol = Symbol(`SearchInput.prototype.values`)


export default SearchInput