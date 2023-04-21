/**
 * Copyright 2023 HolyCorn Software
 * This widget (search-list), allows inputs to be constructed, such that the user gets to select 
 * one or more options, from an "infinite" searchable list of options
 */

import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import { hc, Widget } from "../../lib/widget/index.mjs";
import SearchListPopupMain from "./main/main.mjs";

const main = Symbol()

const icons = Symbol()


/**
 * @template T
 */
export default class SearchListPopup extends Widget {


    /**
     * 
     * @param {object} param0
     * @param {SearchListPopupTypes.SearchFunction<T>} param0.doSearch 
     * @param {SearchListPopupTypes.ValueToDataFunction<T>} param0.transformValue
     * @param {SearchListPopupTypes.ListSizeLimits} param0.listSize
     * @param {boolean} param0.hideOnOutsideClick
     */
    constructor({ doSearch, transformValue, listSize, hideOnOutsideClick } = {}) {
        super();

        console.log(`The list size is `, listSize)

        this.html = hc.spawn(
            {
                classes: SearchListPopup.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='label'></div>
                        <div class='main'>
                            <div class='caption'>Tap to select</div>
                            <div class='icons'></div>
                        </div>
                    </div>
                `
            }
        );

        /** @type {SearchListPopupMain<T>} */
        this[main] = new SearchListPopupMain()

        this.html.$('.container >.main').addEventListener('click', () => this[main].show())

        /** @type {string} */ this.searchPrompt
        Reflect.defineProperty(this, 'searchPrompt', {
            get: () => this[main].search.label,
            set: v => this[main].search.label = v,
            configurable: true,
            enumerable: true
        });

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')

        /** @type {typeof this[main]['doSearch']} */ this.doSearch
        /** @type {typeof this[main]['transformValue']} */ this.transformValue
        /** @type {typeof this[main]['hideOnOutsideClick']} */ this.hideOnOutsideClick
        /** @type {typeof this[main]['listSize']} */ this.listSize
        for (const property of ['doSearch', 'transformValue', 'hideOnOutsideClick', 'listSize']) {

            Reflect.defineProperty(this, property, {
                get: () => this[main][property],
                set: v => this[main][property] = v,
                configurable: true,
                enumerable: true
            });
        }

        /** @type {string[]} */ this[icons]
        this.pluralWidgetProperty(
            {
                selector: 'img',
                parentSelector: '.container >.main >.icons',
                property: icons,
                transforms: {
                    set: (string) => {
                        return hc.spawn({ tag: 'img', attributes: { src: string } })
                    },
                    get(html) {
                        return html?.getAttribute('src')
                    }
                }
            }
        );




        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this[main].addEventListener('change',
            new DelayedAction(() => {
                this[icons] = this[main].selected.map(x => x.image)
                this.html.classList.toggle('empty', this[icons].length === 0)
                this.dispatchEvent(new CustomEvent('change'))
            }, 1500)
        )


        this.html.classList.add('empty')

        Object.assign(this, arguments[0])

    }


    get value() {
        return this[main].selected.map(x => x.value)
    }
    /**
     * @param {T[]} value
     */
    set value(value) {

        (this[fxnSetValue] ||= new DelayedAction(
            (value) => {
                this.loadWhilePromise((async () => {
                    const results = await Promise.allSettled(
                        value.map(x => this.transformValue(x))
                    );
                    this[main].selected = results.filter(x => x.status === 'fulfilled').map(x => x.value)
                    const failed = results.filter(x => x.status === 'rejected')
                    if (failed.length > 0) {
                        throw new Error(`Some values have been removed from your screen, because they could not be transformed to human readable form.\n${failed.map(x => x.reason).join("\n\n")}`)
                    }
                })())
            }, 150
        ))(value)

    }



    static get classList() {
        return ['hc-search-list-popup']
    }

}

const fxnSetValue = Symbol()