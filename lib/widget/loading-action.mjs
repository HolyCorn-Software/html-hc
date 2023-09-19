/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This utility in the html-hc library, allows us to create a compulsory action for a widget, that would present the user with
 * a retry button if it failed.
 * Basically, a promise is passed, and the widget loads as long as the promise pending. If the promise rejects, a UI would
 * be created for the user to retry loading.
 * If another widget has recovered from a similar error, the widget automatically retries
 */

import { hc } from "./index.mjs";



const execute = Symbol()
const target = Symbol()
const errorUI = Symbol()
const execPromise = Symbol()
const showErrorUI = Symbol()
const onRecovered = Symbol()
const watcher = Symbol()

class WidgetActionGlobalEvents extends EventTarget {

    constructor() {
        super();

        /** @type {(event: "recovered", cb: (event: CustomEvent)=> void, opts: AddEventListenerOptions} */ this.addEventListener
    }

}
const events = new WidgetActionGlobalEvents()

/**
 * @template RType
 */
export class WidgetAction {

    /**
     * 
     * @param {import("./index.mjs").Widget} widget 
     * @param {()=>RType} action 
     */
    constructor(widget, action) {
        this[target] = widget
        this[execute] = action
    }

    /**
     * This method actually executes the action, with the safety of an error UI
     * @returns {RType}
     */
    execute = () => {
        if (this[execPromise]) {
            return this[execPromise];
        }

        events.removeEventListener('recovered', this[onRecovered])

        this[execPromise] = true
        const lastError = this[errorUI]?.message

        this[watcher]?.destroy()
        this[errorUI]?.html?.remove()
        this[errorUI]?.removeEventListener('retry', this.execute)
        this[target].html.classList.remove('hc-htmlhc-loading-action-is-errored')

        this[execPromise] = this[target].loadWhilePromise((async () => {
            return await this[execute]()
        })());
        this[execPromise].then(() => {
            if (lastError) {
                events.dispatchEvent(new CustomEvent('recovered', { detail: { message: lastError } }))
            }
        }).catch((e) => this[showErrorUI](e)).finally(() => delete this[execPromise])

        return this[execPromise]
    }

    /**
     * 
     * @param {Error} error 
     */
    async [showErrorUI](error) {

        this[errorUI] = await createErrorUI(error)
        this[errorUI].addEventListener('retry', this.execute, { once: true })
        events.addEventListener('recovered', this[onRecovered])
        this[target].html.prepend(this[errorUI].html)
        this[target].html.classList.add('hc-htmlhc-loading-action-is-errored')
        this[watcher] = hc.watchToCSS({
            source: this[target].html,
            target: this[errorUI].html,
            watch: {
                dimension: 'width'
            },
            apply: '--hc-htmlhc-loading-action-errored-target-width'
        })
        this[watcher] = hc.watchToCSS({
            source: this[target].html,
            target: this[errorUI].html,
            watch: {
                dimension: 'height'
            },
            apply: '--hc-htmlhc-loading-action-errored-target-height'
        })
    }

    /**
     * This method is called when another WidgetAction has recovered from an error.
     * Our job is to check if the error is similar, and then retry our own action.
     * @param {CustomEvent<{message: string}>} event 
     */
    [onRecovered] = (event) => {
        if (event.detail.message?.startsWith(this[errorUI]?.message) || this[errorUI]?.message.startsWith(event.detail.message)) {
            this.execute()
        }
    }
}

let theClass;

/**
 * @param {Error} error
 * @returns {Promise<ErrorUI>}
 */
async function createErrorUI(error) {
    if (theClass) {
        return new theClass(...arguments)
    }


    class ErrorUI extends (await import('./widget.mjs')).__Widget {

        /**
         * 
         * @param {Error} error 
         */
        constructor(error) {
            super();
            this.html = hc.spawn({
                classes: ErrorUI.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='info'></div>
                            <div class='actions'>
                                <div class='retry'>Retry</div>
                            </div>
                        </div>
                    </div>
                `
            });

            /** @type {string} */ this.message
            this.htmlProperty('.container >.main >.info', 'message', 'innerHTML')
            this.message = error.message || error

            /** @type {(event: "retry", cb: (event: CustomEvent)=> void, opts: AddEventListenerOptions} */ this.addEventListener
            this.html.$('.container >.main >.actions >.retry').addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('retry'))
            })


        }
        static get classList() {
            return ['hc-htmlhc-loading-action-error-ui']
        }

    }
    theClass = ErrorUI
    return new theClass(...arguments)
}

hc.importModuleCSS(import.meta.url)