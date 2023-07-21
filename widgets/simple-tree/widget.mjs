/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This widget (simple-tree), allows for designs that have to show a tree-like structure,
 * where elements exists beneath other elements.
 * It is called simple-tree because, each element can have only one parent
 */


import Generation from "./generation/widget.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
/**
 * This widget (simple-tree), allows for designs that have to show a tree-like structure,
 * where elements exists beneath other elements.
 * It is called simple-tree because, each element can have only one parent
 * @extends Widget<SimpleTree>
 */
export default class SimpleTree extends Widget {


    /**
     * 
     * @param {htmlhc.widget.simpletree.TreeData} data 
     */
    constructor(data = []) {

        super();

        super.html = hc.spawn({
            classes: SimpleTree.classList,
            innerHTML: `
                <div class='container'>
                    <div class='items'></div>
                </div>
            `
        });

        (() => {

            const data = Symbol()

            /** @type {htmlhc.widget.simpletree.TreeData} */ this.data;

            this.widgetProperty(
                {
                    selector: ['', ...Generation.classList].join('.'),
                    parentSelector: '.container >.items',
                    property: 'data',
                    transforms: {
                        /**
                         * 
                         * @param {htmlhc.widget.simpletree.TreeData} input 
                         */
                        set: (input) => {
                            this[data] = input;
                            return new Generation(input, undefined).html
                        },
                        get: () => {
                            return this[data]
                        }
                    }
                }
            )
        })();


        this.data = data



    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-simple-tree'];
    }
}