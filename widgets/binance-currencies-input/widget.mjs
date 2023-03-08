/**
 * Copyright 2023 HolyCorn Software
 * Borrowed from the DeInstantWay Project
 * This input allows a user to input one or more currencies.
 * The currency data comes from Binance
 */

import SearchListPopup from "/$/system/static/html-hc/widgets/search-list-popup/widget.mjs";

const info = Symbol()

/**
 * @extends {SearchListPopup<BinancePayTypes.BinanceCurrencyData['assetCode']>}
 */
export default class BinanceCurrenciesInput extends SearchListPopup {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.label
     * @param {SearchListPopupTypes.ListSizeLimits} param0.listSize
     * @param {BinanceCurrencyInputTypes.InputType} param0.currencyType
     */
    constructor({ name, label, listSize, currencyType } = {}) {

        listSize ||= { min: 1, max: 32 }

        super(
            {
                ...arguments[0],
                listSize,

                doSearch: async (filter) => {

                    if (filter.length < 2) {
                        return []
                    }

                    const info = await BinanceCurrenciesInput.getCoinsInfo(this.currencyType)

                    for (let spec of ['.', '\\']) {
                        filter = filter.replaceAll(spec, `\\${spec}`)
                    }
                    const filterRegexp = new RegExp(filter.replaceAll(/[^a-zA-Z0-9]/g, '.*'), 'gi')

                    const data = info.filter(coin => {
                        const uCode = coin.assetCode.toUpperCase();
                        const uFilter = filter.toUpperCase();
                        return (uCode == uFilter) || (uCode.indexOf(uFilter) !== -1) || filterRegexp.test(coin.assetName)
                    });


                    return data.map(x => {
                        return {
                            label: x.assetName,
                            image: x.logoUrl,
                            value: x.assetCode
                        }
                    })

                },
                transformValue: async (v) => {
                    const fullData = (await BinanceCurrenciesInput.getCoinsInfo()).find(x => x.assetCode === v)
                    return {
                        image: fullData.logoUrl,
                        value: fullData.assetCode,
                        label: fullData.assetName
                    }
                },
                hideOnOutsideClick: true
            }
        );

        /** @type {BinanceCurrencyInputTypes.InputType} */ this.currencyType

    }

    /**
     * @returns {Promise<BinancePayTypes.BinanceCurrencyData[]>}
     */
    static async getCoinsInfo(currencyType) {
        /** @returns {Promise<BinancePayTypes.BinanceCurrencyData[]>} */
        const fetchNew = async () => this[info] ||= (await (await fetch("https://www.binance.com/bapi/asset/v2/public/asset/asset/get-all-asset")).json()).data


        /** 
         * @param {BinancePayTypes.BinanceCurrencyData[]}
         * @returns {BinancePayTypes.BinanceCurrencyData[]} 
         * */
        const filter = (data) => {
            if (currencyType === 'crypto' || currencyType === 'fiat') {
                return data.filter(x => currencyType === 'crypto' ? !x.isLegalMoney : x.isLegalMoney); //Get all, but show only crypto
            }
            return data;
        }

        if (this[fetchPromise]) {
            try {
                return filter(await this[fetchPromise])
            } catch (e) {
                return filter(await (this[fetchPromise] = fetchNew()))
            }
        } else {
            return filter(await (this[fetchPromise] = fetchNew()))
        }
    }
    /**
     * @returns {string[]}
     */
    get value() {
        return super.value
    }
    /**
     * @param {string[]} value
     */
    set value(value) {
        super.value = value
    }

}

const fetchPromise = Symbol()