/**
 * Copyright 2022 HolyCorn Software
 * This widget allows for creating interfaces that have to do with navigating directories
 */

import FileExplorerItem from "./item/widget.mjs";
import Navigation from "./navigation/widget.mjs";
import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";
import * as ze_util from './util.mjs'
import AlarmObject from "../../lib/alarm/alarm.mjs";
import ActionButton from "../action-button/button.mjs";



export default class FileExplorer extends Widget {

    /**
     * 
     * @param {import("./types.js").DirectoryData[]} directories 
     * @param {import("./types.js").FileExplorerParams} options
     */
    constructor(directories, options) {
        super();

        /** @type {import("./types.js").FileExplorerStateData} */ this.statedata
        this.statedata = new AlarmObject()
        /** @type {import("./types.js").FileExplorerParams} */
        this.options = options || {}

        this.statedata.loading_items = []
        this.statedata.items = []


        this.html = hc.spawn({
            classes: FileExplorer.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='navigation'></div>
                        <div class='actions'></div>

                        <div class='stage'></div>
                        <div class='stage-actions'></div>
                    </div>
                </div>
            `
        });

        /** @type {Navigation} **/ this.navigation
        this.widgetProperty({
            selector: '.hc-simple-file-explorer-navigation',
            property: 'navigation',
            childType: 'widget',
            parentSelector: '.container >.main >.navigation'
        });

        this.navigation = new Navigation(this.statedata);

        /** @type {import("./types.js").DirectoryData[]} **/ this.stageItems
        this.pluralWidgetProperty({
            selector: '.hc-simple-file-explorer-item',
            property: 'stageItems',
            parentSelector: '.container >.main >.stage',
            transforms: {
                /**@param {import("./types.js").DirectoryData} data*/
                set: (data) => {

                    const is_root = data.id == '0';


                    //This variable holds the actions that are available to the single item being added
                    let context_actions = [];

                    //First things first, we add the static actions
                    context_actions.push(
                        ...(this.options?.actions?.filter(action => {
                            return action.locations.indexOf(is_root ? 'context_root' : 'context_noneroot') !== -1
                        }) || [])
                    )

                    //Then we add fetch and add the dynamic actions
                    let dynamic_actions = this.options?.on_create_action?.(data) || []

                    context_actions.push(
                        ...dynamic_actions.filter(action => action.location === 'context')
                    )

                    context_actions.push(
                        ...(data.actions || [])
                    )


                    const widget = new FileExplorerItem(data, context_actions);


                    const widget_onselect = () => {

                        widget.data.onselect?.()
                        setTimeout(() => this.dispatchEvent(new CustomEvent('select', { detail: widget.data.$0data })), 200);

                        if (!(widget.data.navigable ?? true)) {
                            return;
                        }
                        this.statedata.current_path = data.id
                    }

                    widget.addEventListener('select', widget_onselect)

                    //If something triggers the 'delete' event on this widget, we'll just interprete it and remove the widget
                    widget.addEventListener('delete', () => {
                        widget.html.remove()
                        this.statedata.items = this.statedata.items.filter(z => z.id !== widget.data.id)
                        widget.removeEventListener('select', widget_onselect)
                    })

                    widget.data.$0.addEventListener('label-change', () => {
                        this.statedata.items.filter(z => z.id === widget.data.id)[0].label = widget.data.label;
                    })

                    return widget.html
                },
                get: (html) => {
                    /** @type {FileExplorerItem} */
                    const widget = html?.widgetObject;
                    return widget.data
                }

            }
        });


        /** @type {FileExplorerItem[]} **/ this.stageItemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-simple-file-explorer-item',
            property: 'stageItemWidgets',
            parentSelector: '.container >.main >.stage',
            childType: 'widget'
        })

        /** @type {function(('select'|'draw'), function(CustomEvent<import("./types.js").DirectoryData>), AddEventListenerOptions)} */ this.addEventListener

        this.stageItems = []

        /** @type {import("./types.js").FileExplorerAction[]} This is an internal variable used to directly display actions on the widget. Don't write to this, you will be overriden **/ this.stageActions
        this.pluralWidgetProperty({
            selector: '.hc-action-button',
            property: 'stageActions',
            parentSelector: '.container >.main >.stage-actions',
            transforms: {
                /**
                 * 
                 * @param {import("./types.js").FileExplorerAction} data 
                 */
                set: (data) => {
                    return new ActionButton({
                        content: data.label,
                        onclick: data.onclick
                    }).html
                },
                /**
                 * 
                 * @param {import("../lib/widget.js").ExtendedHTML & {widgetObject: ActionButton}} action 
                 */
                get: (action) => {
                    return {
                        label: action?.widgetObject.content,
                        onclick: action?.widgetObject.onclick
                    }
                }
            }
        });


        //The navigation widget and the parent widget will share statedata

        this.statedata.$0.addEventListener(`current_path-change`, () => {
            this.draw();
            this.check_loading()
        });

        this.statedata.$0.addEventListener('items-$array-item-change', () => {
            if (typeof this.statedata.current_path !== 'undefined') {
                this.draw();
                this.check_loading()
            }
        });

        this.statedata.$0.addEventListener('items-change', () => {
            if (typeof this.statedata.current_path == 'undefined') {
                this.statedata.current_path = ''
            }
            this.draw();
            this.check_loading()
        })

        this.statedata.$0.addEventListener(`loading_items-change`, () => this.check_loading())
        this.statedata.$0.addEventListener(`loading_items-$array-item-change`, () => this.check_loading())

        if (directories) {
            this.statedata.items = directories;
            this.statedata.current_path = ''
        }

    }


    async draw() {
        [...this.html.$$('.container >.main >.stage .hc-simple-file-explorer-custom-html')].map(x => x.remove())
        this.stageItems = ze_util.getImmediateChildren(this.statedata.current_path, this.statedata.items)

        let global_actions = this.options?.actions?.filter(action => {
            return action.locations.indexOf(this.statedata.current_path === '' ? 'global_root' : 'global_noneroot') !== -1
        }) || []

        global_actions.push(
            ...(this.options?.on_create_action?.(this.statedata.items.filter(itm => itm.id === this.statedata.current_path)[0]) || [])
        )

        this.stageActions = global_actions

        this.dispatchEvent(new CustomEvent('draw'))

        setTimeout(() => this.check_loading(), 500);
    }

    /**
     * This method removes an item as well as all sub, and sub-sub items attached to it.
     * @param {string} id 
     */
    deleteItem(id) {

        let current_ids = [id]
        const suspects = [id]
        while (current_ids.length > 0) {
            const batch = this.statedata.items.filter(x => current_ids.some(id => x.parent === id))
            current_ids = batch.map(x => x.id)
            suspects.push(
                ...current_ids
            )
        }

        this.statedata.items = this.statedata.items.filter(item => suspects.every(sus => (sus != item.id) && (sus != item.parent)))

        for (let suspect of suspects.slice(1)) {
            this.deleteItem(suspect)
        }

    }

    /**
     * This method is used internally to ensure that the elements that are supposed to be loading stay loading and those that are not should not
     */
    async check_loading() {

        for (let widget of this.stageItemWidgets) {
            if (typeof widget === 'undefined') {
                continue
            }
            const current_path_is_loading = this.statedata.loading_items.findIndex(x => x === this.statedata.current_path) !== -1
            if (this.statedata.loading_items?.indexOf(widget?.data.id) !== -1 || current_path_is_loading) {
                widget.loadBlock()
            } else {
                widget.loadUnblock()
            }
        }
    }

    /**
     * This method waits till the user navigates to a stated path.
     * In other words, returns a promise that resolves once the user has visited the specified path
     * @param {string} path 
     * @returns {Promise<void>}
     */
    waitTillPath(path) {
        return new Promise((resolve, reject) => {
            const on_change = () => {
                if (this.statedata.current_path === path) {
                    resolve()
                    this.removeEventListener('current_path-change', on_change)
                }
            };
            this.statedata.$0.addEventListener('current_path-change', on_change)
        })
    }

    static get classList() {
        return ['hc-simple-file-explorer']
    }
}