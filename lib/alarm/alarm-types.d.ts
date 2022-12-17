/**
 * Copyright 2022 HolyCorn Software
 * This module (alarm-types.d.ts) contains type definitions for the alarm module
 * 
 */

import { Collection, MatchKeysAndValues } from "mongodb"


export interface AlarmArray<Type> extends Array<Type> {
    $0: AlarmMainInterface,
    $0data: Array<Type>
}

export type AlarmObject<Type> = Type & {
    $0: AlarmMainInterface<Type>,
    $0data: Type
}


export interface AlarmMainInterface<Type> {

    /**
     * This method is used to listen for subsequent events triggered when data is written to the object.
     * 
     * If ``` immediate ``` is true, the callback will be called immediately, before starting to listen for new events
     */
    addEventListener: AlarmsEventFunction<Type>,
    removeEventListener: (event: ('change'), callback: function) => void
    waitTillAvailable: (field) => Promise<void>


}

export type AlarmsEventFunction<Type> = (event: ('change' | (`${keyof Type}-change`)), callback: (event: CustomEvent<{ field: string, value: string }>) => void, options: AddEventListenerOptions, immediate) => void
