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
 * @template FunctionOutput
 * @extends htmlhc.lib.util.delayedAction.FunctionType<FunctionInput>
 */
export default class DelayedAction extends Object {

    /**
     * 
     * @param {(...input: FunctionInput)=>FunctionOutput} action The function to be executed
     * @param {number} delay The time that we must wait before the action is peformed
     * @param {number} maxTime The highest time beyond which an action cannot be delayed
     */
    constructor(action, delay, maxTime = Infinity) {
        super()
        let timeout;
        let startTime;
        let currPromise;
        let currPromise_resolve, prePromise_reject;
        return (...args) => {
            startTime ||= Date.now()
            if ((Date.now() - startTime) <= maxTime) {
                clearTimeout(timeout)
                let nwPromise_reject, nwPromise_resolve;

                let nwPromise = new Promise((resolve, reject) => {
                    nwPromise_reject = reject
                    nwPromise_resolve = resolve
                })

                if (currPromise) {
                    nwPromise.then(currPromise_resolve, prePromise_reject)
                }

                currPromise = nwPromise;
                currPromise_resolve = nwPromise_resolve;
                prePromise_reject = nwPromise_reject;

                timeout = setTimeout(async () => {
                    startTime = undefined
                    try {
                        currPromise_resolve(await action(...args))
                    } catch (e) {
                        prePromise_reject(e)
                    }
                }, delay)
            }
            return currPromise
        }
    }
}