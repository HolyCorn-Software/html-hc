/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the popup-form widget
 */

import { MultiFlexFormFieldData } from "../multi-flex-form/types";

global {
    namespace htmlhc.widget.popupform {
        type Values<T> = T[keyof T]

        type CreateForm<T> = Values<{
            [K in keyof T]:
            [
                MultiFlexFormFieldData & { name: K }
            ]
        }>[]

    }
}