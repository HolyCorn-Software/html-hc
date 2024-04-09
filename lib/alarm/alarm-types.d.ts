/**
 * Copyright 2022 HolyCorn Software
 * This module (alarm-types.d.ts) contains type definitions for the alarm module
 * 
 */

import { Collection, MatchKeysAndValues } from "mongodb"


export type AlarmArray<Type> = htmlhc.lib.alarm.AlarmArray<Type>

/**
 * @deprecated use htmlhc.lib.alarm.AlarmObject or just use the regular AlarmObject
 */
export type AlarmObject<Type> = htmlhc.lib.alarm.AlarmObject<T>


global {
    declare namespace htmlhc.lib.alarm {


        declare type AlarmObject<T = {}> = T & AlarmInterface<T>

        type AlarmArray<T = {}> = Array<T> & AlarmInterface<T>

        declare var AlarmObjectClass: {
            new <T>(): AlarmObjectMixin<T>
        }

        interface AlarmObjectMixin<T> extends AlarmInterface<T> { }

        type AlarmInterface<T> = {
            $0data: T
            $0: AlarmMainInterface<T>
        }


        interface AlarmMainInterface<Type> {

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

        type RecurDotNames<T, Prefix = false> = T extends UnusableTypes ? never : T extends string ? `${DoPrefix<T, Prefix>}` : keyof
            {
                [K in keyof T as DoPrefix<RecurDotNames<K> | (T[K] extends any[] ? `${K}-$array-items` : T[K] extends object ? `${RecurDotNames<T[K], K>}` : never), Prefix>]: true
            }



        type EventNames<T> = `change` | `${RecurDotNames<T>}-change`


        export type AlarmsEventFunction<Type> = (event: (EventNames<Type>), callback: (event: CustomEvent<{ field: string, value: string }>) => void, options?: AddEventListenerOptions, immediate?: boolean) => void



    }
}


