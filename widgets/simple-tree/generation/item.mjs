/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The simple-tree widget
 * This sub-widget (item), represents a single item, that belongs to a part of the tree
 */


import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

const hidden = Symbol()

/**
 * This sub-widget (item), represents a single item, that belongs to a part of the tree 
 * @extends Widget<Item>
 */
export default class Item extends Widget {


    /**
     * 
     * @param {htmlhc.widget.simpletree.Item} data 
     */
    constructor(data) {

        super();

        super.html = hc.spawn({
            classes: Item.classList,
            innerHTML: `
                <div class='container'>
                    <div class='image'></div>
                    <div class='label'></div>
                </div>
            `
        });

        /** @type {string} */ this.icon
        this.defineImageProperty(
            {
                selector: '.container >.image',
                property: 'icon',
                cwd: import.meta.url,
                mode: 'inline',
            }
        );

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')


        this[hidden] = {
            id: data?.id,
            parent: data?.parent,
        }

        this.icon = data?.icon
        this.label = data?.label


    }

    get data() {
        return {
            ...this[hidden],
            icon: this.icon,
            label: this.label
        }
    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-simple-tree-generation-item'];
    }
}