/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The flex-reveal widget
 * This widget allows the user to tap a button, that reveals another UI
 */

import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import { Widget, hc } from "../../lib/widget/index.mjs";




/**
 * @template {HTMLElement} Content
 * @extends Widget<FlexReveal>
 */
export default class FlexReveal extends Widget {

    constructor() {
        super();
        super.html = hc.spawn(
            {
                classes: [...FlexReveal.classList, 'calculating'],
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='trigger'></div>
                            <div class='content'></div>
                        </div>
                    </div>
                `
            }
        );

        const icon = Symbol()
        this.defineImageProperty({ selector: '.container >.main >.trigger', property: icon, mode: 'inline', cwd: import.meta.url })
        this[icon] = './trigger.svg'

        /** @type {Content} */ this.content
        this.widgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.main >.content',
                property: 'content',
                childType: 'html',
            }
        );

        /**
         * The logic of expanding, and contracting the widget is simple.
         * The widget can either be in expanded, or calculating mode.
         * 
         * When in calculating mode, the width of the content is calculated, and stored in the hc-flex-reveal-content-width property.
         * When the trigger button is clicked, it moves to expanded mode, and cancels calculating mode.
         * 
         * When in expanded mode, an animation plays, moving the content from max-width:0px, to hc-flex-reveal-content-width.
         * 
         * When the trigger is clicked in expanded mode, the expanded mode is canceled, and an animation plays to shrink the widget to zero.
         * After that, the widget is placed in calculating mode, and a new hc-flex-reveal-content-width is calculated.
         * 
         */


        const toggle = () => {
            if (this.html.classList.contains('calculating') && !this.html.classList.contains('expanded')) {
                this.html.classList.remove('calculating')
            }
            this.html.classList.toggle('expanded')

            new Promise((resolve) => {
                setTimeout(resolve, 1500)
                this.html.$('.container >.main >.content').addEventListener('animationend', resolve, { once: true })
            }).then(() => {
                if (!this.html.classList.contains('calculating') && !this.html.classList.contains('expanded')) {
                    this.html.classList.add('calculating')
                    compute()
                }
            })
        }

        this.html.$('.container >.main >.trigger').addEventListener('click', toggle);

        const compute = new DelayedAction(() => {
            if (this.html.classList.contains('calculating')) {
                this.html.style.setProperty('--hc-flex-reveal-content-width', `${this.html.$('.container >.main >.content').getBoundingClientRect().width}px`)
            }
        }, 250)

        this.waitTillDOMAttached().then(compute)

        new MutationObserver(compute).observe(this.html.$('.container >.main >.content'), { childList: true, attributes: true, subtree: true })


        // Now, the logic that enables the widget to contract in case the user leaves
        let collapseTimeout;
        this.html.addEventListener('mouseleave', () => {
            if (this.html.classList.contains('expanded')) {
                clearTimeout(collapseTimeout)
                collapseTimeout = setTimeout(() => {
                    if (this.html.classList.contains('expanded')) {
                        toggle()
                    }
                }, 5000)
            }

        });

        this.html.addEventListener('mouseover', () => clearTimeout(collapseTimeout))

    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-flex-reveal']
    }

}