/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the widget libraries of html-hc
 */

import { hc, Widget } from './index.mjs'
import index from './index.mjs'

global {

    interface HTMLElement<W = undefined> {
        widgetObject?: W
        $: (selector: string) => HTMLElement<W>
        $$: (selector: string) => HTMLElement<W>[]
        spawn: () => HTMLElement<W>
    }
    namespace htmlhc.lib.widget {


        type HTMLElementTypes = Element | HTMLElement | HTMLInputElement | HTMLVideoElement | HTMLAudioElement
        type HTMLElementTypesJoined = Element & HTMLElement & HTMLInputElement & HTMLVideoElement & HTMLAudioElement

        /**
         * @deprecated Just use {@link HTMLElement}
         */
        type ExtendedHTML<WidgetType> = {
            $: (selector: string) => ExtendedHTML<Widget>
            $$: (selector: string) => ExtendedHTML<Widget>[]
            spawn: hc.spawn
            widgetObject: WidgetType
        }

        type OtherProps<T> = {
            [K in keyof T]: T[K]
        }

        type PropertyType = "plural" | "single"

        type GetArrayType<T> = T extends (infer Arr)[] ? Arr : T
        type GetArgType<T, PropType extends PropertyType> = PropType extends "single" ? T : GetArrayType<T>

        type WidgetPropertyArgs<WidgetType, PropertyName, PropType extends PropertyType, DataWidget> = {
            /** The selector pointing to the parent element that will house this widget **/
            parentSelector: string
            /**  The selector of the widget relative to parent **/
            selector: string
            /**  Whether we should add the widget as the first of the parent, or the last */
            should_prepend?: boolean
            /** The function to be called when the value has changed */
            onchange?: () => void
            /** If you don't want to specify a transform function, use this to specify if read values should be converted to HTMLElement or Widget */
            childType?: ('widget' | 'html')
            /** Optional parameter which defines special functions(get and set) that allow the property to accept arbitary input in order to transform it to a widget, thereby allowing the api users more freedom, as well as transform a widget into a different type of output. */
            transforms?: {
                /** This function should take in data return an HTML, that would be appended to the DOM */
                set: (input: GetArgType<WidgetType[PropertyName], PropType>) => HTMLElement<DataWidget>
                /** This function should take in an HTML, and produce data */
                get: (html: HTMLElement<DataWidget>) => GetArgType<WidgetType[PropertyName], PropType>
            }
            /**  Optionally specifying this will determine where the property will be stored.The property is normally stored on this */
            target?: object
            /** @deprecated use target instead */
            object?: object
            /**  If parameter is true, Only immediate children of the parent will be fetched */
            immediate?: boolean
            /** 
             * This property tells us how the DOM should be altered, when the property is set at once.
             * 
             * Imagine you're setting to a property 'items', which already has value `['mango', 'banana', 'pear']`.
             * This means, there are already {@link HTMLElement}s representing them on the DOM.
             * Now, you're setting 'items' to `['apple', 'pear', 'strawberry']`.
             * If sticky is `true`, then the {@link HTMLElement} for `'pear'` would be directly used.
             * If not true, then another HTMLElement would be constructed for each of the new values.
             * 
             */
            sticky?: boolean
        }

        type GetLastParam<T> = T extends (...args: any[], last: infer LAST) => LAST ? LAST : "wrong"


    }

    namespace htmlhc.widget {
        /**
         * This interface contains names of common events widgets expect to be fired in HTML.
         */
        interface WidgetHTMLEvents {
            'example': {
                value: number
                done: boolean
            }
        }

        type WidgetHTMLEventsExpanded = WidgetHTMLEvents[keyof WidgetHTMLEvents]
    }



    interface WidgetEvent<E = any> extends Event {
        readonly detail: htmlhc.widget.WidgetHTMLEvents[E];
    }

    declare var WidgetEvent: {
        prototype: WidgetEvent;
        new <E extends keyof htmlhc.widget.WidgetHTMLEvents>(type: E, eventInitDict?: CustomEventInit<htmlhc.widget.WidgetHTMLEvents[E]>): WidgetEvent<E>;
    };
}