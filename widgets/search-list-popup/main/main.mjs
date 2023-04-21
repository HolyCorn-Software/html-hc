/**
 * Copyright 2023 HolyCorn Software
 * This widget is the main part of the search-list-popup widget
 */

import DelayedAction from "../../../lib/util/delayed-action/action.mjs";
import { hc } from "../../../lib/widget/index.mjs";
import ActionButton from "../../action-button/button.mjs";
import { PopupMenu } from "../../popup-menu/popup.mjs";
import SearchInput from "../../search-input/widget.mjs";
import SearchListPopupItem from "./option.mjs";
import SearchListItemView from "./search-item-view.mjs";

hc.importModuleCSS(import.meta.url);



const dispatchChange = Symbol()
const dispatchTimeout = Symbol()


/**
 * @template T
 */
export default class SearchListPopupMain extends PopupMenu {


    /**
     * 
     * @param {object} param0 
     * @param {boolean} param0.hideOnOutsideClick
     * @param {string} param0.searchPrompt
     */
    constructor(param0) {

        super(
            {
                hideOnOutsideClick: param0?.hideOnOutsideClick ?? true,
            }
        );

        this.content = hc.spawn(
            {
                classes: SearchListPopupMain.classList,
                innerHTML: `
            
                <div class='container'>
                    <div class='top'>
                        <div class='title'>Make a selection</div>
                        <div class='caption'>Start by typing in the box to search. </div>
                    </div>

                    <div class='search'>
                        <!-- section involved with search -->
                    </div>

                    <div class='options'>
                        <!-- Selected items -->
                    </div>

                    <div class='action'>
                        <!-- Buttons which the user can click -->
                    </div>
                    
                </div>
                `
            }
        );

        this.html.classList.add('hc-search-list-popup-main-frame')
        const selectorPrefix = '.' + SearchListPopupMain.classList[0]

        /** @type {SearchInput<SearchListPopupTypes.SearchListPopupItemData<T>>} */ this.search
        this.widgetProperty(
            {
                selector: ['', ...SearchInput.classList].join('.'),
                parentSelector: `${selectorPrefix} .container >.search`,
                property: 'search',
                childType: 'widget'
            }
        );

        this.search = new SearchInput(
            {
                hooks: {
                    fetchItems: async (filter) => {
                        return await this?.doSearch(filter)

                    },
                    getLabel: (item) => {
                        return item.label
                    },
                    getValue: (item) => {
                        return item
                    },
                    getView: (item) => {
                        return new SearchListItemView(item).html
                    }
                }
            }
        );

        this.search.addEventListener('change', () => {
            if (this.search.value) {
                //Let's check for size constraints

                for (let i = 0; i < (this.selected.length - (this.listSize?.max - 1)); i++) {
                    this[items][i].removeUI()
                }
                this.selected.push(this.search.value)
                this.search.setValue(undefined)
                this.dispatchEvent(new CustomEvent('change'))
            }
        })

        /** @type {SearchListPopupTypes.SearchListPopupItemData<T>[]} */ this.selected
        this.pluralWidgetProperty(
            {
                selector: ['', ...SearchListPopupItem.classList].join('.'),
                parentSelector: `${selectorPrefix} .container >.options`,
                property: 'selected',
                transforms: {
                    /**
                     * 
                     * @param {typeof this['selected']['0']} d 
                     */
                    set: (d) => {
                        const widget = new SearchListPopupItem(d);
                        widget.addEventListener('remove', () => {
                            for (let w of this[items]) {
                                if (w.value === widget.value) {
                                    w.removeUI();
                                }
                            }
                            this[dispatchChange]()
                        });
                        this[items].find(x => x.value === d.value)?.removeUI()
                        this[dispatchChange]()
                        return widget.html
                    },
                    /**
                     * 
                     * @returns {typeof this['selected']['0']}
                     */
                    get: (html) => {
                        /** @type {SearchListPopupItem} */
                        const widget = html?.widgetObject
                        return { label: widget?.label, value: widget?.value, image: widget?.image }
                    }
                }
            }
        );

        const items = Symbol();

        /** @type {SearchListPopupItem<T>[]} */ this[items] = []
        this.pluralWidgetProperty(
            {
                selector: ['', ...SearchListPopupItem.classList].join('.'),
                parentSelector: `${selectorPrefix} .container >.options`,
                property: items,
                childType: 'widget'
            }
        );

        /** @type {ActionButton} */ this.btnSelect
        this.widgetProperty(
            {
                selector: ['', ...ActionButton.classList].join('.'),
                parentSelector: `${selectorPrefix} >.container >.action`,
                property: 'btnSelect',
                childType: 'widget'
            }
        );

        this.btnSelect = new ActionButton(
            {
                content: `Okay`,
                onclick: () => this.hide()
            }
        );


        /** @type {SearchListPopupTypes.SearchFunction<T>} */ this.doSearch
        /** @type {SearchListPopupTypes.ValueToDataFunction<T>} */ this.transformValue
        /** @type {SearchListPopupTypes.ListSizeLimits} */ this.listSize


        /** @type {function(('hide'|'change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener



    }
    static get classList() {
        return ['hc-search-list-popup-main']
    }
    [dispatchChange] = new DelayedAction(() => {
        this.dispatchEvent(new CustomEvent('change'))
    }, 150)

}