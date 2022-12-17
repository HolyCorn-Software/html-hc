/*
Copyright 2022 HolyCorn Software
This module helps engineers to create an object or an array whereby the object can be written to and will trigger 'change' event when written to
*/

import * as uuid from '/$/system/static/comm/uuid/index.js'



const recursiveGet = (obj, path) => {
    return eval(`obj?.${path.split('.').join('?.')}`)
}

/**
 * This method is used to set the value of a field deep down
 * @param {object} obj 
 * @param {string} path 
 * @param {any} value
 * @returns {void}
 */
const recursiveSet = (obj, path, value) => {
    const parts = path.split('.')

    for (let i = 0; i < parts.length; i++) {
        eval(`obj.${parts.slice(0, i + 1).join('.')} ||= {}`)
    }
    eval(`obj.${parts.join('.')} = value`)


}



const data_store_symbol = Symbol()

export default class AlarmObject extends EventTarget {

    constructor({ is_array, data = {} } = {}) {
        super();

        let dataStore = is_array ? [] : {}
        Object.assign(dataStore, data)

        let object = this;
        object[data_store_symbol] = dataStore

        object.unique_id = uuid.v4()

        return new Proxy(dataStore, {
            set: (target, property, value, receiver) => {
                if (value !== dataStore[property]) {
                    dataStore[property] = value;
                    recursive_dispatch(object, value, property)
                }
                return true;
            },
            get: (target, property, receiver) => {
                if (property === '$0') {
                    return object;
                }
                if (property === '$0data') {
                    return JSON.parse(JSON.stringify(dataStore));
                }


                const property_is_symbol = typeof property === 'symbol'

                let value = dataStore[property]

                if (forbidden(value) || property_is_symbol) {
                    return value;
                }

                if (typeof value === 'function') {
                    return (function () {
                        const previous_length = target.length
                        value.apply(target, arguments)
                        if (Array.isArray(target) && target.length !== previous_length) {
                            dispatch_change_event(object, `${property}.${target.length - 1}`)
                        }
                    }).bind(target)
                }

                if (typeof value === 'object') {
                    return new AlarmWrapper(value, object, property)
                }
                return value
            }
        })
    }

    /**
     * This method is used to wait till a particular field is available
     * @param {string} field 
     * @returns {Promise<void>}
     */
    async waitTillAvailable(field) {
        return await new Promise((resolve, reject) => {

            const checker = () => {
                const value = recursiveGet(this[data_store_symbol], field)
                if (value) {
                    resolve(value)
                    return true
                }
            }

            if (!checker()) {
                const interval = setInterval(() => {
                    if (checker()) {
                        clearInterval(interval)
                    }
                }, 100)
            }

        })
    }


    /**
     * This method is used to listen for events
     * @param {string} type 
     * @param {function} fxn 
     * @param {AddEventListenerOptions} options 
     * @param {boolean} immediate If set, the function will be called immediately
     */
    addEventListener(type, fxn, options, immediate) {
        const reply = super.addEventListener(type, fxn, options)
        if (immediate) {
            fxn()
        }
        return reply;
    }


    /**
     * This method is used to channel changes from a single AlarmObject to another. 
     * 
     * It sets up triggers such that, when particular fields change at the source, they get applied to the destination
     * @param {AlarmObject} alarmSrc 
     * @param {AlarmObject} alarmDst 
     * @param {[string]} fields
     * @returns {void}
     */
    static pipe(alarmSrc, alarmDst, fields) {


        for (let field of fields) {
            alarmSrc.$0.addEventListener(`${field}-change`, () => recursiveSet(alarmDst, field, recursiveGet(alarmSrc, field)))
        }
    }

}

class AlarmWrapper {

    /**
     * 
     * @param {object} object 
     * @param {AlarmObject} original_interface 
     * @returns {Proxy<object>}
     */
    constructor(object, original_interface, field_name) {

        //Some types of objects should not be proxied at all
        if (forbidden(object)) {
            return object;
        }

        return new Proxy(object, {
            get: (target, property, receiver) => {

                const value = Reflect.get(target, property, receiver)
                const property_is_symbol = typeof property === 'symbol'

                if (forbidden(value) || property_is_symbol) {
                    return value
                }

                if (typeof value === 'object') {
                    let new_field_name = Array.isArray(value) ? `${field_name}.${property}` : `${field_name}.${property}`

                    return new AlarmWrapper(value, original_interface, new_field_name)
                }

                if (typeof value === 'function') {
                    //Here, we are wrapping any function that's bound to the object
                    //Such that, after the function is called, if the function changes the content of the array, we dispatch an event for the positions that have been changed.

                    if (Array.isArray(target)) {

                        return (function () {
                            const previous_state = [...target]
                            let results = value.apply(target, arguments)

                            const array_differences = (prev, nw) => {
                                let changed_indexes = []
                                for (let i = 0; i < Math.max(prev.length, nw.length); i++) {
                                    if (prev[i] !== nw[i]) {
                                        changed_indexes.push(i)
                                    }
                                }
                                return changed_indexes
                            }

                            let changed_indexes = array_differences(previous_state, target)
                            if (changed_indexes.length !== 0) {
                                for (let i of changed_indexes) {
                                    dispatch_change_event(original_interface, `${field_name}.${i}`)
                                    dispatch_change_event(original_interface, `${field_name}-$array-item`, target[i], { field: i })
                                }
                                dispatch_change_event(original_interface, `${field_name}-$array-items`)
                            }

                            return results
                        }).bind(target)
                    }
                }

                return value
            },
            set: (target, property, value, receiver) => {
                Reflect.set(target, property, value, receiver);

                const number_property = new Number(property).valueOf()

                if (Array.isArray(target) && number_property === number_property) { //Seems silly to say number_property === number_property, but 
                    // NaN is the only number that is not equal to itself
                    dispatch_change_event(original_interface, `${field_name}-$array-item`, value, { field: property })
                }
                if (Array.isArray(target)) {
                    return true;
                }

                recursive_dispatch(original_interface, value, `${field_name}.${property}`)

                dispatch_change_event(original_interface, `${field_name}.*`)

                return true;
            },
            getPrototypeOf: (target) => {
                return Reflect.getPrototypeOf(target)
            }
        })
    }

}


/**
 * This method dispatches a change event for all fields within the object
 * @param {AlarmObject} original_interface 
 * @param {any} value 
 * @param {string} path 
 * @returns {void}
 */
function recursive_dispatch(original_interface, value, path) {

    dispatch_change_event(original_interface, path, value)

    if (typeof value !== 'object' || Array.isArray(value)) {
        return;
    }

    for (let key in value) {
        recursive_dispatch(original_interface, value[key], `${path}.${key}`)
    }
}


function forbidden(object) {
    //Some types of objects should not be proxied at all
    return (!Array.isArray(object)) && ((object instanceof HTMLElement) || typeof object === 'undefined' || object === null)

}


const dispatch_change_event = (object, property, value, extras) => {
    object.dispatchEvent(new CustomEvent('change', { detail: { field: property, value } }))
    object.dispatchEvent(new CustomEvent(`${property}-change`, { detail: { value, field: property, ...extras } }))
}
