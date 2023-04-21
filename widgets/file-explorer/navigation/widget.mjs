/**
 * Copyright 2022 HolyCorn Software
 * 
 * This widget is part of the file-explorer widget and allows for quick navigation
 */

import { hc, Widget } from "../../../lib/widget/index.mjs";
import * as ze_utils from "../util.mjs";
import NavigationItem from "./item.mjs";


export default class Navigation extends Widget {

    /**
     * 
     * @param {import("../types.js").FileExplorerStateData} statedata 
     */
    constructor(statedata) {
        super();

        this.html = hc.spawn({
            classes: ['hc-simple-file-explorer-navigation'],
            innerHTML: `
                <div class='container'>

                </div>
            `
        });

        /** @type {import("../types.js").FileExplorerStateData} */ this.statedata = statedata

        /** @type {import("../types.js").DirectoryData[]} **/ this.items
        this.pluralWidgetProperty({
            selector: '.hc-simple-file-explorer-navigation-item',
            property: 'items',
            parentSelector: '.container',
            immediate: true,
            transforms: {
                /**@param {import("../types.js").DirectoryData} data*/
                set: (data) => {
                    const widget = new NavigationItem(data);

                    const widget_onselect = () => {
                        this.statedata.current_path = data.id;
                    }
                    widget.addEventListener('select', widget_onselect)

                    return widget.html
                },
                get: (html) => {
                    /** @type {NavigationItem} */
                    const widget = html?.widgetObject;
                    return {
                        label: widget?.label,
                        id: widget?.id,
                        time: widget?.time,
                        parent: widget?.parent
                    }
                }

            }
        });

        this.statedata.$0.addEventListener(`current_path-change`, () => {
            this.draw()
        });

        this.statedata.$0.addEventListener(`items-$array-item-change`, () => {
            this.draw()
        });

        if (typeof this.statedata.current_path !== 'undefined' && this.statedata.items.length !== 0) {
            this.draw()
        }




    }

    async draw() {
        let path = ze_utils.getRootPath(this.statedata.current_path, this.statedata.items)
        this.items = [
            this.statedata.items.find(x => x.id == '') || { //Add a default option to return to the root view
                id: '',
                label: 'root'
            },

            ...path
        ]
    }

}