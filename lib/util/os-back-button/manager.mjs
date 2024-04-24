/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * The Web Faculty.
 * 
 * This module allows components to handle instances of user clicking the OS back button.
 */


const observers = Symbol()

const onOSBack = Symbol()


class OSBackButtonManager {



    constructor() {
        /** @type {Array<ehealthi.ui.app.os_back_button.ListenerOptions>} */ this[observers] = [];


    }

    /**
     * This method is called by the operating system, when the back button is pressed.
     * If it returns true, the current view would be maintained; otherwise we'll navigate to the previous view, or quit the app.
     * @returns {boolean}
     */
    [onOSBack]() {

        for (let i = 0; i < this[observers].length; i++) {
            if ((this[observers][i].html?.isConnected ?? true) && !this[observers][i].signal.aborted) {
                let passed;
                const result = this[observers][i].callback({ pass: () => passed = true })
                if (!passed) {
                    return result
                }
            }
        }

        return false
    }

    /**
     * This method registers a listener for the OS back button events
     * @param {ehealthi.ui.app.os_back_button.ListenerOptions} options 
     */
    register(options) {
        if (!(options.signal instanceof AbortSignal)) {
            throw new Error(`signal, is supposed to be an AbortSignal.`)
        }
        const entry = { ...options }
        this[observers] = [...new Set([entry, ...this[observers]])]
        options.signal.addEventListener('abort', () => {
            this[observers] = this[observers].filter(x => x != entry)
        }, { once: true })
    }


}

const osBackButtonManager = new OSBackButtonManager()

window.onOSBackButton = () => osBackButtonManager[onOSBack]();


export default osBackButtonManager