/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This widget represents a single directory in the file-explorer widget
 */

import AlarmObject from "../../../lib/alarm/alarm.mjs";
import { hc, Widget } from "../../../lib/widget/index.mjs";




export default class FileExplorerItem extends Widget {

    /**
     * 
     * @param {import("../types.js").DirectoryData} data 
     * @param {import("../types.js").FileExplorerAction[]} actions
     */
    constructor(data, actions) {
        super();



        /** @type {import("./types.js").DirectoryStateData} */ this.data
        this.data = new AlarmObject()

        if (!data.custom_html) {



            this.html = hc.spawn({
                classes: ['hc-simple-file-explorer-item', 'no-transitions'],
                innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <img class='icon'>
                        <div class='label'>Some Directory</div>
                    </div>

                    <div class='actions'></div>
                    
                </div>
            `
            });

            setTimeout(() => this.html.classList.remove('no-transitions'), 100)

        /** @type {string} **/ this.label
            this.htmlProperty('.container >.main >.label', 'label', 'innerHTML')

        /** @type {string} **/ this.icon
            Reflect.defineProperty(this, 'icon', {
                get: () => this.html.$('.container >.main >img.icon').getAttribute('src'),
                set: (src) => {
                    this.html.$('.container >.main >img.icon').setAttribute('src', new URL(src, hc.getCaller(1)).href)
                },
                configurable: true,
                enumerable: true
            });

        /** @type {import("../types.js").FileExplorerAction[]} **/ this.actions
            this.pluralWidgetProperty({
                selector: '.action',
                property: 'actions',
                parentSelector: '.container >.actions',
                transforms: {
                    /**@param {import("../types.js").FileExplorerAction} data*/
                    set: (data) => {
                        const html = hc.spawn({
                            classes: ['action'],
                            innerHTML: `${data.label}`,
                            onclick: () => data.onclick(this)
                        });
                        return html
                    },
                    get: (html) => {
                        /** @type {HTMLElement} */
                        const widget = html?.widgetObject;
                        return { label: widget.label, action: widget.onclick }
                    }

                }
            });

            this.actions = actions


            this.data.$0.addEventListener(`label-change`, () => {
                this.label = this.data.label
            })


            this.data.$0.addEventListener(`icon-change`, () => {
                this.icon = new URL(this.data.icon, hc.getCaller(3)).href;
            })


        /** @type {function(('select'|'delete'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

            this.html.$('.container >.main').addEventListener('click', () => {
                setTimeout(() => this.dispatchEvent(new CustomEvent('select')), 3); //Give time for some click listeners on popups to detect that the click came from us. If not the FileExplorer widget will remove us immediately and the popup will think the click came from outside
            });

            Object.assign(this.data, data);


            this.data.icon = data.icon || '/$/shared/static/logo.png'
        } else { // That is, custom_html is set, therefore, we should not go through the default part, but directly alter the html of the widget

            if (!(data.custom_html instanceof HTMLElement)) {
                throw new Error(`custom_html should be an HTMLElement`)
            }
            data.custom_html.classList.add('hc-simple-file-explorer-custom-html')
            this.html = data.custom_html
        }


    }

}