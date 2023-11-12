/**
 * Copyright 2023 HolyCorn Software
 * Borrowed from the travel-timetable-navigation widget. Copyright 2022, The Matazm Project.
 * This widget allows us to present the user with a calendar-like UI
 */

import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import { hc, Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { NiceNumberInput } from "/$/system/static/html-hc/widgets/nice-number-input/input.mjs";



const selectedDate0 = Symbol()

export default class SimpleCalendar extends Widget {


    constructor() {

        super();

        this.html = hc.spawn(
            {
                classes: SimpleCalendar.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='main'>
                            <div class='nav'>
                                <div class='month-select'>
                                    <div class='left arrow'>&lt;</div>
                                    <div class='month-label'>March</div>
                                    <div class='right arrow'>&gt;</div>
                                </div>

                                <div class='year-select'></div>
                            </div>


                            <div class='stage'>
                                <table>
                                    <thead>
                                        <tr>
                                         <!-- The labels of the days of the week go here. That is, Sun, Mon, Tue, etc.. ---> 
                                        </tr>
                                    </thead>

                                    <tbody>
                                    </tbody>
                                    
                                </table>
                            </div>
                            
                        </div>
                    </div>
                `
            }
        );


        /** @type {function(('selectionchange'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        /** @type {import("./types.js").Statedata} */ this.statedata
        this.statedata = new AlarmObject()

        this.pluralWidgetProperty(
            {
                parentSelector: `.container >.main >.stage >table >thead >tr`,
                selector: `td`,
                property: '__dayLabels',
                transforms: {
                    set: (string) => {
                        return hc.spawn({ tag: 'td', innerHTML: string })
                    },
                    get: (html) => {
                        return html.innerHTML
                    }
                }
            }
        );


        let labelUpdateTimeout;
        this.statedata.$0.addEventListener(`dayLabels-change`, () => {
            clearTimeout(labelUpdateTimeout)
            labelUpdateTimeout = setTimeout(() => {
                this.__dayLabels = this.statedata.dayLabels
            }, 20)
        });


        //Whenever either the current month or year changes, draw the widget if, and only if, both month and year are set
        const mainProperties = ['month', 'year']
        let drawTimeout;
        const onMainPropChange = () => {
            clearTimeout(drawTimeout)
            drawTimeout = setTimeout(() => {

                //Deal with the label of the current month
                this.html.$('.container >.main >.nav >.month-select >.month-label').innerHTML = improviseName(months[this.statedata.current.month]) + (this.statedata.current.year == new Date().getFullYear() ? '' : ` ${this.statedata.current.year}`)

                //And with the year input
                this.yearSelect.value = this.statedata.current.year

                if (mainProperties.every(m => typeof this.statedata.current[m] !== 'undefined')) {
                    this.draw()
                }
            }, 20)
        }
        for (let prop of mainProperties) {
            this.statedata.$0.addEventListener(`current.${prop}-change`, onMainPropChange)
        }


        /** @type {NiceNumberInput} */ this.yearSelect
        this.widgetProperty(
            {
                selector: ['', ...NiceNumberInput.classList].join("."),
                parentSelector: `.container >.main >.nav >.year-select`,
                property: 'yearSelect',
                childType: 'widget'
            }
        );
        this.yearSelect = new NiceNumberInput()

        this.yearSelect.addEventListener('change', () => {
            this.statedata.current.year = this.yearSelect.value
        })



        /** @type {number[][]} This property controls the numbers displayed as dates of the month*/ this.dates
        this.pluralWidgetProperty(
            {
                parentSelector: `.container >.main >.stage >table >tbody`,
                selector: 'tr',
                property: 'dates',
                transforms: {
                    /**
                     * 
                     * @param {number[]} numbers 
                     */
                    set: (numbers) => {
                        return hc.spawn(
                            {
                                tag: 'tr',
                                children: numbers.map(number => {
                                    const classes = []
                                    if (number < 0) {
                                        classes.push("dim")
                                    }
                                    const date = new Date;
                                    if (number === date.getDate() && date.getMonth() == this.statedata.current.month && date.getFullYear() === this.statedata.current.year) {
                                        classes.push('today')
                                    }
                                    const td = hc.spawn(
                                        {
                                            tag: 'td',
                                            classes: classes,
                                            innerHTML: `${Math.abs(number)}`.padStart(2, '0')
                                        }
                                    )
                                    td.addEventListener('click', () => {
                                        this.tdSelected?.classList.remove('highlight')
                                        td.classList.add('highlight')
                                        this.dispatchEvent(new CustomEvent('selectionchange',))
                                    })
                                    return td
                                })
                            }
                        )
                    },
                    get: (html) => {
                        return [...html.children].map(child => new Number(child.innerHTML).valueOf())
                    }
                }
            }
        );


        //Logic of navigation by month
        const directions = { left: -1, right: 1 }
        for (let type in directions) {
            this.html.$(`.container >.main >.nav >.month-select >.arrow.${type}`).addEventListener('click', () => {
                const nextMonth = this.statedata.current.month + directions[type]
                let reset = false
                if (nextMonth < 0) {
                    this.statedata.current.month = 11
                    this.statedata.current.year = Math.max(this.statedata.current.year - 1, 1900)
                    reset = true
                }
                if (nextMonth > 11) {
                    this.statedata.current.month = 0
                    this.statedata.current.year++
                    reset = true
                }

                if (!reset) {
                    this.statedata.current.month = nextMonth
                }
            })
        }



        //Label the days of the week
        this.statedata.dayLabels = weekdays.map(x => improviseName(x))


        this.statedata.current = { //Initialize the view, to the current date
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
        }


    }
    get tdSelected() {
        return this.html.$('.container >.main >.stage >table >tbody >tr >td.highlight')
    }

    /**
     * @returns {Date}
     */
    get selectedDate() {
        //Simple logic!
        //The undimmed dates on the calendar, are dates of the current month
        //The dim dates on the calendar less than 7 are for the month after the current month
        //The dim dates on the calendar greater than 7 are for the previous month

        //First things first, is the data even there ?
        if (!this.statedata.current.year || !this.statedata.current.month || !this.tdSelected) { //If the current date is not set
            //Select something
            return this[selectedDate0] = new Date();
        }

        const value = new Number(this.tdSelected?.innerText).valueOf() || 1
        const isDimmed = this.tdSelected?.classList.contains('dim')
        return new Date(this.statedata.current.year, isDimmed ? this.statedata.current.month + (value < 7 ? 1 : -1) : this.statedata.current.month, value)
    }
    /**
     * @param {Date}
     */
    set selectedDate(date) {
        this[selectedDate0] = date
        this.dispatchEvent(new CustomEvent('selectionchange'))
    }
    set [selectedDate0](date) {
        this.statedata.current.year = date.getFullYear()
        this.statedata.current.month = date.getMonth()
        this.tdSelected?.classList.remove('highlight')
        const today = new Date()
        const todayTd = [...this.html.$$(`.container >.main >.stage >table >tbody >tr >td`)].find(x => x.innerText == today.getDate().toString().padStart(2, '0'))
        todayTd.classList.add('highlight')
    }

    draw() {

        //We're going to be manipulating this Date object
        const date = new Date(this.statedata.current.year, this.statedata.current.month, 1)

        //First things first... From the month, we compute the day of the first day of the month
        const dayOne = date.getDay()

        const dates = [[]]

        function getMaxDateForMonth(month, year) {
            if (month === 11) {
                return 31
            }

            return new Date(year, month + 1, 0).getDate()
        }

        const maxDateForMonth = getMaxDateForMonth(date.getMonth(), date.getFullYear())
        const monthEndDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay() //The day of the week, on which the month ended


        //So, fill in the dates of the previous month
        for (let i = 0; i < dayOne; i++) {
            dates[0][i] = -(new Date(date.getFullYear(), date.getMonth(), -(dayOne - i - 1)).getDate())
        }


        for (let i = 1, count = 0; i <= maxDateForMonth; i++, count++) {
            const tmp = new Date(date.getTime())
            tmp.setDate(i)
            const currWeek = Math.floor((dayOne + count) / 7);
            (dates[currWeek] ||= [])[tmp.getDay()] = tmp.getDate()
        }


        //Finally, the last days of the week last week (belonging to the next month)

        for (let i = monthEndDay + 1; i < 7; i++) {
            const newFill = -new Date(date.getFullYear(), date.getMonth() + 1, i - monthEndDay).getDate();
            dates[dates.length - 1][i % 7] = newFill
        }

        this.dates = dates

    }


    /** @readonly */
    static get classList() {
        return ['hc-matazm-travel-timetable-navigation']
    }

}



const weekdays = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat'
]


const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
]

/**
 * In the case where the engineer didn't specify the system strings, this method guesses a value out of the string name.
 * So, if there's no value for short_monday, it returns mon
 * @param {string} x 
 * @returns {string}
 */
function improviseName(x) {
    return `${x[0].toUpperCase()}${x.substring(1,)}`;
}
