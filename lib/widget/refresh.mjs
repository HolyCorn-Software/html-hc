/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This utility manages a very important aspect of the UI (Telling widgets when to refresh)
 */



const classList = Symbol()
const observe = Symbol()
const instance = Symbol()

export default class RefresherManager {

    constructor() {

        if (RefresherManager[instance]) {
            return RefresherManager[instance]
        }
        RefresherManager[instance] = this

        this[classList] = new Set()

        new MutationObserver(
            (mutations) => {
                const htmlChanges = mutations.filter(mut => mut.type == 'childList')
                // Let's dispatch an event to HTML components of the widgets, telling them, that they've become connected to the DOM
                htmlChanges.filter(x => x.addedNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                        if ([...this[classList]].some(x => node.classList.contains(x))) {
                            node.dispatchEvent(new CustomEvent('hc-connected-to-dom'))
                        }
                    }
                }))
            }
        ).observe(document.body, {
            childList: true,
            subtree: true,
        })

    }

    /**
     * This method starts watching HTMLElements having the class specified in the className param.
     * When such elements are removed from the DOM, an event is dispatched to the elements.
     * When added to the DOM, other events are dispatched.
     * @param {string} className 
     */
    [observe](className) {
        this[classList].add(className)
    }

    /**
     * This method starts watching HTMLElements having the class specified in the className param.
     * When such elements are removed from the DOM, an event is dispatched to the elements.
     * When added to the DOM, other events are dispatched.
     * @param {string} className 
     */
    static observe(className) {
        new RefresherManager()[observe](className)
    }

}