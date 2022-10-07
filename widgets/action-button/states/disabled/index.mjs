/**
 * Copyright 2022 HolyCorn Software
 * This sub-module allows the action button to be in a disabled state
 * 
 */

import { hc } from "../../../../lib/widget/index.mjs";
import ActionButton from "../../button.mjs";

export default{

    /**
     * 
     * @param {ActionButton} button 
     */
    async set(button){
        button.html.classList.add('disabled-state')
        await waitForTransitionEnd(button)
    },

    /**
     * 
     * @param {ActionButton} button 
     */
    async unset(button){
        button.html.classList.remove('disabled-state')
        await waitForTransitionEnd(button)
    }
    
}

/**
 * This function is used internally. The function waits till it's the end of any transition that was ongoing at the time the method was called.
 * @param {ActionButton} button 
 */
function waitForTransitionEnd(button){
    return new Promise(resolve=>{
        button.html.addEventListener('transitionend', resolve);
        setTimeout(()=> resolve(), 1000); //No matter what the wait should not be more than 1s
    })
}

hc.importModuleCSS(import.meta.url, './style.css')