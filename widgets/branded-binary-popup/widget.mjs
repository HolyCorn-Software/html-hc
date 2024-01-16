/**
 * Copyright 2022 HolyCorn Software
 * This widget allows us to easily develop a popup that shows a user two simple options
 */


import { hc } from "../../lib/widget/index.mjs";
import HCTSBrandedPopup from "../branded-popup/popup.mjs";
import { handle } from "../../../errors/error.mjs";
import ActionButton from "../action-button/button.mjs";

hc.importModuleCSS(import.meta.url);

/**
 * 
 * Allows to easily create a popup with a true-or-false-like options model
 * 
 * 
 * The execute parameter contains the function that will be executed if the user clicks yes.
 * 
 * Take care to throw any errors you caught in your execute() method because without any errors, the popup will think execution was successful.
 * 
 * Don't bother about handling the error and showing the user. It'll do this automatically for you
 * 
 */
export default class BrandedBinaryPopup extends HCTSBrandedPopup {

    constructor({ title, question, positive, negative, execute } = {}) {
        super({
            content: document.spawn({
                class: 'hc-branded-binary-popup-content',
                innerHTML: `
                    <div class='container'>
                        <div class='title'>Do you like JavaScript ?</div>
                        <div class='question'></div>
                        <div class='actions'></div>
                    </div>
                `
            })
        });

        let yes = new ActionButton({
            content: 'Yes'
        });
        let no = new ActionButton({
            content: 'No'
        });

        no.html.addEventListener('click', () => {
            this.hide();
        }, { signal: this.destroySignal })

        yes.html.addEventListener('click', () => {
            this.#do_action(yes)
        }, { signal: this.destroySignal })

        this.content.$('.actions').appendChild(yes.html)
        this.content.$('.actions').appendChild(no.html)

        for (var X of [[yes, 'positive'], [no, 'negative']]) {
            let x = X

            Reflect.defineProperty(this, x[1], {
                set: v => x[0].content = v,
                get: () => x[0].content
            })
        }

        /** @type {string} */ this.question

        /** @type {string} */ this.title


        //Define the properties and check if they were passed
        for (var x of ['question', 'title']) {

            this.htmlProperty(`.${x}`, x, 'innerHTML');
            this.htmlProperty(`.${x}`, x, 'innerHTML');

            if (!arguments[0][x]) {
                throw new Error(`${x} is required !`)
            }
        }

        Object.assign(this, arguments[0])

    }

    async execute() {

    }

    /**
     * 
     * @param {ActionButton} yesButton 
     */
    async #do_action(yesButton) {
        yesButton.state = 'waiting'

        try {
            await this.execute()
            yesButton.state = 'success'
            await new Promise(x => setTimeout(x, 1500))
            this.destroy()
        } catch (e) {
            yesButton.state = 'initial'
            handle(e)
        }

    }

}