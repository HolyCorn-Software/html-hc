/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the widget libraries of html-hc
 */

import { hc, Widget } from './index.mjs'

type HTMLElementTypes = Element | HTMLElement | HTMLInputElement | HTMLVideoElement | HTMLAudioElement
type HTMLElementTypesJoined = Element & HTMLElement & HTMLInputElement & HTMLVideoElement & HTMLAudioElement

type ExtendedHTML<WidgetType, T = HTMLElementTypesJoined> = {
    $: (selector: string) => ExtendedHTML<Widget>
    $$: (selector: string) => ExtendedHTML<Widget>[]
    spawn: hc.spawn
    widgetObject: WidgetType
} &
    Extend<T, WidgetType>


type Extend<T, WT = Widget> = {
    [K in keyof T]: T[K] extends HTMLElementTypes ? ExtendedHTML<WT>
    : T[K] extends { [index: number]: Element } ? { [index: number]: ExtendedHTML<WT, T> } & OtherProps<T[K]>
    : T[K]
}

type OtherProps<T> = {
    [K in keyof T]: T[K]
}


type WidgetPropertyArgs<WidgetType extends Widget, InputType, ThisArg = {}> = {
    /** The selector pointing to the parent element that will house this widget **/
    parentSelector: string
    /**  The selector of the widget relative to parent **/
    selector: string
    /** The name of the property that will be bound to this object itself */
    property: keyof ThisArg
    /**  Whether we should add the widget as the first of the parent, or the last */
    should_prepend: boolean
    /** The function to be called when the value has changed */
    onchange: () => void
    /** If you don't want to specify a transform function, use this to specify if read values should be converted to HTMLElement or Widget */
    childType: ('widget' | 'html')
    /** Optional parameter which defines special functions(get and set) that allow the property to accept arbitary input in order to transform it to a widget, thereby allowing the api users more freedom, as well as transform a widget into a different type of output. */
    transforms: {
        /** This function should take in data return an HTML, that would be appended to the DOM */
        set: (input: InputType) => import('./types.js').ExtendedHTML<WidgetType>
        /** This function should take in an HTML, and produce data */
        get: (html: import('./types.js').ExtendedHTML<WidgetType>) => InputType
    }
    /**  Optionally specifying this will determine where the property will be stored.The property is normally stored on this */
    object: object
    /**  If parameter is true, Only immediate children of the parent will be fetched */
    immediate: boolean
}