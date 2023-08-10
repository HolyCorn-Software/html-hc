/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The simple-tree widget
 * This module contains type definitions for the widget
 */


import "./widget.mjs"


global {
    namespace htmlhc.widget.simpletree {
        interface Item {
            parent: string
            id: string
            label: string
            icon: string
        }

        type TreeData = Item[]
    }
}