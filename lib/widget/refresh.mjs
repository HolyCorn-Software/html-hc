/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This utility manages a very important aspect of the UI (Telling widgets when to refresh)
 */



const classList = Symbol()
const _observe = Symbol()
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
                        setTimeout(() => {
                            const targets = [...(node.querySelectorAll(`${[...this[classList]].map(x => `.${x}`).join(', ')}`))].filter(x => x.isConnected && ([...this[classList]].some(cl => x.classList.contains(cl))))
                            targets.forEach(node => {
                                node.dispatchEvent(new CustomEvent('hc-connected-to-dom'))
                            })
                        }, 10)
                    }
                }));

                // Let's also tell the ones that have been removed
                htmlChanges.filter(x => x.removedNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                        setTimeout(() => {
                            const targets = [...(node.querySelectorAll(`${[...this[classList]].map(x => `.${x}`).join(', ')}`))].filter(x => !x.isConnected && ([...this[classList]].some(cl => x.classList.contains(cl))))
                            targets.forEach(node => {
                                node.dispatchEvent(new CustomEvent('hc-disconnected-from-dom'))
                            })
                        }, 10)
                    }
                }));
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
    [_observe](className) {
        this[classList].add(className)
    }

    /**
     * This method starts watching HTMLElements having the class specified in the className param.
     * When such elements are removed from the DOM, an event is dispatched to the elements.
     * When added to the DOM, other events are dispatched.
     * @param {string} className 
     */
    static observe(className) {
        new RefresherManager()[_observe](className)
    }

}