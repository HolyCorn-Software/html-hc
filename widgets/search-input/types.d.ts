/**
 * Copyright 2022 HolyCorn Software
 * This module contains type definitions for the search-input widget
 */



/**
 * This defines methods that must be provided when initializing the SearchInput widget
 */
export declare interface SearchInputHooks {
    fetchItems: (filter: string) => Promise<[object]>,
    getView: (item: object) => Promise<[HTMLElement]>,
    getLabel: (item) => string,
    getValue: (item) => string|number|boolean
}