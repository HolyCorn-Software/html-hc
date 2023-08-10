/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This widget, called slidein, allows for UIs that slide from top to bottom,
 * or from bottom to top
 */


import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
const timeout = Symbol()

/**
 * This widget, behaves like a notification that can slide from top to bottom, or 
 * bottom to top 
 * @extends Widget<SlideIn>
 */
export default class SlideIn extends Widget {


    constructor() {

        super();

        super.html = hc.spawn({
            classes: SlideIn.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'></div>
                </div>
            `
        });

        /** @type {HTMLElement} */ this.content
        this.widgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.main',
                childType: 'html',
                property: 'content',
            }
        )
    }

    async show() {
        this.html.remove()
        this.html.classList.remove('showing')
        document.body.prepend(this.html)
        this.html.classList.add('showing')
    }

    /**
     * This method hides the slide-in widget
     * @param {number} time 
     * @returns {Promise<void>}
     */
    async dismiss(time) {
        clearTimeout(this[timeout])

        this[timeout] = setTimeout(() => {
            this.html.classList.add('hiding')
            this.html.classList.remove('showing')
            const abort = new AbortController()
            new Promise((resolve) => {
                const events = ['animationend', 'transitionend'];
                for (const event of events) {
                    this.html.addEventListener(event, resolve, { once: true, signal: abort.signal })
                }
                setTimeout(resolve, 2000)
            }).then(() => {
                this.html.remove()
                this.html.classList.remove('hiding');
                abort.abort()
            })
        }, time)
    }


    /**
     * @readonly
     */
    static get classList() {
        return ['hc-slide-in'];
    }
}