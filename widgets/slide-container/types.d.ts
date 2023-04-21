/**
 * Copyright 2022 HolyCorn Software
 * The html-hc library
 * The slide-container widget
 * This module (types), contains type definitions for the slide-container widget
 */



export interface SettingsStructure {
    canGoBack: boolean
    canGoForward: boolean
}


export type Settings = htmlhc.lib.alarm.AlarmObject<SettingsStructure>