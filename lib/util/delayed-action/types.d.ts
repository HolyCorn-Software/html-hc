/**
 * Copyright 2023 HolyCorn Software
 * The html-hc library
 * This module contains type definitions for the delayed-action utility
 */


declare namespace htmlhc.lib.util.delayedAction {

    var FunctionType: {
        new <I, O>(fxn: (...input: I) => O): (...input: I) => Promise<Awaited<O>>
    }
}
