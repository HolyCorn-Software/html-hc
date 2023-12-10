/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This utility (exec-control, also known as Execution Control), allows functions to be called in special ways.
 * For example, in a synchronized way, that allows only one call at a time.
 */



export default class ExecControl {

    /**
     * 
     * @param {(...args: Args) => Ret} fxn 
     * @param {htmlhc.lib.util.exec_control.Params} params 
     */
    constructor(fxn, params) {
        const value = fxn
        if (params.synchronized) {
            value = new SynchronizedExecControl(value)
        }
        return value
    }
}




class SynchronizedExecControl {

    constructor(fxn) {
        const callQueue = []

        const processQueue = () => {
            const item = callQueue.shift()
            if (!item) {
                return;
            }
            (async () => {
                try {
                    item.resolve(await fxn(...item.args))
                } catch (error) {
                    item.reject(error)
                }
                processQueue()
            })()
        }

        const main = (...args) => {
            return new Promise((resolve, reject) => {
                callQueue.push({ args, resolve, reject })
                if (callQueue.length == 1) {
                    processQueue()
                }
            })
        }
        return main
    }

}