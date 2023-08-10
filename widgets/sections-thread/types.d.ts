/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The sections-thread widget
 * This file contains type definitions
 * 
 */


import "../../lib/widget/lib.mjs";


global {
    namespace htmlhc.widget.sectionsthread {
        interface Item {
            html: HTMLElement
            label: string
        }
    }
}