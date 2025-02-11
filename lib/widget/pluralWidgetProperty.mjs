/*
Copyright 2021 HolyCorn Software
This module achieves one function, provide us with the pluralWidgetProperty
*/

import DelayedAction from "../util/delayed-action/action.mjs";
import { Widget } from "./index.mjs";



/**
 * The aim of this class is to provide a convinient way to add and remove children of an element that have been returned as a result of the pural widget property
 * @template ArrayType
 * @augments Array<ArrayType>
 */
export class PluralWidgetArray extends Object {

    /**
     * 
     * @param {{
     * parent: HTMLElement,
     * selector:string,
     * destroySignal: AbortSignal,
     * transforms:{
     * set:function(any):HTMLElement,
     * get:function(HTMLElement):any,
     * immediate: boolean
     * onchange: function
     * }
     * }} param1 
     * @returns {[HTMLElement|Widget]}
     */
    constructor({ parent, transforms, selector, destroySignal, immediate, onchange }) {
        super();

        const safeOnchange = new DelayedAction(() => onchange?.(), 20);

        /** @type {HTMLElement[]} */
        const array = [...parent.querySelectorAll(selector)]
        array.events = new EventTarget();

        /** @type {{addEventListener: function(('change'), function(CustomEvent), AddEventListenerOptions)} & EventTarget} */ this.events

        let virgin = true;

        let last_ignored = false;

        //If the list of elements change, refresh our copy of the real world
        new MutationObserver(new DelayedAction(() => {
            refreshInternalArray()
            safeOnchange()
        }, 20)).observe(parent, { childList: true })


        function refreshInternalArray() {

            let affected_elements = [...parent.querySelectorAll(selector)]
            if (immediate) {
                affected_elements = affected_elements.filter(element => element.parentElement === parent)
            }
            array.length = 0;
            array.push(...affected_elements)
        }

        // Not to forget, if the object is to be destroyed, then let's send destruct events to all members of the array
        destroySignal.addEventListener('abort', () => {
            array.forEach(item => item.dispatchEvent(new Event('destroy')))
        }, { once: true })


        return new Proxy(array, {
            get: (target, property, receiver) => {

                if (property == '$0') {
                    return {
                        events: array.events
                    }
                }

                // Now we want to check if the array has never been filled up
                //And if so, we fill it up using actual data from the DOM
                if (virgin) {
                    refreshInternalArray()
                }


                //Here, we continue with our processes as normal... Determining the value to be returned for the property

                const value = Reflect.get(target, property, receiver)

                if (typeof property !== 'symbol' && new Number(property).valueOf() >= 0 && !/pluralWidgetPropertyGetRaw/gi.test(new Error().stack)) {
                    const new_value = transforms.get(value)
                    return new_value
                }

                return value;
            },
            set: (target, property, value, receiver) => {

                if ((typeof property === 'symbol') || typeof new Number(property).valueOf() !== 'number') {
                    return Reflect.set(target, property, value, receiver);
                }

                const number_property = new Number(property).valueOf()

                if (number_property >= 0) {

                    value = /pluralWidgetPropertySetRaw/gi.test(new Error().stack) ? value : transforms.set(value);
                    if (value === PluralWidgetArray.ignore_element) {
                        last_ignored = true
                        return true; //Should be ignored
                    }
                    if (!(value instanceof HTMLElement)) {
                        throw new Error(`Invalid transforms.set() method. Instead of an HTMLElement, it returned\n`, value)
                    }
                }


                try {

                    if (last_ignored && property === 'length' && !target[value - 1]) {

                        // If the lastly set element was ignored, we cannot accepting incrementing the length
                        last_ignored = false;
                        return true;
                    }

                    Reflect.set(target, property, value, receiver);
                } catch (e) {

                    console.log(`error setting `, property, `as `, value, e)
                    throw e
                }


                if (PluralWidgetArray.propagateChange({ members: array, parent, selector, immediate })) {
                    array.events.dispatchEvent(new CustomEvent('change'));
                    safeOnchange()
                }



                return true;
            }
        })




    }

    /**
     * This method is used to add and remove elements of the parent's DOM according to a structure
     * @param {object} param0
     * @param {HTMLElement[]} param0.members How the parent's DOM should look like (structure)
     * @param {HTMLElement} param0.parent The parent whose DOM will be manipulated
     * @param {string} param0.selector
     * @param {boolean} param0.immediate Should we select just immediate children or all sub-children ?
     */
    static propagateChange({ members, parent, selector, immediate }) {

        members = members.filter(x => x !== this.ignore_element)

        let affected_elements = [...parent.querySelectorAll(selector)]

        if (immediate) {
            affected_elements = affected_elements.filter(x => [...parent.children].indexOf(x) !== -1)
        }

        let has_changed = false;
        const initial_length = parent.children.length;

        let doChange = () => {
            //Propagate the changes throughout the DOM
            let length = Math.max(members.length, affected_elements.length)
            for (let i = 0; i < length; i++) {
                let html = members[i];
                if (i < members.length && !(html instanceof HTMLElement)) {
                    console.log(html, `is invalid at ${i}`)
                    continue;
                }

                if (!affected_elements[i]) {
                    if (!(html instanceof Node)) {
                        console.warn(`Skipped `, html, ` because it is not an HTMLElement. It was supposed to be part of `, parent)
                    } else {
                        parent.appendChild(html)
                        has_changed = true;
                    }
                } else {
                    if (affected_elements[i] !== html && affected_elements.filter(x => x === affected_elements[i]).length != 0) { //That is, only select this element if it's out of place and the selector touches it

                        //So if the element is where it is not supposed to be and the selector affects the element, then there are two things we can do...
                        //Replace it with what's supposed to be, or remove it
                        if (html) {
                            affected_elements[i].replaceWith(html)
                            has_changed = true;
                        } else {
                            affected_elements[i].remove()
                            has_changed = true;
                        }
                    }
                }
            }
        }

        doChange()

        has_changed = has_changed || (initial_length !== parent.children.length);

        return has_changed

    }

