/**
 * Copyright 2022 HolyCorn Software
 * This module contains type definitions for the search-input widget
 */



/**
 * This defines methods that must be provided when initializing the SearchInput widget
 */
export declare interface SearchInputHooks<T = any> {
    fetchItems: (filter: string) => Promise<T[]>,
    getView: (item: T) => Promise<HTMLElement[]>,
    getLabel: (item: T) => string,
    getValue: (item: T) => string | number | boolean
}