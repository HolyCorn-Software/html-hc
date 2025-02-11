/*
Copyright 2021 HolyCorn Software
Standard button that can be in a beautiful loading state
*/

import Spinner from "../infinite-spinner/widget.mjs";
import { hc } from "../../lib/widget/index.mjs";
import { Widget } from "../../lib/widget/index.mjs";
import { ActionButtonMessageAPI } from "./message.mjs";

let states;
const state_load_promise = new Promise((resolve, reject) => {
    Promise.all(
        [
            'success',
            'waiting',
            'disabled',
        ].map(async x => ({ module: await import(`./states/${x}/index.mjs`), name: x }))).then(stateInfo => {
            states = stateInfo
            resolve()
        }).catch(e => reject(e))
})


hc.importModuleCSS(import.meta.url)


const contentSetPromise = Symbol()

export default class ActionButton extends Widget {

    /**
     * 
     * @param {object} param0 
     * @param {typeof this.content} param0.content
     * @param {typeof this.onclick} param0.onclick
     * @param {typeof this.state} param0.state
     * @param {boolean} param0.hoverAnimate
     */
    constructor({ content, onclick, state, hoverAnimate } = {}) {

        super()

        super.html = hc.spawn({
            classes: [ActionButton.classList, 'hoverAnimate'],
            innerHTML: `
                <div class='container'>
                    <div class='overlay'></div>
                    <div class='content'></div>
                </div>
            `
        })

        this.spinner = new Spinner();
        this.notification = new ActionButtonMessageAPI(this);

        let state_change_promise;
        /**
         * So that setting the 'state' attribute to a given value will lead to executing a module named after the value
         */
        Widget.__htmlProperty(this, this.html, '__state__', 'attribute', async (newState) => {

        }, 'state')

        Reflect.defineProperty(this, 'state', {
            set: async (state) => {

                await new Promise(x => setTimeout(x, 10))

                if (state === this.state) {
                    return;
                }

                await state_load_promise;
                await state_change_promise


                let [stateData] = states.filter(x => x.name === state)

                //Remove any previous states
                if (this.state) {
                    states.filter(x => x.name == this.state)[0]?.module.default.unset(this)
                }
                if (stateData) {
                    //Execute the module on this button, to set the state
                    await (state_change_promise = stateData.module.default.set(this))
                } else {
                    //Return to default state
                }

                this.__state__ = state
            },
            get: () => this.__state__
        })


        /** @type {('success'|'waiting'|'disabled' | 'initial')} */ this.state;

        /** @type {function(('click'), function(CustomEvent), AddEventListenerOptions} */ this.addEventListener

        /** @type {boolean} */ this.hoverAnimate
        this.htmlProperty(undefined, 'hoverAnimate', 'class')


        Object.assign(this, arguments[0])
        this.html.addEventListener('click', () => this.dispatchEvent(new CustomEvent(('click'))));

    }
    set content(content) {


        (async () => {

            try {
                await this[contentSetPromise]
            } catch { }


            this[contentSetPromise] = (async () => {

                content =
                    content instanceof HTMLElement ? content
                        : typeof content == 'string' ?
                            hc.spawn({
                                innerHTML: content,
                                classes: ['hc-action-button-content']
                            })
                            : content.html instanceof HTMLElement ?
                                content.html : undefined;
                if (!content) {
                    throw new Error(`Pass either a string or an HTMLElement or a Widget`)
                }

                const contentView = this.html.$('.content');
                const existing = contentView.children[0];


                if (existing) {
                    // Then calculate the difference in widths
                    // If the content needs to expand, let's do it gently
                    const currentDimen = existing.getBoundingClientRect()
                    content.classList.add('hc-action-button-frozen-content')
                    this.html.$('.content').appendChild(content)
                    await new Promise(x => setTimeout(x, 300))
                    const nwDimen = content.getBoundingClientRect();
                    content.remove();
                    content.classList.remove('hc-action-button-frozen-content')

                    if (nwDimen.width != currentDimen.width) {
                        const handle = hc.watchToCSS({
                            source: this.html,
                            watch: {
                                dimension: 'width'
                            },
                            apply: (value) => {
                                if (expanding) {
                                    contentView.style.setProperty('--end-width', value)
                                }
                            },
                            propagationDelay: 0
                        })
                        const expanding = nwDimen.width > currentDimen.width;
                        const classList = ['hc-action-button-dimension-change', expanding ? 'expanding' : 'shrinking']
                        this.html.classList.add(...classList)
                        contentView.style.setProperty('--start-width', `${currentDimen.width}px`)
                        contentView.style.setProperty('--end-width', `${nwDimen.width}px`)
                        contentView.style.setProperty('--initial-height', `${currentDimen.height}px`)

                        await new Promise(x => setTimeout(x, 1000))

                        this.html.classList.remove(...classList)
                        handle.destroy()

                    }
                    [...contentView.children].forEach(x => x.remove())
                }
                contentView.appendChild(content)
                await new Promise(x => setTimeout(x, Math.random() * 5000))
            })()

        })()

    }

    get content() {
        return this.html.$('.content').children[0]
    }

    /**
     * @deprecated 
     * Use state='waiting' instead
     */
    set waiting(boolean) {
        if (boolean) {
            this.spinner.start()
            this.spinner.attach(this.html.$('.overlay'))
        } else {
            this.spinner.detach()
            this.spinner.stop()
        }
    }

    /** @param {function(this:ActionButton): void} functIon */
    set onclick(functIon) {
        this.html.onclick = () => {
            const result = functIon?.call(this)
            if (result instanceof Promise) {
                let done;
                result.finally(() => done = true)
                setTimeout(() => {
                    if (done) {
                        return;
                    }
                    this.state = 'waiting'
                    result.finally(() => {
                        setTimeout(() => {
                            if (this.state == 'waiting') {
                                this.state = 'initial'
                            }
                        }, 200)
                    })
                }, 50)
            }
            return result
        }
    }

    /** @returns {function(this:ActionButton): void} */
    get onclick() {
        return this.html.onclick;
    }
    static get classList() {
        return ['hc-action-button']
    }
}