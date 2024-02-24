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
 * @template T
 */
export default class SlideIn extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {SlideIn['content']} param0.content
     */
    constructor({ content } = {}) {

        super();

        super.html = hc.spawn({
            classes: SlideIn.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'></div>
                </div>
            `
        });

        /** @type {HTMLElement<T>} */ this.content
        this.widgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.main',
                childType: 'html',
                property: 'content',
            }
        )

        Object.assign(this, arguments[0])

        this.destroySignal.addEventListener('abort', () => {
            this.dismiss()
        }, { once: true })


        this.html.style.setProperty('opacity', '0')
        this.html.style.setProperty('transform', 'translateY(-100%)')
    }

    async show() {
        this.html.remove()
        this.html.classList.remove('showing')
        this.html.style.setProperty('height', '0')
        this.html.style.removeProperty('transform')
        document.body.prepend(this.html)
        this.html.addEventListener('animationstart', () => {
            this.html.style.removeProperty('opacity')
            this.html.style.removeProperty('height')
        }, { once: true, signal: this.destroySignal })
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
                this.destroy()
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