/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The slim-calendar-input widget
 * This sub-widget (year-month-select), is the part of the slim-calendar-input widget, where the user selects the month, and year
 */

import DelayedAction from "../../../lib/util/delayed-action/action.mjs";
import { Widget, hc } from "../../../lib/widget/index.mjs";
import AccordionItem from "../../arcordion/item.mjs";
import Accordion from "../../arcordion/widget.mjs";
import { NiceNumberInput } from "../../nice-number-input/input.mjs";


const main = Symbol()
export default class YearMonthSelect extends Accordion {


    constructor() {
        super();



        this[main] = new MainWidget();
        this.itemWidgets.push(
            this[main]
        );

        super.html.classList.add('hc-slim-calendar-input-year-month-select');

        /** @type {(event: "change", cb: (event: CustomEvent) => void, opts: AddEventListenerOptions) => void} */ this.addEventListener;

        this[main].content.widgetObject.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change'))
        })

    }
    /**
     * @returns {number}
     */
    get value() {
        return this[main].content.widgetObject.value
    }

    /**
     * @param {number} value
     */
    set value(value) {
        return this[main].content.widgetObject.value = value
    }



}


/**
 * @extends AccordionItem<Content>
 */
class MainWidget extends AccordionItem {

    constructor() {
        super(
            {
                label: `June 2024`,
                content: new Content()
            }
        );

        super.html.classList.add('hc-slim-calendar-input-year-month-select-main');

        this.content.widgetObject.addEventListener('ui-change', () => {
            this.refreshUI()
        });

        let closeTimeout;

        this.content.addEventListener('mouseleave', () => {
            clearTimeout(closeTimeout)
            closeTimeout = setTimeout(() => {
                this.expanded = false
            }, 5000)
        });

        this.content.addEventListener('mouseover', () => {
            clearTimeout(closeTimeout)
        })

    }

    refreshUI() {
        const dateValue = new Date(this.content.widgetObject.value);
        this.label = `${dateValue.toString().split(' ')[1]} ${dateValue.getFullYear()}`
    }


}



const yearInput = Symbol()
const monthValue = Symbol()
const monthIndex = Symbol()

/**
 * @extends Widget<Content>
 */
class Content extends Widget {

    constructor() {
        super()

        super.html = hc.spawn(
            {
                classes: Content.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='months'></div>
                        <div class='year'></div>
                    </div>
                `
            }
        );

        const months = Symbol()
        this.pluralWidgetProperty(
            {
                selector: '.month',
                property: months,
                parentSelector: '.container >.months',
                transforms: {
                    set: (number) => {
                        const label = new Date(new Date().setMonth(number)).toString().split(' ')[1]
                        const html = hc.spawn({
                            classes: ['month'],
                            innerHTML: `<div class='label'>${label}</div>`
                        });
                        html[monthIndex] = number;

                        html.addEventListener('click', () => {
                            this[monthValue] = number
                            this.dispatchEvent(new CustomEvent('change'))
                        })
                        return html
                    },
                    get: (html) => html[monthIndex]
                }
            }
        );

        this[months] = [...' '.repeat(12)].map((_, i) => i);

        this.widgetProperty(
            {
                selector: ['', ...NiceNumberInput.classList].join('.'),
                parentSelector: '.container >.year',
                property: yearInput,
                childType: 'widget',
            }
        );

        /** @type {NiceNumberInput} */
        this[yearInput] = new NiceNumberInput();


        /** @type {(event: "change"|"ui-change", cb: (event: CustomEvent) => void, opts: AddEventListenerOptions) => void} */ this.addEventListener;

        this[yearInput].addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change'))
        })


        this[yearInput].value = new Date(new Date).getFullYear()
    }
    /**
     * The timestamp of the currently selected year, and month
     */
    get value() {
        return new Date(
            new Date().setFullYear(this[yearInput].value, this[monthValue])
        ).setHours(0, 0, 0, 0)
    }
    set value(timestamp) {
        const date = new Date(timestamp)
        this[yearInput].value = date.getFullYear()
        this[monthValue] = date.getMonth()
        this.dispatchEvent(new CustomEvent('ui-change'))
    }

    /**
     * @returns {number}
     */
    get [monthValue]() {
        return (this.html.$('.container >.months >*.selected') || this.html.$('.container >.months >*'))[monthIndex]
    }
    /**
     * @param {number} index
     */
    set [monthValue](index) {
        [...this.html.$$('.container >.months >*')].forEach((x, i) => x.classList.toggle('selected', i == index))
    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-slim-calendar-input-year-month-select-content']
    }
}

hc.importModuleCSS(import.meta.url)