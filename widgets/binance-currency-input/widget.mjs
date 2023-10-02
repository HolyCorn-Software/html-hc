/**
 * Copyright 2023 HolyCorn Software
 * This widget allows a user to enter a single currency, whereby, currency data is gotten from Binance
 */

import BinanceCurrenciesInput from "../binance-currencies-input/widget.mjs";


export default class BinanceCurrencyInput extends BinanceCurrenciesInput {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.label
     * @param {SearchListPopupTypes.ListSizeLimits} param0.listSize
     * @param {BinanceCurrencyInputTypes.InputType} param0.currencyType
     */
    constructor({ name, label, currencyType } = {}) {
        super({ ...arguments[0], listSize: { min: 1, max: 1 } })
    }

    /**
     * @returns {string}
     */
    get value() {
        return super.value?.[0]
    }
    /**
     * @param {string} value
     */
    set value(value) {
        super.value = [value]
    }
}