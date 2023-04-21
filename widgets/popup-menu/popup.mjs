/*
Copyright 2021 Holycorn Software
This module produces a popup menu which houses another HTML Element
Once the user clicks in the empty space around the white zone, the popup closes, with an animation
*/


import { hc, Widget } from "../../lib/widget/index.mjs";

hc.importModuleCSS(import.meta.url);

export default class PopupMenu extends Widget {

    /**
     * All parameters are optional
     * @param {object} param0 
     * @param {HTMLElement} param0.content
     * @param {boolean} param0.hideOnOutsideClick
     */
    constructor({ content, hideOnOutsideClick } = {}) {

        super({ css: import.meta.url });

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
        this.html.on('click', ({ target }) => {

            if (!this.html.$('.container >.wrapper >.data').contains(target) && this.hideOnOutsideClick) { //If the click came from a source outside the content
                this.hide();
            }
        })

        Object.assign(this, arguments[0])

        /** @type {function(('hide'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

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