/**
 * Copyright 2022 HolyCorn Software
 * This widget is a generic slider widget
 * It can contain anything, and make it's content slide left or right
 */

import AlarmObject from "../../lib/alarm/alarm.mjs";
import { Widget, hc } from "../../lib/widget/index.mjs";



const indexSymbol = Symbol('Slider.prototype.index')


export class SlideContainer extends Widget {


    constructor() {

        super();

        super.html = hc.spawn({
            classes: ['hc-slide-container'],
            innerHTML: `
                <div class='container'>
                    <div class='pre-content'></div>
                    <div class='primary-content'></div>
                    <div class='secondary-content'></div>
                </div>
            `
        });

        /** @type {htmlhc.lib.alarm.AlarmArray<HTMLElement>} This property controls the items that are on the slider.*/ this.screens

        /** @type {typeof this.screens} */
        let screens_array = new AlarmObject({ is_array: true })

        Reflect.defineProperty(this, 'screens', {
            get: () => screens_array,
            set: (val) => {
                screens_array.length = 0;
                screens_array.push(...val)
            },
            configurable: true,
            enumerable: true
        });


        /**
         * @type {{
         * movement: AlarmObject< {
         *      canGoBack: boolean,
         *      canGoForward: boolean
         * }>
         * 
         * }}
         */
        this.settings = new AlarmObject()
        this.settings.movement = {}



        this[indexSymbol] = 0;
        if (this.screens.length > 0) {
            this.index = 0;
        }

        this.settings.movement.canGoBack = this.settings.movement.canGoForward = true;

        screens_array.$0.addEventListener('change', () => {

            //Here, we check if the currently visible screen has been removed from the array.
            //If so, we too remove it from our DOM
            let current_screen = this.html.$('.container >.primary-content').children[0]

            if (!current_screen && this.screens.length > 0) {
                this.index = 0;
            } else {
                this[indexSymbol] = this.screens.findIndex(x => x === current_screen);
            }

        })



    }
    async waitForTransition() {
        try {
            await this[pending_transition_symbol]
        } catch { }
    }

