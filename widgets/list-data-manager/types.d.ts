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
            display: Display<T>
            /** Configurations how new data would be inputted, and edited. */
            input: htmlhc.widget.multiflexform.MultiFlexFormDefinitionData
            /** This function should return a generator, that supplies that for the widget. */
            fetch: () => Promise<AsyncGenerator<T>>
            /** This function is called when the widget has new data that must be written to the data source. This method should return the final data that has been written, and is ready to be imputted into the widget */
            create?: (input: T[]) => Promise<T[]>
            /** This function is called when the user deleted a number of items. */
            delete?: (input: T[]) => Promise<void>
            /** This function is called when the user highlights an item. This method should return a set of HTMLElements, that would be presented to the user for that action. */
            actions?: (input: T) => Promise<HTMLElement[]> | (HTMLElement[])
            /** Parameters that determine how the user edits data. */
            edit?: {
                /** The structure of the form that would be used to edit a data item. If this is omitted, the {@link Config['input']} form would be used. */
                form?: htmlhc.widget.multiflexform.MultiFlexFormDefinitionData
                /** This optional method is expected to return an object, that can be directly used to set the value of the form during editing. The input, is a data object. */
                setForm?: (input: T) => any | Promise<any>
                /** This method is expected to actually carry out the task of editing a data item remotely. If this method is not defined, the {@link Config['create']} method would be used instead. */
                execute?: (input: T) => Promise<T>

            }
        }
        type Display<T, K = string> = {
            label: string
            name: K & (keyof T)
            view: StandardView | (
                (input: T[K], data: T) => HTMLElement | Promise<HTMLElement>
            )
        }[]

        type StandardView = "::image" | "::text"
    }
}