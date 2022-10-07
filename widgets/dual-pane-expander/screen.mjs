/**
 * Copyright 2022 HolyCorn Software
 * The dual-pane-expander widget
 * This sub-widget (screen) controls the secondary part of the widget. 
 * When a user clicks on the primary part, some content is drawn on the secondary part
 */



import { hc, Widget } from "../../lib/widget/index.mjs";
import DualPaneExpander from "./widget.mjs";


export default class Screen extends Widget {

    /**
     * 
     * @param {DualPaneExpander} parent 
     */
    constructor(parent) {
        super();

        this.html = hc.spawn({
            classes: ['hc-dual-pane-expander-screen'],
            innerHTML: `
                <div class='container'>
                    <div class='title'></div>
                    <div class='content'></div>
                    <div class='action'></div>
                </div>
            `
        });



        /** @type {string} */ this.title
        this.widgetProperty(
            {
                parentSelector: '.container >.title',
                selector: '*',
                property: 'title',
            }
        )

        /** @type {HTMLElement} */ this.content
        this.widgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.content',
                property: 'content',
                childType: 'html',

            }
        )

        /** @type {[HTMLElement]} */ this.actions
        this.pluralWidgetProperty({
            selector: '*',
            property: 'actions',
            parentSelector: '.container >.action',
            immediate: true,
            childType: 'html'
        });

        this.parent = parent;

    }

}