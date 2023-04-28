/**
 * Copyright 2022 HolyCorn Software
 * The multi-flex-form widget
 * This module (types) contain nothing different from the type definitions relied on by MultiFlexForm and it's users
 */

import { Collection } from "mongodb"

/**
 * @deprecated Use htmlhc.widget.multiflexform.InputTypes
 */
export type InputTypes = htmlhc.widget.multiflexform.InputTypes
/**
 * @deprecated use @see htmlhc.widget.multiflexform.MultiFlexFormFieldData instead
 */
export declare interface MultiFlexFormFieldData extends htmlhc.widget.multiflexform.MultiFlexFormFieldData { }

/**
 * @deprecated use htmlhc.widget.multiflexform.MultiFlexFormFieldFullData instead
 */
export declare interface MultiFlexFormFieldFullData extends htmlhc.widget.multiflexform.MultiFlexFormFieldFullData { }
/**
 * @deprecated use htmlhc.widget.multiflexform.MultiFlexFormDefinitionData
 */
export type MultiFlexFormDefinitionData = htmlhc.widget.multiflexform.MultiFlexFormDefinitionData

global {
    namespace htmlhc.widget.multiflexform {
        interface MultiFlexFormFieldData {
            label: string
            value: string | number | boolean
            values: { [key: string]: string }
            type: InputTypes
            customWidgetUrl: string
            valueProperty: string
            /** The url that the file will be uploaded to, if type is 'uniqueFileUpload' */
            url: string
        }

        interface MultiFlexFormFieldFullData extends MultiFlexFormFieldData {
            name: string
        }
        type MultiFlexFormDefinitionData = MultiFlexFormFieldFullData[][]

        type InputTypes = ('text' | 'number' | 'date' | 'password' | 'textarea' | 'choose' | 'customWidget' | 'uniqueFileUpload' | 'boolean' | 'time')

    }
}