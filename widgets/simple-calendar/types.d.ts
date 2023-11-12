/**
 * Copyright 2022 HolyCorn Software
 * The Matazm Project
 * This module (types) is part of the navigation widget of the travel-timetable widget.
 * This module contains type definitions of the navigation widget
 */


export interface WidgetData {
    dayLabels: [string, string, string, string, string, string, string]
    current: {
        month: number
        year: number
    }
}



export type Statedata = htmlhc.lib.alarm.AlarmObject<WidgetData>