    /** You can return this in your transforms.set() method so that the system knows this element is to be ignored */
    static ignore_element = Symbol(``)

}


/**
 * 
 * @param {object} param0 
 * @param {string|symbol} param0.property
 * @param {Object} param0.target
 * @param {{
 *      set: function(any): htmlhc.lib.widget.ExtendedHTML,
 *      get: function(htmlhc.lib.widget.ExtendedHTML): any
 * }} param0.transforms
 * @param {string} param0.selector
 * @param {string} param0.parentSelector
 * @param {Widget} param0.example
 * @param {('html'|'widget')} param0.childType
 * @param {boolean} param0.sticky
 * @param {htmlhc.lib.widget.ExtendedHTML} param0.htmlElement
 * @param {function} param0.onchange
 * @param {AbortSignal} param0.destroySignal
 */

export default function pluralWidgetProperty({ selector = '*', example, childType, htmlElement, parentSelector, target, object, property, sticky = true, immediate = true, transforms = {}, onchange, destroySignal } = {}) {

    if (example instanceof Widget) {
        if (example.html.classList.length === 0) {
            console.warn(`The example widget doesn't even have a unique class set on it's 'html' property. All children matching the '${selector}' selector will be returned by this property\n${new Error().stack.split('\n').slice(1).join('\n')}`)
        }
        selector = example.html.classList[0] || selector
    }

    //This (parentProperty: Symbol) keeps a single reference to a PluralWidgetArray, so as curb the disadvantages that come with manipulating the DOM. 
    //The reason for this because this property is often accessed in loops, where there's constant reference to the property
    //So, by always recomputing the value of the property as we did before will lead to a situation where we compute a new value before changes that were made
    //to the DOM during the last iteration have not yet been applied. (You know the DOM is slow)
    //A common bug resulting from this phenomenom is that getting [property].length will always be the initial number.
    //E.g it was always zero

    transforms ||= {}
    transforms.set ||= childType === 'widget' ? widget => widget.html : (html) => html
    transforms.get ||= childType === 'widget' ? html => html?.widgetObject : html => html



    const widget_array_symbol = Symbol()

    const theObject = target || object


    Reflect.defineProperty(theObject, property, {
        get: () => {
            let parent = typeof parentSelector !== 'undefined' ? htmlElement.$(parentSelector) : htmlElement;
            if (!parent) {
                throw new Error(`Cannot read property "${property}" of the widget. Check that the selector "${parentSelector}" is valid`)
            }
            parent[widget_array_symbol] ||= {}
            return parent[widget_array_symbol][property] ||= new PluralWidgetArray({ parent, transforms, selector, property, immediate, onchange, destroySignal })
        },
        set: (value) => {
            //When the property is set directly, then there's no such thing as appending
            //We make sure only the values passed will be in the HTML
            //Therefore, we remove all HTMLElement's prior


            if (!sticky) {
                theObject[property].length = 0;
                theObject[property].push(...[...value])

            } else {
                // We want to selectively add, and remove elements, based on what has changed
                // We'll take the transforms of either the existing, or new values, to make up the final array
                const existingPreValue = [...(theObject[property])]
                const finalPostValue = []

                function pluralWidgetPropertyGetRaw() {
                    return [...theObject[property]]
                }


                function pluralWidgetPropertySetRaw() {
                    theObject[property].length = 0
                    theObject[property].push(...finalPostValue)
                }

                const existingPostValue = pluralWidgetPropertyGetRaw()


                function eq(a, b) {

                    const res = (a == b)
                        || (
                            (typeof a) == (typeof b) &&
                            (typeof a !== 'symbol' && typeof b !== 'symbol')
                            && !(a instanceof HTMLElement || b instanceof HTMLElement)
                            && (
                                (JSON.stringify(a) == JSON.stringify(b))
                            )
                        );

                    return res;
                }

                for (const item of value) {
                    const existing = existingPreValue.findIndex(x => eq(x, item))
                    finalPostValue.push(
                        (existing !== -1) ? existingPostValue[existing] : transforms.set(item)
                    )

                }

                // Find all HTML(and by extension, widgets), that were not retained in this new set of values, and destroy them
                existingPostValue.filter(xe => finalPostValue.findIndex(xf => xf == xe) == -1).forEach(x => x.dispatchEvent(new CustomEvent('destroy')))

                pluralWidgetPropertySetRaw()
            }

            return true;
        },
        configurable: true,
        enumerable: true
    })

}