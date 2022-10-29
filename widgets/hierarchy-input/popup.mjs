/**
 * Copyright 2022 HolyCorn Software
 * This widget is part of the hierarychy-input widget.
 * It is the popup where a user actually gets to make his choice
 */

import { hc } from "../../lib/widget/index.mjs";
import ActionButton from "../action-button/button.mjs";
import HCTSBrandedPopup from "../branded-popup/popup.mjs";
import FileExplorer from "../file-explorer/widget.mjs";

hc.importModuleCSS(import.meta.url);



export default class HierarchyInputPopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.max_top_path
     * @param {boolean} param0.modal
     */
    constructor({ max_top_path, modal } = {}) {
        super();

        /** @type {ActionButton} */
        let action_button;

        this.content = hc.spawn({
            classes: ['hc-hierarchy-input-popup-content'],
            children: [
                new FileExplorer().html,

                (action_button = new ActionButton({
                    content: `Select`,
                    onclick: () => {
                        this.dispatchEvent(new CustomEvent('complete'))
                    }
                })).html,

                hc.spawn({
                    classes: ['cancel-button'],
                    innerHTML: `Go back`,
                    onclick: () => {
                        this.hide()
                    }
                })
            ]
        });

        this.hideOnOutsideClick = !modal

        /** @type {function(('complete'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.explorer.statedata.$0.addEventListener('current_path-change', () => {
            action_button.state = this.path_is_valid(this.explorer.statedata.current_path) ? 'initial' : 'disabled'
        })

        /** @type {string} */
        this.max_top_path = max_top_path


    }
    get value() {
        let path = this.explorer.statedata.current_path
        if (!this.path_is_valid(path)) {
            return
        }
        return {
            id: path,
            label: this.explorer.statedata.items.filter(x => x.id === path)[0].label
        }
    }
    set value(value) {
        this.explorer.statedata.current_path = value.id
    }

    /**
     * @returns {FileExplorer}
     */
    get explorer() {
        return this.html.$("." + FileExplorer.classList.join("."))?.widgetObject
    }

    /**
     * @param {FileExplorer} widget
     */
    set explorer(widget) {
        this.content.appendChild(widget.html)
    }

    path_is_valid(path) {
        //For a path to be valid, it must be a child of the max_top_path or be the max_top_path

        if (this.max_top_path == undefined) {
            return true;
        }


        //To determine if the path is a child of the max_top_path, we trace the parent of the parent of the parent... and if we don't see the max_top_path in it, we let it go
        const get_item = (id) => this.explorer.statedata.items.find(x => x.id == id)

        let current_path = path;

        while (current_path !== '' && current_path !== undefined) {
            let item = get_item(current_path)
            if (item.parent === this.max_top_path) {
                return true;
            }
            current_path = item.parent
        }

        return false
    }


}