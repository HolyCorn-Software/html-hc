/**
 * Copyright 2023 HolyCorn Software
 * Borrowed from the DeInstantWay Project
 * This module (types) contains type definitions for the currency input
 */




declare namespace BinanceCurrencyInputTypes {

    type InputType = ("crypto" | "fiat" | "all")

    interface BinanceCurrencyData {
        id: string
        assetCode: string
        assetName: string
        unit: string,
        commissionRate: number
        freeAuditWithdrawAmt: number
        freeUserChargeAmount: number
        createTime: number
        test: number
        gas: number
        isLegalMoney: boolean
        reconciliationAmount: number
        seqNum: string
        chineseName: string
        cnLink: string
        enLink: string
        logoUrl: string
        fullLogoUrl: string
        supportMarket: string
        feeReferenceAsset: string
        feeRate: number
        feeDigit: number
        assetDigit: number
        trading: boolean
        tags: string[]
        plateType: "MAINWEB" | "DEX"
        etf: boolean
        isLedgerOnly: boolean
        delisted: boolean
        preDelist: boolean
        pdTradeDeadline: string
        pdDepositDeadline: string
        pdAnnounceUrl: string
    }
}