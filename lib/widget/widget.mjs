/*
Copyright 2021 HolyCorn Software
This module defines the general form of a widget in the html-hc library
It contains general helper functions that classes can use to control HTML views
*/


import * as hc from './lib.mjs';
import '../fonts/fonts.mjs'
import pluralWidgetProperty from './pluralWidgetProperty.mjs'
/** @type {typeof import('../../widgets/infinite-spinner/widget.mjs').Spinner**/
let Spinner;
import('../../widgets/infinite-spinner/widget.mjs').then(x => Spinner = x.default);

hc.importModuleCSS(import.meta.url); //import widget.css


/**
 * @template WidgetType
 */
export class __Widget extends EventTarget {

    // A widget will not fire events when the halt_events is set to true
    /**
     * 
     * @param {{css:[string]}} param0 An array of css files files to be included
     * However is css is set to import.meta.url, the css corresponding to the widget will be imported 
     * 
     * The proxy_events attribute can be set on the widget to ensure that events that are fired on the widget will get fired on the html
     */
    constructor({ css } = {}) {
        super();

        if (typeof css == 'string') {
            hc.importModuleCSS(css).catch(e => 1) //If importing the CSS fails, then there's no CSS file with the same name
        }
        if (css instanceof Array) {
            for (var css of css) {
                hc.importModuleCSS(css);
            }
        }
        /**@type {boolean} */
        this.proxy_events = false;


        //Figure out the url of the widget that called this constructor, then import the equivalent CSS
        //console.log(new Error().stack.split('\n'));

        //To understand what's happening here, first of all print a stack trace in console
        //We want to find the line before the the line that refers to this widget
        let stack = new Error().stack.split('\n');
        let thisLineNumber;
        for (let i = 0; i < stack.length; i++) {
            if (stack[i].indexOf(import.meta.url) !== -1) {
                thisLineNumber = i
                break;
            }
        }

        //Once we do, we extract the url in the line. That will be widget that called us. So we import the equivalent CSS
        let moduleURL = /(http.+):\d+:\d+/.exec(stack[thisLineNumber + 1])?.[1]
        if (moduleURL) {
            //console.log('Auto importing CSS for ', moduleURL)
            hc.importModuleCSS(moduleURL).then(() => 1, () => 1); //No qualms if auto-import fails
        } else {
            console.log(`Could not auto-import `, new Error().stack)
        }

        /** @type {function(string, function(Event))} */
        this.on

    }
    waitTillDOMAttached() {
        return new Promise((resolve, reject) => {
            if (this.html?.isConnected) {
                return resolve();
            }

            let interval = setInterval(() => {
                if (this.html?.isConnected) {
                    resolve()
                    clearInterval(interval)
                }
            }, 100)
        })
    }

    #html

    /**
     * @param {import('./types.js').ExtendedHTML<this>} value
     */
    set html(value) {

        if (!(value instanceof HTMLElement)) {
            throw new Error(`An object that is not of type HTMLElement is being used as the value of 'html' property for the ${new.target.name} widget`)
        }
        value.classList.add('hc-widget')
        Reflect.defineProperty(value, 'object', {
            configurable: true,
            value: this,
        })
        Reflect.defineProperty(value, 'widgetObject', {
            configurable: true,
            value: this,
        })
        this.#html = value;

    }

    /**
     * @returns {import('./types.js').ExtendedHTML<this>}
     */
    get html() {
        return this.#html
    }

    //TODO, update htmlProperty() method to always query the element each time the property is being operated upon, instead of statically
    //binding to a selected element
    /**
     * 
     * @param {string} el The selector of the element that'll be affected by the property
     * @param {keyof this} objectProperty The name of the property on the object
     * @param {'innerHTML'|'class'|'attribute'|'inputValue'} type How does the property change the element. Is it by toggling a class, or changing it's innerHTML or something else ?
     * @param {function|undefined} onchange The function to be called when the property takes a new value
     * @param {string} attributeName_or_className The name of the class or attribute on the HTML Element that will be changed
     */
    htmlProperty(selector, objectProperty, type = 'attribute', onchange = () => 1, attributeName_or_className) {

        //Widgets need that for example, when you set the title (object) attribute, let it be effected as an HTML attribute or class
        //type can only be 'class' , 'attribute' , or 'innerHTML'

        //For example
        //      htmlProperty('.rows', 'name', 'innerHTML')
        //          This will make sure that reading and writing the 'name' property of any element selected by '.rows' will lead to a change in their innerHTML
        //The className param is specified only when type = 'class'. In so specifying, it specifies which class to toggle

        let elements = selector ? this.html.$$(selector) : [this.html]


        for (var element of elements) {
            ; ((element) => {

                __Widget.__htmlProperty(this, element, objectProperty, type, (v) => {
                    onchange(v, element);
                }, attributeName_or_className || objectProperty);
            })(element); //There are issues in loops where variables all point to the same object, that's why we wrap around a function
        }
    }

