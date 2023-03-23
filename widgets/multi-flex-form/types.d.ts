/**
 * Copyright 2022 HolyCorn Software
 * The multi-flex-form widget
 * This module (types) contain nothing different from the type definitions relied on by MultiFlexForm and it's users
 */


export type InputTypes = ('text' | 'number' | 'date' | 'password' | 'textarea' | 'choose' | 'customWidget' | 'uniqueFileUpload' | 'boolean' | 'time')

export declare interface MultiFlexFormFieldData {
    label: string
    value: string | number | boolean
    values: { [key: string]: string }
    type: InputTypes
    customWidgetUrl: string
    valueProperty: string
    /** The url that the file will be uploaded to, if type is 'uniqueFileUpload' */
    url: string
}

export declare type MultiFlexFormFieldFullData = MultiFlexFormFieldData & {
    name: string
}
export type MultiFlexFormDefinitionData = MultiFlexFormFieldFullData[][]