/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the back-forth widget
 */


declare namespace htmlhc.widget.backforth {

    interface ViewData {
        /** This is the direct HTMLElement that will be displayed to the user */
        view: HTMLElement
        /** This is the title that would be displayed when the view is showing */
        title: string
        /** An optional array of elements that will display next to the title of the page */
        actions: HTMLElement[]
    }

    declare type StateData = htmlhc.lib.alarm.AlarmObject<
        {
            /** An array of the past views that the user has interacted with */
            history: ViewData[]
        }
    >
}

