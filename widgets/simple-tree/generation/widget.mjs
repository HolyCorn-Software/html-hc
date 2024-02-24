/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The simple-tree widget
 * This sub-widget (generation), represents a set of elements, that are supposedly 
 * a part of a tree, or some higher generation
 */


import DelayedAction from "../../../lib/util/delayed-action/action.mjs";
import Item from "./item.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
/**
 * This sub-widget (generation), represents a set of elements, that are supposedly 
 * a part of a tree, or some higher generation 
 */
export default class Generation extends Widget {


    /**
     * 
     * @param {htmlhc.widget.simpletree.TreeData} treedata 
     * @param {string} id
     */
    constructor(treedata, id) {

        super();

        super.html = hc.spawn({
            classes: Generation.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                    <div class='next-gen'></div>
                </div>
            `
        });

        const items = Symbol()

        const forceRestoreNextgenState = () => {
            this.html.classList.remove('next-gen-hiding')
        }
        const restoreNextgenState = new DelayedAction(forceRestoreNextgenState, 1200)

        /** @type {htmlhc.widget.simpletree.Item[]} */ this[items]
        this.pluralWidgetProperty(
            {
                selector: ['', ...Item.classList].join('.'),
                parentSelector: '.container >.items',
                property: items,
                transforms: {
                    set: (data) => {
                        const widget = new Item(data)
                        let hideTimeout;

                        widget.html.addEventListener('click', () => {



                            if (this.html.classList.contains('next-gen-showing')) {
                                this.html.classList.add('next-gen-hiding')
                                const shouldForce = typeof this.html.$('.container >.items .no-children') !== 'undefined'
                                if (shouldForce) {
                                    forceRestoreNextgenState()
                                } else {
                                    restoreNextgenState()
                                }
                                clearTimeout(hideTimeout)
                                hideTimeout = setTimeout(() => {
                                    [...this.html.$('.container >.items').children].forEach(x => {
                                        x.classList.remove('active')
                                        x.classList.remove('no-children')
                                    })
                                    this.html.classList.remove('next-gen-showing')
                                }, shouldForce ? 0 : 780)
                            } else {

                                clearTimeout(hideTimeout)
                                this.html.classList.add('next-gen-showing')
                                widget.html.classList.add('active')

                                const thisChildren = treedata.filter(x => x.parent === data.id);
                                switch (thisChildren.length) {
                                    case 0:
                                        widget.html.classList.add('no-children');
                                        [...this.html.$(`.container >.next-gen >.${Generation.classList.join('.')}`).children].forEach(x => x.remove());
                                        return
                                }




                                this[nextgen] = data.id

                            }

                        })
                        widget.html.scrollIntoView()
                        return widget.html
                    },
                    get: (html) => {
                        return html.widgetObject?.data
                    }
                },
                onchange: () => {
                    this.html.classList.toggle('has-ancestors', this.id !== undefined)
                    this.html.classList.toggle('has-just-one-child', this[items].length == 1)
                }
            }
        );

        hc.watchToCSS(
            {
                source: this.html.$('.items'),
                target: this.html.$('.next-gen'),
                watch: {
                    dimension: 'width',
                },
                apply: '--parent-generation-width',
                signal: this.destroySignal
            }
        );

        hc.watchToCSS(
            {
                source: this.html.$('.items'),
                target: this.html,
                watch: {
                    dimension: 'width',
                },
                apply: '--generation-width',
                signal: this.destroySignal
            }
        );



        const nextgen = Symbol()
        /** @type {string} */ this[nextgen]
        this.widgetProperty(
            {
                selector: ['', ...Generation.classList].join("."),
                parentSelector: '.container >.next-gen',
                property: nextgen,
                transforms: {
                    set: (genId) => {
                        return new Generation(treedata, genId).html
                    },
                    /** @param {htmlhc.lib.widget.ExtendedHTML<Generation>} html*/
                    get: html => html.widgetObject?.id
                }
            }
        )


        /** @type {string} */ this.id
        let _id;
        Reflect.defineProperty(this, 'id', {
            set: str => {
                this[items] = treedata.filter(x => x.parent === str)
                _id = str

            },
            get: () => _id,
            configurable: true,
            enumerable: true
        })

        this.id = id



    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-simple-tree-generation'];
    }
}