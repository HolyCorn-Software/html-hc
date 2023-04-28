/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the popup-form widget
 */

import { Collection } from "mongodb"


global {
    namespace htmlhc.widget.popupform {
        type Values<T> = T[keyof T]

        type CreateForm<T> = Values<{
            [K in keyof T]:
            [
                htmlhc.widget.multiflexform.MultiFlexFormFieldData & { name: K }
            ]
        }>[]

    }
}