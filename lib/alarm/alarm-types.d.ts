/**
 * Copyright 2022 HolyCorn Software
 * This module (alarm-types.d.ts) contains type definitions for the alarm module
 * 
 */


export interface AlarmArray<Type> extends Array<Type> {
    $0: AlarmMainInterface,
    $0data: Array<Type>
}

export type AlarmObject<Type> = Type & {
    $0: AlarmMainInterface,
    $0data: Type
}

export interface AlarmMainInterface {
    addEventListener: AlarmsEventFunction,
    removeEventListener: (event: ('change'), callback: function) => void
    waitTillAvailable: (field) => Promise<void>
}

export type AlarmsEventFunction = (event: ('change'), callback: (event: CustomEvent<{ field: string, value: string }>) => void, options: AddEventListenerOptions) => void


// export class Alar