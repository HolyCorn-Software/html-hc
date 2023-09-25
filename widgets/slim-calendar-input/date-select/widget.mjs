/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This widget (date-select), is the part of the slim-calendar-input widget, that allows the user to select the exact date
 */

import { Widget, hc } from "../../../lib/widget/index.mjs";


const month = Symbol()

const dates = Symbol()

const data = Symbol()


export default class DateSelect extends Widget {

    constructor() {
        super();

        super.html = hc.spawn(
            {
                classes: DateSelect.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='dates'></div>
                    </div>
                `
            }
        );


        /** @type {number[]} */ this[dates];
        this.pluralWidgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.dates',
                property: dates,
                transforms: {
                    set: (timestamp) => {
                        const date = new Date(timestamp)
                        const html = hc.spawn(
                            {
                                classes: ['date'],
                                innerHTML: `
                                    <div class='container'>
                                        <div class='day'>${date.toString().split(' ')[0]}</div>
                                        <div class='date'>${date.getDate()}</div>
                                    </div>
                                `
                            }
                        );

                        const todate = new Date().setHours(0, 0, 0, 0)

                        if (new Date(timestamp).setHours(0, 0, 0, 0) === todate) {
                            html.classList.add('today')
                        }

                        html.addEventListener('click', () => {
                            this.value = timestamp
                            this.dispatchEvent(new CustomEvent('change'))
                        })

                        html[data] = timestamp
                        return html
                    },
                    get: html => html[data]
                }
            }
        );


        /** @type {(event: "change", cb: (event: CustomEvent) => void, opts: AddEventListenerOptions) => void} */ this.addEventListener;



    }

    /**
     * @returns {number}
     */
    get value() {
        return this.html.$('.container >.dates >*.selected')?.[data] || (new Date(new Date().setHours(0, 0, 0, 0)).setDate(1))
    }
    /**
     * @param {number} value
     */
    set value(value) {
        const realTimeStamp = new Date(value).setHours(0, 0, 0, 0)
        this.html.$$('.container >.dates >*').forEach((html, index) => {
            html.classList.toggle('selected', html[data] == realTimeStamp)
            if (html[data] == realTimeStamp) {
                const rect = html.getBoundingClientRect()
                const parentRect = html.parentElement.getBoundingClientRect()
                if (rect.left > parentRect.left + parentRect.width) {
                    setTimeout(() => html.parentElement.scrollLeft = (rect.width) * index, 1000)
                }
            }
        })
    }

    /**
     * Set this value to the first day of the month in question
     */
    set month(timestamp) {

        const dMonth = new Date(timestamp);
        const monthIndex = dMonth.getMonth()

        if (this[month]) {
            const monthDate = new Date(this[month]);

            if ((dMonth.getMonth() == monthDate.getMonth()) && (dMonth.getFullYear() == monthDate.getFullYear())) {
                return;
            }

            const old = new Date(this.value)

            setTimeout(() => {
                const current = new Date(timestamp)
                this.value = current.setMonth(current.getMonth(), old.getDate())
            }, 250)
        }

        this[month] = timestamp;
        let curDate;
        this[dates] = []

        for (let i = 1; (curDate = new Date(new Date(timestamp).setDate(i))).getMonth() == monthIndex; i++) {
            this[dates].push(curDate.getTime());
        }

    }
    get month() {
        return (this[month] ||= new Date(new Date().setHours(0, 0, 0, 0)).setDate(1))
    }


    /** @readonly */
    static get classList() {
        return ['hc-slim-calendar-input-date-select']
    }

}