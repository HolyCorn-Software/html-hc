/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains type definitions for the Payment Manager module
 * 
 */

import AlarmObject from "../../lib/alarm/alarm.mjs"






export declare interface HeaderItemData {
    label: string
}


export type HeaderData = [HeaderItemData]


export type ListingsStatedata = AlarmObject<ListingsStatedataStructure>

export interface ListingsItemData {
    label: string,
    fields: ContentMiddleWareReturn

}

export declare interface ListingsStatedataStructure {
    contentMiddleware: [ContentMiddleWare],
    content: [
        ContentMiddleWareReturn
    ],
    headers: [HeaderItemData]
}

export declare interface ContentMiddleWare {
    name: string,
    set: (input: any) => ContentMiddleWareReturn,
    get: (data: ContentMiddleWareReturn) => any
}

interface ListingsFieldData {
    content: ListingsContentData
    style: ListingsStyleData,
    metadata: any
}

export interface ContentMiddleWareReturn {
    columns: [
        ListingsFieldData
    ]
}


export type ListingsContentData = string | HTMLElement

export declare interface ListingsStyleData {
    highlightable: boolean
}