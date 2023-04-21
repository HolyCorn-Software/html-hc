/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */






export declare interface HeaderItemData {
    label: string
}


export type HeaderData = HeaderItemData[]


export type ListingsStatedata<DataType> = htmlhc.lib.alarm.AlarmObject<ListingsStatedataStructure<DataType>>

export interface ListingsItemData<InputType = any> {
    label: string,
    fields: ContentMiddleWareReturn<InputType>

}

export declare interface ListingsStatedataStructure<InputType = any> {
    contentMiddleware: ContentMiddleWare<InputType>[]
    /** 
     * This content could be an array of custom data, or following the format of columns, and content
     * 
     * If it is an array of custom data, then the content middleware must return data in the column, and content format
     * 
    */
    content: (InputType | ContentMiddleWareReturn<InputType>)[]
    headers: HeaderItemData[]
}

export declare interface ContentMiddleWare<InputType = any> {
    name: string,
    set: (input: InputType) => ContentMiddleWareReturn<InputType>,
    get: (data: ContentMiddleWareReturn<InputType>) => InputType
}

interface ListingsFieldData<MetadataType = any> {
    content: ListingsContentData
    style: ListingsStyleData,
    metadata: MetadataType
}

export interface ContentMiddleWareReturn<InputType = any> {
    columns: ListingsFieldData<InputType>[]

}


export type ListingsContentData = string | HTMLElement

export declare interface ListingsStyleData {
    highlightable: boolean
}