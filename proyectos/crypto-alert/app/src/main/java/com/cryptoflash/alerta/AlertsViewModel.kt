package com.cryptoflash.alerta

import android.app.Application
import android.content.Intent
import androidx.core.content.ContextCompat
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cryptoflash.alerta.data.AlertsStore
import com.cryptoflash.alerta.data.MarketApi
import com.cryptoflash.alerta.model.Exchange
import com.cryptoflash.alerta.model.PriceAlert
import com.cryptoflash.alerta.model.RepeatMode
import com.cryptoflash.alerta.model.TriggerDirection
import com.cryptoflash.alerta.service.PriceMonitorService
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class AlertsViewModel(
    app: Application,
) : AndroidViewModel(app) {
    private val appContext = app.applicationContext
    private val store = AlertsStore(appContext)
    private val api = MarketApi()

    val alerts: StateFlow<List<PriceAlert>> =
        store.alertsFlow.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _selectedSymbol = MutableStateFlow("BTCUSDT")
    val selectedSymbol: StateFlow<String> = _selectedSymbol

    private val _price = MutableStateFlow<Double?>(null)
    val price: StateFlow<Double?> = _price

    private val _selectedExchange = MutableStateFlow(Exchange.Binance)
    val selectedExchange: StateFlow<Exchange> = _selectedExchange

    init {
        viewModelScope.launch {
            store.selectedExchangeFlow.collect { _selectedExchange.value = it }
        }

        viewModelScope.launch {
            var last: Exchange? = null
            _selectedExchange.collect { next ->
                if (last == next) return@collect
                last = next
                _price.value = null
                refreshPricesOnce()
            }
        }

        viewModelScope.launch {
            var last: String? = null
            _selectedSymbol.collect { next ->
                if (last == next) return@collect
                last = next
                _price.value = null
                refreshPricesOnce()
            }
        }

        viewModelScope.launch {
            while (true) {
                runCatching {
                    refreshPricesOnce()
                }
                delay(2_000)
            }
        }

        viewModelScope.launch {
            alerts.collect { list ->
                val shouldRun = list.any { it.isActive && !it.isFired }
                if (shouldRun) startMonitorService() else stopMonitorService()
            }
        }
    }

    fun addAlert(
        symbol: String,
        targetPrice: Double,
        repeatMode: RepeatMode,
        soundKey: String,
    ) {
        viewModelScope.launch {
            val exchange = selectedExchange.value
            val current = api.fetchPrice(exchange, symbol)
            val direction =
                current?.let { if (targetPrice >= it) TriggerDirection.Above else TriggerDirection.Below }

            val newAlert =
                PriceAlert(
                    id = UUID.randomUUID().toString(),
                    symbol = symbol,
                    targetPrice = targetPrice,
                    direction = direction,
                    exchange = exchange,
                    repeatMode = repeatMode,
                    soundKey = soundKey,
                    isActive = true,
                    isFired = false,
                    createdAtEpochMs = System.currentTimeMillis(),
                )

            val next = alerts.value + newAlert
            store.setAlerts(next)
        }
    }

    fun deleteAlert(id: String) {
        viewModelScope.launch {
            val next = alerts.value.filterNot { it.id == id }
            store.setAlerts(next)
        }
    }

    fun setAlertActive(id: String, active: Boolean) {
        viewModelScope.launch {
            val currentList = alerts.value
            val index = currentList.indexOfFirst { it.id == id }
            if (index < 0) return@launch

            val current = currentList[index]
            val updated =
                if (!active) {
                    current.copy(isActive = false)
                } else {
                    val nowPrice = api.fetchPrice(current.exchange, current.symbol)
                    val direction =
                        nowPrice?.let { if (current.targetPrice >= it) TriggerDirection.Above else TriggerDirection.Below }
                    current.copy(
                        isActive = true,
                        isFired = false,
                        firedAtEpochMs = null,
                        direction = direction,
                    )
                }

            val next = currentList.toMutableList().apply { set(index, updated) }
            store.setAlerts(next)
        }
    }

    fun updateSound(id: String, soundKey: String) {
        viewModelScope.launch {
            val next = alerts.value.map { if (it.id == id) it.copy(soundKey = soundKey) else it }
            store.setAlerts(next)
        }
    }

    fun setSelectedExchange(exchange: Exchange) {
        viewModelScope.launch {
            _selectedExchange.value = exchange
            store.setSelectedExchange(exchange)
        }
    }

    fun setSelectedSymbol(symbol: String) {
        _selectedSymbol.value = symbol
    }

    private suspend fun refreshPricesOnce() {
        val exchange = selectedExchange.value
        val symbol = selectedSymbol.value
        _price.value = api.fetchPrice(exchange, symbol)
    }

    private fun startMonitorService() {
        val intent = Intent(appContext, PriceMonitorService::class.java).apply { action = PriceMonitorService.Actions.Start }
        ContextCompat.startForegroundService(appContext, intent)
    }

    private fun stopMonitorService() {
        val intent = Intent(appContext, PriceMonitorService::class.java).apply { action = PriceMonitorService.Actions.Stop }
        appContext.startService(intent)
    }
}
