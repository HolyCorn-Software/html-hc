/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This wiget (back-forth) is a simple widget, which allows for a smooth way of
 * navigating a handful of screens, allowing the possibility of going back to the previous
 * screen
 */

import AlarmObject from "../../lib/alarm/alarm.mjs";
import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import { hc, Widget } from "../../lib/widget/index.mjs";
import { SlideContainer } from "../slide-container/container.mjs";

const actions = Symbol()
const canQuit = Symbol()


/**
 * @extends Widget<BackForth>
 * With this widget, we dispatch the event (backforth-goto) on direct child html 
 * with detail set to the HTML that is to be navigated to.
 * 
 * Also, elements can dispatch 'backforth-goback' to return to the previous screen
 */
export default class BackForth extends Widget {

    /**
     * 
     * @param {htmlhc.widget.backforth.ViewData} initialView The first view that will be loaded to the widget immediately
     */
    constructor(initialView) {
        super();

        super.html = hc.spawn(
            {
                classes: BackForth.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='nav'>
                            <div class='main'></div>
                            <div class='title'>Patients</div>
                            <div class='nav-actions'></div>
                        </div>
                        <div class='slider'><!-- The slider containing the current view goes here --></div>
                    </div>
                `
            }
        );

        const imageSymbol = Symbol()
        this.defineImageProperty({ selector: '.container >.nav >.main', property: imageSymbol })
        this[imageSymbol] = new URL('./arrow.svg', import.meta.url).href;

        /** @type {HTMLElement[]} */ this[actions];
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.nav >.nav-actions',
                childType: 'html',
                property: actions,
            }
        )


        /** @type {htmlhc.widget.backforth.StateData} */ this.statedata = new AlarmObject()
        this.statedata.history = []

        /** @type {SlideContainer} */ this.slider
        this.widgetProperty(
            {
                selector: ['', ...SlideContainer.classList].join("."),
                parentSelector: '.container >.slider',
                property: 'slider',
                childType: 'widget',
            }
        );

        this.html.classList.add('animations-frozen')

        this.slider = new SlideContainer()

        this.slider.screens = []

        /** @type {(event: "quit", cb: (event: CustomEvent)=> void )=> void} */ this.addEventListener



        const goBack = new DelayedAction((offset = 1) => {
            if (!(this.statedata.history.length > offset)) {
                if (this.canQuit) {
                    this.dispatchEvent(new CustomEvent('quit'))
                } else {
                    this.canGoBack = false // Cannot go back
                }
                return
            }
            this.statedata.history = this.statedata.history.slice(0, this.statedata.history.length - offset) //Remove the current view from the history
            this.loadView(this.statedata.history[this.statedata.history.length - 1], true) //Remove the view before that, and that's what we're going to be navigating to
        }, 100)


        this.html.$(".container >.nav >.main").addEventListener('click', () => {
            goBack()
        });

        this.html.addEventListener('backforth-goto', (event) => {
            if (!event?.detail?.view) {
                return console.warn(`An incorrect 'backforth-goto' event was fired, with details `, event?.detail)
            }
            this.loadView(event.detail, false)
            event.stopPropagation()
        });

        this.html.addEventListener('backforth-goback', ({ detail: { offset } }) => {
            goBack(offset || 1)
        })

        if (initialView) {
            this.waitTillDOMAttached().then(() => this.loadView(initialView, false))
        }


    }
    /**
     * If set to true, the back button won't be removed.
     * Instead, when it is clicked, it would fire the 'quit' event, which
     * anyone can listen to, to take appropriate actions
     * @param {boolean} value
     */
    set canQuit(value) {
        if (value) {
            this.canGoBack = true
        }
        this[canQuit] = value
    }
    /**
     * @returns {boolean}
     */
    get canQuit() {
        return this[canQuit]
    }
    set canGoBack(value) {
        this.html.classList.remove('animations-frozen')
        this.html.classList.toggle("can-go-back", value)
    }
    get canGoBack() {
        return this.html.classList.contains('can-go-back')
    }


    /**
     * This method loads a view.
     * It's not advisable to load a view like this directly, except it's the first time
     * @param {htmlhc.widget.backforth.ViewData} viewData The view to be loaded
     * @param {boolean} isBack Just avoid this property. Set it to false
     */
    loadView(viewData, isBack) {

        const currentScreen = this.slider.screens[this.slider.index]
        let screens = []


        if (!isBack) {
            screens.push(currentScreen, viewData.view)
            this.statedata.history.push(viewData)
        } else {
            screens.push(viewData.view, currentScreen)
        }
        screens = screens.filter(x => x instanceof HTMLElement)

        this.slider.screens = screens

        const index = screens.findIndex(x => x == viewData.view);
        setTimeout(() => this.slider.index = index, 100)

        //Now, if there's nothing to go back to, make the back button disappear
        this.canGoBack = this.canQuit || this.statedata.history.length > 1
        //Set the title, and actions, when the animation is over, if we are going back, or immediately if going forward
        setTimeout(() => {
            this.html.$('.container >.nav >.title').innerHTML = viewData.title || ''
            this[actions] = viewData.actions || []
        }, isBack ? 1200 : 0)


    }


    static {
        this.classList = ['hc-back-forth']
    }

}