    /**
     * @param {number} index
     */
    set index(index) {

        if ((index >= this.screens.length) || index < 0) {
            return console.warn(`Not possible to set index ${index} on a screen with ${this.screens.length} elements`)
        }
        (async () => {


            try {
                await this[pending_transition_symbol]
            } catch (e) {

            }

            this[pending_transition_symbol] = (async () => {


                const oldIndex = this.index


                //Do something to change the currently viewed html to the screen pointed by the index
                const secondaryContent = this.html.$(':scope >.container >.secondary-content')
                const primaryContent = this.html.$(':scope >.container >.primary-content');

                const oldScreen = primaryContent.children[0]
                const nwScreen = this.screens[index]


                // Dispatch an event to let a screen know that is about to be shown
                nwScreen.dispatchEvent(new CustomEvent('ready'));

                let animationDoneFunction;

                /**
                 * This promise is designed to resolve when the animationDoneFunction is called
                 * Listeners to this promise will know that it is time to dispatch certain key events
                 */
                const animationEndPromise = new Promise((resolve) => {
                    animationDoneFunction = () => {
                        setTimeout(resolve, 150); //We're leaving this time allowance becase manipulating the DOM is slow
                    }
                });

                /**
                 * This method is used to create a promise that will resolve when animationend event is fired from a given element
                 * @param {HTMLElement} target 
                 * @returns {Promise<void>}
                 */
                const wait_animation_end = (target) => {
                    return new Promise((resolve) => {
                        /**
                         * 
                         * @param {CustomEvent} event 
                         */
                        const onAnimationEnd = (event) => {
                            if (undefined !== event && event.target !== target) {
                                return;
                            }
                            cleanup();
                        }

                        // Plan A, the animation ends
                        target.addEventListener('animationend', onAnimationEnd)


                        //This is plan B, in case the animation is canceled halfway
                        const props = [`animation-duration`, 'animation-delay']
                        let totalAnimationTime = 0;
                        for (const prop of props) {
                            const value = window.getComputedStyle(target).getPropertyValue(prop);
                            totalAnimationTime += new Number(value.split('s')[0]).valueOf() * 1000
                        }
                        const onAnimationCancel = (event) => {
                            if (event?.target !== target) {
                                return;
                            }
                            cleanup();
                        };

                        target.addEventListener('animationcancel', onAnimationCancel)

                        //Plan C, if the animation doesn't even happen
                        setTimeout(cleanup, totalAnimationTime)


                        //In whichever case, there should be appropriate cleanup
                        function cleanup() {
                            resolve();
                            target.removeEventListener('animationend', onAnimationEnd);
                            target.removeEventListener('animationcancel', onAnimationCancel);
                        }

                    })
                }


                const nwScreenConnectedPromise = new Promise(x => {
                    const interval = setInterval(() => {
                        if (nwScreen.isConnected) {
                            setTimeout(x, 5);
                            clearInterval(interval);
                        }
                    }, 5);

                    setTimeout(() => clearInterval(interval), 3000)
                });

                /**
                 * This internal method reads the width, and height from the src element,
                 * and applies them as style rules to the target element 
                 * @param {HTMLElement} src 
                 * @param {HTMLElement} target 
                 */
                const applyDimensions = (src, target) => {

                    target.style.setProperty('--initial-width', `${target.getBoundingClientRect().width}px`)
                    target.style.setProperty('--final-width', `${Math.max(src.getBoundingClientRect().width, this.html.getBoundingClientRect().width)}px`)

                    target.style.setProperty('--initial-height', `${target.getBoundingClientRect().height}px`)
                    target.style.setProperty('--final-height', `${src.getBoundingClientRect().height}px`)

                }

                /**
                 * This function does certain repeated actions, which are needed
                 * both when sliding forward, or sliding backward
                 * @param {string} className The name of the class to append to the html, for
                 * triggering the animation
                 * @returns {Promise<void>}
                 */
                let slideCommon = (className) => {

                    // Creates smoothness by switching between two animations that do the exact same thing. This is because CSS cannot restart animations
                    this.html.classList.toggle('animation-parity');

                    // Set the class that triggers the animation
                    this.html.classList.add(className)

                    return wait_animation_end(primaryContent).finally(() => {

                        //Stop the conditions that show that the animation is sliding
                        this.html.classList.remove(className)

                        // Every type of slide needs that UI be updated at least, like this
                        primaryContent.children[0]?.remove();
                        nwScreen.remove();
                        primaryContent.appendChild(nwScreen);


                        // And let the world know
                        animationDoneFunction();
                    })
                }


                let slideForward = async () => {

                    secondaryContent.children[0]?.remove();
                    secondaryContent.appendChild(nwScreen);

                    await nwScreenConnectedPromise;

                    applyDimensions(secondaryContent, primaryContent)

                    await slideCommon('is-sliding-to-secondary').then(() => {
                        oldScreen?.remove()
                    }).catch(e => console.error(e))
                }

                let slideBackwards = async () => {
                    let preContent = this.html.$('.pre-content')
                    preContent.appendChild(nwScreen);

                    await nwScreenConnectedPromise

                    applyDimensions(nwScreen, primaryContent)

                    //Simply tells CSS we'll be using the backwards sliding animation
                    await slideCommon('is-sliding-to-pre')

                }

                if ((index < 0 || index >= this.screens.length)) {
                    return console.log(`The number is out of range. Wanting to navigate to ${index} when we have ${this.screens.length} items`)
                }



                const ahead = (index > oldIndex) || ((index == oldIndex) && (typeof primaryContent.children[0] !== 'undefined') && (primaryContent.children[0] != this.screens[index]));

                if (ahead) {
                    if (!this.settings.movement.canGoForward) {
                        return console.log(`Can't go forward!`);
                    }

                    this[indexSymbol] = index;
                    await slideForward()
                    await animationEndPromise;
                }
                if (index < oldIndex) {

                    if (!this.settings.movement.canGoBack) {
                        return;
                    }
                    this[indexSymbol] = index;
                    await slideBackwards()
                    await animationEndPromise;
                }

                if (!ahead && (index === oldIndex)) {
                    primaryContent.children[0]?.remove()
                    if (this.screens[index]) {
                        if (this.screens[index] instanceof HTMLElement) {
                            primaryContent.appendChild(this.screens[index])
                        }
                    }
                }

                //Once a screen is shown, we let the screen know that it is time to refresh
                animationEndPromise.then(() => {
                    nwScreen.dispatchEvent(new CustomEvent('begin'));
                    oldScreen?.dispatchEvent(new CustomEvent('end'));
                })



                this[indexSymbol] = index;

                this.dispatchEvent(new CustomEvent('indexChange'))
                /** @type {function (('indexChange'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


            })()

            try {
                await this[pending_transition_symbol]
            } catch (e) {
                console.warn(`Error sliding to index ${index} `, e)
            }

        })()
    }

    /**
     * This is used to control the current screen being shown. For example, set it to zero to show the first screen 
     * @returns {number}
     */
    get index() {
        return this[indexSymbol]
    }

    static get classList() {
        return ['hc-slide-container']
    }

}

const pending_transition_symbol = Symbol(`Synchronizes access to setting the index property`)