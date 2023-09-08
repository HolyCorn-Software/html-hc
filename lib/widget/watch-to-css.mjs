/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This utility watches element properties, in order to write the values of these 
 * attributes, once they change
 * For example, It can watch the height of an element, to update the --h2 style
 * property of another element.
 * Or, it can watch the widget of an element, to update the --final-width of 
 * the same element
 */

import DelayedAction from "../util/delayed-action/action.mjs"



/**
 * This method is used to watch a dimension (width, length, top, bottom), or a CSS property;
 * in order to apply those changing values to some other element
 * @param {object} param0 
 * @param {HTMLElement} param0.source
 * @param {string|(()=>HTMLElement|Promise<HTMLElement>)|undefined} param0.target if a string is passed, it 
 *  is considered as a selector, that is to be used to query the target. 
 *  If a function is passed, it is considered a function to be invoked, to produce the target.
 *  If no target is passed, the source element is used
 * @param {object} param0.watch The property to watch for
 * @param {keyof DOMRect} param0.watch.dimension A real dimension to watch on the element
 * @param {string} param0.watch.css A CSS property to watch
 * @param {string|((data: string|number|boolean)=>void)} param0.apply The CSS property that will be written to. 
 * However, you can pass a function, and the function will be called instead
 * @param {(input:string|number|boolean)=>string|number|boolean} param0.transform An optional function,
 *  which is called to modify the final value of the property that will be stored.
 *  The function is fed with the real value, and anything it produces will be the final value.
 *  If it returns a promise, the promise will be awaited
 * @returns {{destroy: ()=>void}} An object can be used to free up the resources allocated
 *  watching the changes
 */
export default function watchToCSS({ source, target, watch, apply, transform }) {

    /**
     * This resolves the final value of the target passed in
     * @returns {Promise<HTMLElement>}
     */
    const resolveTarget = async () => {
        if (typeof target === 'string') {
            return source.querySelectorAll(target)[0]
        }
        if (target instanceof HTMLElement) {
            return target
        }
        if (typeof target === 'function') {
            return await target()
        }
    }
    const defaultTransform = x => !!watch.dimension ? `${x}px` : x

    const onchange = new DelayedAction(async (input) => {
        try {
            const value = await (transform || defaultTransform)(input);
            const realTarget = await resolveTarget()
            if (typeof apply === 'function') {
                await apply(value)
            }
            if (typeof apply === 'string') {
                realTarget.style.setProperty(apply, value)
            }
        } catch (e) {
            console.warn(e)
        }
    }, 20)

    const exitFxns = []

    if (watch.dimension) {
        const observer = new ResizeObserver(() => {
            onchange(source.getBoundingClientRect()[watch.dimension])
        })
        observer.observe(source)
        exitFxns.push(observer.disconnect)
    }
    if (watch.css) {
        /**
         * This method is used to start using an observer, while making arrangements
         * arrangements for disposing an observer,
         * when the caller wants it so
         * @param {MutationObserver|ResizeObserver} observer
         * @param {MutationObserverInit|ResizeObserverOptions} options
         * @returns {void}
         */
        const observe = (observer, options) => {
            observer.observe(source, options)
            exitFxns.push(observer.disconnect)
        }
        const doIt = () => {
            onchange(window.getComputedStyle(source)[watch.css])
        }
        observe(new ResizeObserver(doIt), { box: 'border-box' })
        observe(new MutationObserver(doIt), { childList: true, subtree: true, attributes: true })
    }

    return {
        destroy: () => exitFxns.forEach(fxn => fxn())
    }
}