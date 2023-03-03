/**
 * Copyright 2023 HolyCorn Software
 * This module is part of the search-list-popup widget, and contains type definitions for it
 */



namespace SearchListPopupTypes {

    type SearchFunction<T> = (filter: string) => Promise<SearchListPopupItemData<T>[]>

    type ValueToDataFunction <T> = (value:T)=> Promise<SearchListPopupItemData<T>>


    interface SearchListPopupItemData<T = any> {
        label: string
        value: T
        image: string

    }

    interface ListSizeLimits{
        max: number
        min: number
    }
}