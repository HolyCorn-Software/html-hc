/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * The list-data-manager widget
 * This module (types), contains type definitions for the widget
 */


import ''

global {
    namespace htmlhc.widget.list_data_manager {
        interface Config<T = {}> {
            /** Configurations about how content would be displayed, field by field */
            display: Display<T>[]
            /** Configurations how new data would be inputted, and edited. */
            input: htmlhc.widget.multiflexform.MultiFlexFormDefinitionData
            /** This function should return a generator, that supplies that for the widget. */
            fetch: () => Promise<AsyncGenerator<T>>
            /** This function is called when the widget has new data that must be written to the data source. This method should return the final data that has been written, and is ready to be imputted into the widget */
            create: (input: T[]) => Promise<T[]>
            /** This function is called when the user deleted a number of items. */
            delete: (input: T[]) => Promise<void>
            /** This function is called when the user highlights an item. This method should return a set of HTMLElements, that would be presented to the user for that action. */
            actions: (input: T) => Promise<HTMLElement[]> | (HTMLElement[])
        }
        interface Display<T> {
            label: string
            name: keyof T
            view: StandardView | ((input: any, data: T) => HTMLElement | Promise<HTMLElement>)
        }

        type StandardView = "::image" | "::text"
    }
}