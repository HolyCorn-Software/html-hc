/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the flat-inline-select widget
 */


import ''

global {
    namespace htmlhc.widget.flat_inline_select {
        interface Item {
            name: string
            content: string | HTMLElement
        }
    }
}