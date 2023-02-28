/**
 * Copyright 2023 HolyCorn Software
 * This module, is part of the list-popup widget
 * It contains type definitions needed by the widget
 */


interface ListPopupOption<ValueType> {
    label: string
    caption: string
    value: ValueType
}