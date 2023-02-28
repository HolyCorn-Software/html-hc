/**
 * Copyright 2022 HolyCorn Software
 * This widget is a generic slider widget
 * It can contain anything, and make it's content slide left or right
 */

import AlarmObject from "../../lib/alarm/alarm.mjs";
import { Widget } from "../../lib/widget/index.mjs";



const indexSymbol = Symbol('Slider.prototype.index')


export class SlideContainer extends Widget {


    constructor() {

        super();

        super.html = document.spawn({
            classes: ['hc-slide-container'],
            innerHTML: `
                <div class='container'>
                    <div class='pre-content'></div>
                    <div class='primary-content'></div>
                    <div class='secondary-content'></div>
                </div>
            `
        });

        /** @type {import("../../lib/alarm/alarm-types.js").AlarmArray<HTMLElement>} This property controls the items that are on the slider.*/ this.screens

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
        this.index = 0;

        this.settings.movement.canGoBack = this.settings.movement.canGoForward = true;

        screens_array.$0.addEventListener('change', () => {
            //Here, we check if the currently visible screen has been removed from the array.
            //If so, we too remove it from our DOM
            let current_screen = this.html.$('.container >.primary-content').children[0]
            if (current_screen) {
                let relevant = false;
                for (let screen of this.screens) {
                    if (screen === current_screen) {
                        relevant = true;
                    }
                }
                if (!relevant) {
                    current_screen.remove();
                    this.index = 0;
                }
            }
        })



    }

    /**
     * @param {number} index
     */
    set index(index) {
        (async () => {


            try {
                await this[pending_transition_symbol]
            } catch (e) {

            }

            this[pending_transition_symbol] = (async () => {


                const oldIndex = this.index


                //Do something to change the currently viewed html to the screen pointed by the index
                const secondaryContent = this.html.$('.container >.secondary-content')
                const primaryContent = this.html.$('.container >.primary-content');

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
                        setTimeout(resolve, 300); //We're leaving this time allowance becase manipulating the DOM is slow
                    }
                });

                /**
                 * This method is used to create a promise that will resolve when animationend event is fired from a given element
                 * @param {HTMLElement} target 
                 * @returns {Promise<void>}
                 */
                const wait_animation_end = (target) => {
                    return new Promise((resolve, reject) => {
                        target.addEventListener('animationend', () => resolve(), { once: true })
                        setTimeout(() => reject('Timeout waiting for animationend'), 5000)
                    })
                }


                let slideForward = async () => {

                    secondaryContent.children[0]?.remove();
                    secondaryContent.appendChild(nwScreen);

                    await new Promise(x => {
                        const interval = setInterval(() => {
                            if (nwScreen.isConnected) {
                                setTimeout(x, 50)
                                clearInterval(interval)
                            }
                        })
                    });

                    primaryContent.style.setProperty('--initial-width', `${primaryContent.getBoundingClientRect().width}px`)
                    primaryContent.style.setProperty('--final-width', `${secondaryContent.children[0].getBoundingClientRect().width}px`)

                    primaryContent.style.setProperty('--initial-height', `${primaryContent.getBoundingClientRect().height}px`)
                    primaryContent.style.setProperty('--final-height', `${secondaryContent.children[0].getBoundingClientRect().height}px`)

                    // await new Promise(x=>setTimeout(x, 300_000));
                    this.html.classList.toggle('animation-parity');
                    this.html.classList.add('is-sliding-to-secondary')

                    wait_animation_end(this.html.$('.container >.primary-content')).then(() => {
                        setTimeout(() => {

                            oldScreen?.remove()
                            nwScreen.remove();
                            primaryContent.appendChild(nwScreen);
                            this.html.classList.remove('is-sliding-to-secondary')
                            animationDoneFunction();
                        }, 200)
                    }, { once: true })
                }

                let slideBackwards = async () => {
                    let preContent = this.html.$('.pre-content')
                    preContent.appendChild(nwScreen);


                    await new Promise(x => {
                        const interval = setInterval(() => {
                            if (nwScreen.isConnected) {
                                setTimeout(x, 50)
                                clearInterval(interval)
                            }
                        })
                    });

                    primaryContent.style.setProperty('--initial-width', `${primaryContent.getBoundingClientRect().width}px`)
                    primaryContent.style.setProperty('--final-width', `${nwScreen.getBoundingClientRect().width}px`)

                    primaryContent.style.setProperty('--initial-height', `${primaryContent.getBoundingClientRect().height}px`)
                    primaryContent.style.setProperty('--final-height', `${nwScreen.getBoundingClientRect().height}px`)

                    // Creates smoothness by switching between two animations that do the exact same thing. This is because CSS cannot restart animations
                    this.html.classList.toggle('animation-parity')
                    //Simply tells CSS we'll be using the backwards sliding animation
                    this.html.classList.add('is-sliding-to-pre')

                    //And when we are done...
                    wait_animation_end(this.html.$('.container >.primary-content')).then(() => {
                        setTimeout(() => {
                            //Stop the conditions that show that the animation is sliding
                            this.html.classList.remove('is-sliding-to-pre')
                            //And then update the view
                            primaryContent.children[0].remove();
                            nwScreen.remove();
                            primaryContent.appendChild(nwScreen);
                            animationDoneFunction();
                        }, 200)
                    }, { once: true })

                }

                if ((index < 0 || index >= this.screens.length)) {
                    return console.log(`The number is out of range. Wanting to navigate to ${index} when we have ${this.screens.length} items`)
                }

                if (index > oldIndex) {
                    if (!this.settings.movement.canGoForward) {
                        return console.log(`Can't go forward!`);
                    }
                    await slideForward()
                    await animationEndPromise;
                }
                if (index < oldIndex) {

                    if (!this.settings.movement.canGoBack) {
                        return;
                    }
                    await slideBackwards()
                    await animationEndPromise;
                }

                if (index === oldIndex) {
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
                /** @type {function (('indexChange'), function(CustomEvent) AddEventListenerOptions)} */ this.addEventListener


            })()

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