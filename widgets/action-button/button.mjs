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




/**
 * @extends Widget<ActionButton>
 */
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

        super({ css: import.meta.url })

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

        this.html.$('.content').children[0]?.remove()
        this.html.$('.content').appendChild(content)
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
        this.html.onclick = () => functIon?.call(this)
    }

    /** @returns {function(this:ActionButton): void} */
    get onclick() {
        return this.html.onclick;
    }
    static get classList() {
        return ['hc-action-button']
    }
}