    /**
     * This creates a property whose value is a widget that matches a specific selector
     * That is when reading the value, you get a reference to that widget, which comes from querring the DOM of this widget
     * For Example:
     * If the property is 'nav' and the widget is some kind of Navbar widget with class .hc-hcts-navbar
     * writing the 'nav' property will append the value being written (which is a Widget of course) to the parent specified by parent selector
     * Getting the 'nav' property will return the Navbar widget residing in the parent (specified by parent selector) whose selector is 'selector'
     * @param {import('./types.js').WidgetPropertyArgs<WidgetType, InputType, WidgetType>} param0 
     * 
     */
    widgetProperty({ selector, parentSelector, property, should_prepend, childType, immediate = true, onchange = () => 1, transforms = {}, object = this }) {

        const defaultTransform = x => (x instanceof __Widget) || x.html ? x.html : x
        transforms.set ||= childType === 'widget' ? widget => widget.html : defaultTransform
        transforms.get ||= childType === 'html' ? defaultTransform : html => html?.widgetObject

        Reflect.defineProperty(object, property, {
            get: () => transforms.get(this.html.$(`${parentSelector} ${immediate ? '>' : ''} ${selector}`)),
            /**@param {__Widget} widget */
            set: input => {
                let html = transforms.set(input);
                let parent = this.html.$(parentSelector)
                if (typeof parent === 'undefined') {
                    throw new Error(`Cannot set property '${property}' because the parent element doesn't exist. The parentSelector is '${parentSelector}'`)
                }
                let existing = parent.$(selector);
                if (existing) {
                    //Remove the previous value if it already exists
                    existing.remove();
                }
                parent[should_prepend ? 'prepend' : 'appendChild'](html)
                onchange(input, html);
            },
            configurable: true,
            enumerable: true
        })

    }


    /**
     * 
     * !!! Caution, manipulating the DOM is slow (~500ms) for some operations. Do well to put some delay in your code, where neccessary.
     * Call this method when there's a property to be bound to widget such that accessing that property obtains an array of children elements to a specific parent element.
     * 
     * 
     * `property` The property that will be accessed in order to get the widgets or HTMLElements
     * 
     * `selector` The selector of the children that will retrieved. Optionally, you can pass a child example to avoid passing this param
     * 
     * `example` Use this in place of a selector in order to determine the type of children that will be retrieved by the property.
     * 
     * `parentSelector` The parent containing the children
     * 
     * `childType` The type of children you want to access. By passing an `example` you don't have to specify this property. However, even if it is not passed, it will default to HTMLElement`
     * 
     * Passing neither `selector` nor `example` will default to selecting all children of the parent
     * 
     * `transforms` This is useful when you want users of the property to pass arbitary data like 'name', 'id', whereas the DOM receives an actual HTMLElement or Widget. And at the same time, the users of the property can get meaningful data, instead of widgets. Note that using this parameter eliminates the need for the childType parameter  You're encouraged to use this.
     * 
     * @template InputType
     * @template {__Widget} WidgetType
     * 
     * @param {import('./types.js').WidgetPropertyArgs<WidgetType, InputType, WidgetType>} param0 
     * 
     * 
     * 
     */
    pluralWidgetProperty({ selector = '*', childType, parentSelector, property, transforms, immediate = true } = {}) {

        return pluralWidgetProperty({
            selector,
            childType,
            htmlElement: this.html,
            parentSelector,
            object: this,
            property,
            transforms,
            immediate
        })

    }

    /** @type {import('../infinite-spinner/spinner.js').Spinner}*/
    #loader_spinner;
    async loadBlock(html) {
        (this.#loader_spinner ||= new Spinner()).stop()
        this.#loader_spinner.start()
        this.#loader_spinner.attach(html || this.html)

    }

    async loadUnblock() {
        this.#loader_spinner?.detach()
        this.#loader_spinner?.stop();
    }



    /**
     * This method is used to keep the widget loading, while a promise is still pending
     * @param {Promise} promise 
     * @returns {Promise<any>}
     */
    async loadWhilePromise(promise) {
        this.loadBlock()
        try {
            const data = await promise
            this.loadUnblock();
            return data;
        } catch (e) {
            this.loadUnblock()
            throw e
        }
    }






    /**
     * 
     * @deprecated Just use addEventListener()
     */
    fire() {
        if (this.halt_events == true) return;
        super.fire.apply(this, arguments);
        if (this.html && this.proxy_events) {
            this.html.fire.apply(this.html, arguments)
        }
    }

    /**
     * 
     * @param {object} object The object that will receive the property
     * @param {HTMLElement|HTMLInputElement} el The element that'll be affected by the property
     * @param {string} objectProperty The name of the property on the object
     * @param {'innerHTML'|'class'|'attribute'|'inputValue'} type How does the property change the element. Is it by toggling a class, or changing it's innerHTML or something else ?
     * @param {function|undefined} onchange The function to be called when the property takes a new value
     * @param {string} className_or_attributeName The name of the property on the HTML Element
     */
    static __htmlProperty(object, el, objectProperty, type, onchange = () => 1, className_or_attributeName) {
        //Ties an object property to an html property

        className_or_attributeName = className_or_attributeName || objectProperty;

        Object.defineProperty(object, objectProperty, {
            get: () => {
                switch (type) {
                    case 'attribute':
                        return el.getAttribute(className_or_attributeName)

                    case 'class':
                        return el.classList.contains(className_or_attributeName) //for class properties, just check if they exist

                    case 'innerHTML':
                        return el.innerHTML

                    case 'inputValue':
                        let numbVal = new Number(el.value).valueOf()
                        return numbVal.toString() !== 'NaN' ? numbVal : el.valueAsDate || el.value
                }
            },
            set: v => {
                onchange(v); //Inform the function that the value of the attribute has changed
                switch (type) {

                    case 'attribute':
                        el.setAttribute(className_or_attributeName, v);
                        break;

                    case 'class':
                        el.classList[(v === 'true') || (v == true) ? 'add' : 'remove'](className_or_attributeName)
                        break;

                    case 'innerHTML':
                        el.innerHTML = v
                        break;
                    case 'inputValue':
                        el.value = v;
                        el.dispatchEvent(new CustomEvent('change'))

                    default:
                        return; //To prevent onchange to be called on inconsequential setters

                }
            },
            configurable: true,
            enumerable: true
        })
    }

}