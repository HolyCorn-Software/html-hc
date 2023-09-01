/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This widget allows the user to choose a date in a very convinient way
 */

import DelayedAction from "../../lib/util/delayed-action/action.mjs";
import { Widget, hc } from "../../lib/widget/index.mjs";
import DateSelect from "./date-select/widget.mjs";
import YearMonthSelect from "./year-month-select/widget.mjs";


const yearMonth = Symbol()
const dateSelect = Symbol()


/**
 * @extends Widget<SlimCalendarInput>
 */
export default class SlimCalendarInput extends Widget {

    constructor() {
        super();


        super.html = hc.spawn(
            {
                classes: SlimCalendarInput.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='year-month-select'></div>
                        <div class='date-select'></div>
                    </div>
                `
            }
        );

        /** @type {YearMonthSelect} */ this[yearMonth]
        this.widgetProperty(
            {
                selector: ['', ...YearMonthSelect.classList].join('.'),
                parentSelector: '.container >.year-month-select',
                childType: 'widget',
                property: yearMonth,
            }
        );

        this[yearMonth] = new YearMonthSelect();


        this.widgetProperty(
            {
                selector: ['', ...DateSelect.classList].join('.'),
                parentSelector: '.container >.date-select',
                property: dateSelect,
                childType: 'widget',
            }
        );


        const todate = new Date(new Date().setHours(0, 0, 0, 0))

        /** @type {DateSelect} */
        this[dateSelect] = new DateSelect()

        this[dateSelect].month = todate.getTime()


        /** @type {(event: "change", cb: (event: CustomEvent) => void, opts: AddEventListenerOptions) => void} */ this.addEventListener;

        this[yearMonth].addEventListener('change', new DelayedAction(() => {
            this.dispatchEvent(new CustomEvent('change'))
            this[dateSelect].month = this[yearMonth].value
        }, 250));

        this[dateSelect].addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change'))
        });

        this.waitTillDOMAttached().then(() => {
            this[dateSelect].value = todate
            this[yearMonth].value = todate
        })



    }

    /**
     * @returns {number}
     */
    get value() {
        return this[dateSelect].value
    }
    /**
     * @param {number} value
     */
    set value(value) {
        this[dateSelect].value = value
        this[yearMonth].value = value
    }

    /**
     * @readonly
     */
    static get classList() {
        return ['hc-slim-calendar-input']
    }

}