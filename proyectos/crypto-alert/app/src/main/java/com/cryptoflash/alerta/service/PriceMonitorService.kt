package com.cryptoflash.alerta.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.cryptoflash.alerta.data.AlertsStore
import com.cryptoflash.alerta.data.MarketApi
import com.cryptoflash.alerta.model.Exchange
import com.cryptoflash.alerta.model.PriceAlert
import com.cryptoflash.alerta.model.RepeatMode
import com.cryptoflash.alerta.model.TriggerDirection
import com.cryptoflash.alerta.notify.Notifier
import com.cryptoflash.alerta.sound.SoundPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class PriceMonitorService : Service() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private lateinit var alertsStore: AlertsStore
    private lateinit var api: MarketApi
    private lateinit var notifier: Notifier
    private lateinit var player: SoundPlayer

    private var loopJob: Job? = null
    private val pendingSoundJobs = LinkedHashSet<Job>()
    private val pendingJobsByAlertId = HashMap<String, MutableList<Job>>()
    private val lastSeenPriceByAlertId = HashMap<String, Double>()
    private var lastForegroundActive: Int = -1
    private var lastForegroundPending: Int = -1

    override fun onCreate() {
        super.onCreate()
        alertsStore = AlertsStore(applicationContext)
        api = MarketApi()
        notifier = Notifier(applicationContext)
        player = SoundPlayer(applicationContext)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            Actions.Stop -> {
                stopSelf()
                return START_NOT_STICKY
            }
            Actions.StopAlarm -> {
                serviceScope.launch {
                    stopAlarmNow()
                }
                return START_STICKY
            }
        }

        if (loopJob?.isActive != true) {
            loopJob = serviceScope.launch { runLoop() }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        loopJob?.cancel()
        serviceScope.coroutineContext[Job]?.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private suspend fun runLoop() {
        while (serviceScope.isActive) {
            try {
                val alerts = alertsStore.alertsFlow.first()
                val activeAlerts = alerts.filter { it.isActive && !it.isFired }
                pendingSoundJobs.removeAll { !it.isActive }
                pendingJobsByAlertId.entries.removeAll { (_, jobs) ->
                    jobs.removeAll { !it.isActive }
                    jobs.isEmpty()
                }

                val existingIds = alerts.mapTo(HashSet()) { it.id }
                val removedIds = pendingJobsByAlertId.keys.filterNot { it in existingIds }
                for (removedId in removedIds) {
                    pendingJobsByAlertId.remove(removedId)?.forEach { it.cancel() }
                    lastSeenPriceByAlertId.remove(removedId)
                }

                val activeIds = activeAlerts.mapTo(HashSet()) { it.id }
                lastSeenPriceByAlertId.keys.removeAll { it !in activeIds }

                if (activeAlerts.isEmpty() && pendingSoundJobs.isEmpty()) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                    stopSelf()
                    return
                }

                if (lastForegroundActive != activeAlerts.size || lastForegroundPending != pendingSoundJobs.size) {
                    lastForegroundActive = activeAlerts.size
                    lastForegroundPending = pendingSoundJobs.size
                    startForeground(
                        FOREGROUND_ID,
                        notifier.foregroundNotification(
                            activeAlerts = activeAlerts.size,
                            pendingRepeats = pendingSoundJobs.size,
                        ),
                    )
                }

                val prices = fetchPrices(activeAlerts)
                val updated = triggerIfNeeded(alerts, prices)
                if (updated !== alerts) alertsStore.setAlerts(updated)

                delay(1_500)
            } catch (error: Exception) {
                if (error is CancellationException) throw error
                Log.e("PriceMonitorService", "No se pudo revisar el precio; se reintentará.", error)
                delay(3_000)
            }
        }
    }

    private suspend fun fetchPrices(alerts: List<PriceAlert>): Map<Pair<Exchange, String>, Double> {
        val out = LinkedHashMap<Pair<Exchange, String>, Double>()
        for (alert in alerts) {
            val key = alert.exchange to alert.symbol
            if (out.containsKey(key)) continue
            val price = api.fetchPrice(alert.exchange, alert.symbol) ?: continue
            out[key] = price
        }
        return out
    }

    private suspend fun triggerIfNeeded(
        alerts: List<PriceAlert>,
        prices: Map<Pair<Exchange, String>, Double>,
    ): List<PriceAlert> {
        var anyUpdated = false
        val now = System.currentTimeMillis()

        val updated = alerts.map { alert ->
            if (!alert.isActive || alert.isFired) return@map alert
            val current = prices[alert.exchange to alert.symbol] ?: return@map alert

            val direction = alert.direction
            if (direction == null) {
                lastSeenPriceByAlertId[alert.id] = current
                anyUpdated = true
                if (current == alert.targetPrice) {
                    return@map alert.copy(
                        direction = TriggerDirection.Above,
                        isActive = false,
                        isFired = true,
                        firedAtEpochMs = now,
                    )
                }
                val resolved = if (current < alert.targetPrice) TriggerDirection.Above else TriggerDirection.Below
                return@map alert.copy(direction = resolved)
            }

            val previous = lastSeenPriceByAlertId[alert.id]
            lastSeenPriceByAlertId[alert.id] = current
            val reached = if (previous == null) {
                when (direction) {
                    TriggerDirection.Above -> current >= alert.targetPrice
                    TriggerDirection.Below -> current <= alert.targetPrice
                }
            } else {
                when (direction) {
                    TriggerDirection.Above -> previous < alert.targetPrice && current >= alert.targetPrice
                    TriggerDirection.Below -> previous > alert.targetPrice && current <= alert.targetPrice
                }
            }

            if (!reached) return@map alert

            anyUpdated = true
            alert.copy(
                isActive = false,
                isFired = true,
                firedAtEpochMs = now,
            )
        }

        if (!anyUpdated) return alerts

        for (alert in updated.filter { it.isFired && it.firedAtEpochMs == now }) {
            lastSeenPriceByAlertId.remove(alert.id)
            notifier.showAlertFired(alert.symbol, alert.targetPrice)
            val immediateJob = serviceScope.launch { player.playOnce(alert.soundKey) }
            pendingSoundJobs += immediateJob
            pendingJobsByAlertId.getOrPut(alert.id) { mutableListOf() }.add(immediateJob)

            val repeatMode =
                if (alert.repeatMode == RepeatMode.Once && alert.repeatCount > 1) RepeatMode.TwiceAfter1Min else alert.repeatMode
            if (repeatMode == RepeatMode.TwiceAfter1Min) {
                val delayedJob =
                    serviceScope.launch {
                        delay(60_000)
                        player.playOnce(alert.soundKey)
                    }
                pendingSoundJobs += delayedJob
                pendingJobsByAlertId.getOrPut(alert.id) { mutableListOf() }.add(delayedJob)
            }
        }

        return updated
    }

    object Actions {
        const val Start = "com.cryptoflash.alerta.action.START"
        const val Stop = "com.cryptoflash.alerta.action.STOP"
        const val StopAlarm = "com.cryptoflash.alerta.action.STOP_ALARM"
    }

    companion object {
        private const val FOREGROUND_ID = 1
    }

    private suspend fun stopAlarmNow() {
        pendingSoundJobs.forEach { it.cancel() }
        pendingSoundJobs.clear()
        pendingJobsByAlertId.values.forEach { jobs -> jobs.forEach { it.cancel() } }
        pendingJobsByAlertId.clear()
        player.stop()
        lastForegroundPending = -1
    }
}
