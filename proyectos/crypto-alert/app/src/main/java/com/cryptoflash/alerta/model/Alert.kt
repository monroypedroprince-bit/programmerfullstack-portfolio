package com.cryptoflash.alerta.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class TriggerDirection {
    @SerialName("above")
    Above,

    @SerialName("below")
    Below,
}

@Serializable
enum class Exchange {
    @SerialName("binance")
    Binance,

    @SerialName("bybit")
    Bybit,

    @SerialName("okx")
    Okx,
}

@Serializable
enum class RepeatMode {
    @SerialName("once")
    Once,

    @SerialName("twice_after_1m")
    TwiceAfter1Min,
}

@Serializable
data class PriceAlert(
    val id: String,
    val symbol: String,
    val targetPrice: Double,
    val direction: TriggerDirection? = null,
    val exchange: Exchange = Exchange.Binance,
    val repeatMode: RepeatMode = RepeatMode.Once,
    val repeatCount: Int = 1,
    val soundKey: String,
    val isActive: Boolean,
    val isFired: Boolean,
    val createdAtEpochMs: Long,
    val firedAtEpochMs: Long? = null,
)
