/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This utility allows more organized, and synchronized access to any given method.
 * 
 * Basically, instead of having the method execute each time it is called,
 * the execution is delayed by (for example) 300ms, and if another call is made before the timeout,
 * the call will cancel the previous call, and delay by more 300ms
 * 
 * One very important application of this utility is performing updates based on user interaction.
 * 
 */



/**
 * @template FunctionInput
 * @extends htmlhc.lib.util.delayedAction.FunctionType<FunctionInput>
 */
export default class DelayedAction extends Object {

    /**
     * 
     * @param {(...input: FunctionInput)=>any} action The function to be executed
     * @param {number} delay The time that we must wait before the action is peformed
     */
    constructor(action, delay) {
        super()
        let timeout;
        return (...args) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => action(...args), delay)
        }
    }
}