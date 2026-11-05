package com.cryptoflash.alerta.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.cryptoflash.alerta.model.Exchange
import com.cryptoflash.alerta.model.PriceAlert
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val Context.dataStore by preferencesDataStore(name = "alerts_store")

class AlertsStore(
    private val appContext: Context,
) {
    private val key = stringPreferencesKey("alerts_json")
    private val exchangeKey = stringPreferencesKey("selected_exchange")

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    val alertsFlow: Flow<List<PriceAlert>> =
        appContext.dataStore.data
            .map { prefs ->
                val raw = prefs[key].orEmpty()
                if (raw.isBlank()) {
                    emptyList()
                } else {
                    runCatching { json.decodeFromString<List<PriceAlert>>(raw) }.getOrElse { emptyList() }
                }
            }
            .distinctUntilChanged()

    val selectedExchangeFlow: Flow<Exchange> =
        appContext.dataStore.data
            .map { prefs -> prefs[exchangeKey].orEmpty() }
            .map { raw ->
                when (raw.lowercase()) {
                    "bybit" -> Exchange.Bybit
                    "okx" -> Exchange.Okx
                    else -> Exchange.Binance
                }
            }
            .distinctUntilChanged()

    suspend fun setAlerts(alerts: List<PriceAlert>) {
        appContext.dataStore.edit { prefs ->
            prefs[key] = json.encodeToString(alerts)
        }
    }

    suspend fun setSelectedExchange(exchange: Exchange) {
        appContext.dataStore.edit { prefs ->
            prefs[exchangeKey] =
                when (exchange) {
                    Exchange.Binance -> "binance"
                    Exchange.Bybit -> "bybit"
                    Exchange.Okx -> "okx"
                }
        }
    }
}
