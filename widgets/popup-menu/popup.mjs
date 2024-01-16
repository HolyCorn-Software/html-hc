/*
Copyright 2021 Holycorn Software
This module produces a popup menu which houses another HTML Element
Once the user clicks in the empty space around the white zone, the popup closes, with an animation
*/


import osBackButtonManager from "../../lib/util/os-back-button/manager.mjs";
import { Widget } from "../../lib/widget/index.mjs";

const processOutsideClick = Symbol()

export default class PopupMenu extends Widget {

    /**
     * All parameters are optional
     * @param {object} param0 
     * @param {HTMLElement} param0.content
     * @param {boolean} param0.hideOnOutsideClick
     */
    constructor({ content, hideOnOutsideClick } = {}) {

        super();

        /** @type {HTMLElement} */
        this.html = document.spawn({
            class: 'hc-v2-choose-popup hidden',
            innerHTML: `
                <div class='container'> <!-- Covers the entire HTML --->
                        <div class='wrapper'>
                            <div class='data'>
                                <!--- Where the popup will be shown -->
                            </div>
                        </div>
                    
                </div>
            `
        })

        /** @type {boolean} Should this popup hide if the user clicks outside ?*/ this.hideOnOutsideClick = true;

        //Establish the close action (clicking outside the box)
        this.html.addEventListener('click', ({ target }) => {

            const isOutside = target.isConnected && !this.html.$('.container >.wrapper >.data').contains(target);
            if (isOutside) {
                this.dispatchEvent(new CustomEvent("prehide"))
                this[processOutsideClick]();
            }
        })

        Object.assign(this, arguments[0])

        /** @type {function(('hide'|"prehide"), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        this.destroySignal.addEventListener('abort', () => this.hide(), { once: true })

    }


    [processOutsideClick]() {
        if (this.hideOnOutsideClick) { //If the click came from a source outside the content
            this.hide();
            return true
        }
    }

    /**
     * This defines what is shown on the Popup Menu
     */
    set content(html) {

        if (!html instanceof HTMLElement) {
            throw new Error('Sorry please pass an object of type HTMLElement')
        }

        this.html.$('.data').children[0]?.remove()

        this.html.$('.data').appendChild(html);
    }

    /**
     * @returns {HTMLElement}
     */
    get content() {
        return this.html.$('.data').children[0]
    }

    get visible() {
        return !this.html.classList.contains('hidden')
    }

    /**
     * Call this method to make the popup visible
     */
    show() {

        if (this.html.isConnected) {
            // Prevent double-calling of this method
            this.html.classList.remove('hidden')
            return;
        }
        document.body.classList.add('hc-v2-choose-popup-menu-be-static')
        this.html.classList.add('hidden')

        setTimeout(() => this.html.classList.remove('hidden'), 150);
        //Find other popups, and over-shadow them
        /** @type {HTMLElement} */
        let another = [...document.querySelectorAll('body >.hc-v2-choose-popup')].reverse()[0];

        if (another) {
            another.insertAdjacentElement('afterend', this.html)
        } else {
            document.body.prepend(this.html);
        }


        // The logic of making the popup close, if in an app environment, the system back button is pressed.
        const aborter = new AbortController()

        osBackButtonManager.register(
            {
                callback: () => this[processOutsideClick](),
                signal: aborter.signal,
                html: this.html
            }
        )

        // If the popup is hidden, then we stop listening for back button events.
        this.html.addEventListener('hc-disconnected-from-dom', () => {
            aborter.abort()
        }, { once: true })

        // And, if for some reason, the popup is destroyed prematurely, then we would also need to stop listening to back button events
        this.destroySignal.addEventListener('abort', () => { aborter.abort() }, { once: true })

    }

    async loadBlock(html) {
        const target = this.html.$('.container >.wrapper >.data')
        super.loadBlock(html || target.children[0] || target)
    }
    /**
     * Call this method to hide the popup
     * 
     * Since closing the popup takes time, this method is async, and will resolve once the popup is fully closed.
     */
    hide() {
        return new Promise(done => {
            document.body.classList.remove('hc-v2-choose-popup-menu-be-static')
            this.html.classList.add('closing')

            this.html.addEventListener('transitionend', () => {
                this.html.remove();
                this.html.classList.add('hidden');
                this.html.classList.remove('closing')
                this.dispatchEvent(new CustomEvent('hide'))
                done();

            }, { once: true });
        })
    }

}


export {
    /** @deprecated Use the default import instead */
    PopupMenu
}