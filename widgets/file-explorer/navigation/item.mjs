/**
 * Copyright 2022 HolyCorn Software
 * This widget is part of the file-explorer navigation widget, and represents a single item that can be clicked to jump to a path
 */

import { hc, Widget } from "../../../lib/widget/index.mjs";



export default class NavigationItem extends Widget {

    /**
     * 
     * @param {import("../types.js").DirectoryData} data 
     */
    constructor(data) {
        super();

        this.html = hc.spawn({
            classes: ['hc-simple-file-explorer-navigation-item'],
            innerHTML: `
                <div class='container'>

                </div>
            `
        });

        /** @type {string} **/ this.label
        this.htmlProperty('.container', 'label', 'innerHTML')

        /** @type {string} */ this.id

        
        /** @type {function(('select'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.html.$('.container').addEventListener('click', () => {
            //Since this action will lead to the clicked item being removed from the screen, let's delay a bit
            //So that the click listeners on popup menus will detect that the click came from us. Otherwise they'll think the click came from elsewhere and they'll close the popup
            setTimeout(()=>this.dispatchEvent(new CustomEvent('select')), 3)
        })


        Object.assign(this, data)
    }

}