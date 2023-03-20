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
type AlarmObjectType<T> = AlarmObject<T>


export interface AlarmMainInterface<Type> {

    /**
     * This method is used to listen for subsequent events triggered when data is written to the object.
     * 
     * If ``` immediate ``` is true, the callback will be called immediately, before starting to listen for new events
     */
    addEventListener: AlarmsEventFunction<Type>,
    removeEventListener: (event: EventNames<Type>, callback: function) => void
    waitTillAvailable: (field) => Promise<void>


}

type Values<T> = T[keyof T]
type UnusableTypes = any[] | number | boolean | undefined | symbol

type DoPrefix<T, Prefix = false> = T extends string ? (Prefix extends string ? `${Prefix}.${T}` : T) : never

type RecurEventNames<T, Prefix = false> = T extends UnusableTypes ? never : T extends string ? `${DoPrefix<T, Prefix>}-change` : keyof
    {
        [K in keyof T as DoPrefix<RecurEventNames<K> | (T[K] extends object ? `${RecurEventNames<T[K], K>}` : never), Prefix>]: true
    }


type EventNames<T> = `change` | RecurEventNames<T>


export type AlarmsEventFunction<Type> = (event: (EventNames<Type>), callback: (event: CustomEvent<{ field: string, value: string }>) => void, options: AddEventListenerOptions, immediate) => void
