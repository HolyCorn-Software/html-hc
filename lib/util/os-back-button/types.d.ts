/**
 * Copyright 2023 HolyCorn Software
 * The eHealthi Project
 * This module contains type definitions for the os-back-button module
 */


import ''

global {
    namespace ehealthi.ui.app.os_back_button {
        interface ListenerOptions {
            /**
             * This method is expected to return true, if component wants the system to remain in the current screen, and not go back.
             * On the other hand, any falsish return would mean the system should go back.
             * If the component doesn't want to make a decision, it should call the {@link CallbackArgs.pass pass()} method
             * 
             */
            callback: (args: CallbackArgs) => boolean
            /**
             * This optional field is for efficiency.
             * 
             * If passed, the callback would only be called, when this html is connected to the DOM.
             */
            html?: HTMLElement

            /**
             * When this signal aborts, the listener would be removed
             */
            signal: AbortSignal

        }

        interface CallbackArgs {
            pass: () => void
        }
    }
}