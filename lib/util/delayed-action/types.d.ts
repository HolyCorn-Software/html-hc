/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the delayed-action utility
 */


declare namespace htmlhc.lib.util.delayedAction {

    var FunctionType: {
        new <T>(fxn: (...input: T) => any): (...input: T) => any
    }
}
