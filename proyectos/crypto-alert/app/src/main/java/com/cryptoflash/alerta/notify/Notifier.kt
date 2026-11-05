package com.cryptoflash.alerta.notify

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.os.Build
import androidx.core.app.NotificationCompat
import com.cryptoflash.alerta.MainActivity
import com.cryptoflash.alerta.R
import com.cryptoflash.alerta.service.PriceMonitorService

class Notifier(
    private val appContext: Context,
) {
    private val manager = appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun ensureChannels() {
        if (Build.VERSION.SDK_INT >= 26) {
            val foreground =
                NotificationChannel(
                    FOREGROUND_CHANNEL_ID,
                    "Monitoreo",
                    NotificationManager.IMPORTANCE_LOW,
                ).apply {
                    setSound(null, null)
                    enableVibration(false)
                    enableLights(false)
                }
            manager.createNotificationChannel(foreground)

            val alerts =
                NotificationChannel(
                    ALERTS_CHANNEL_ID,
                    "Alertas de precios",
                    NotificationManager.IMPORTANCE_HIGH,
                ).apply {
                    enableVibration(true)
                    setSound(
                        null,
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                            .build(),
                    )
                }
            manager.createNotificationChannel(alerts)
        }
    }

    fun foregroundNotification(activeAlerts: Int, pendingRepeats: Int): Notification {
        ensureChannels()
        val message =
            if (pendingRepeats > 0) {
                "Monitoreando $activeAlerts alerta(s) • Pendientes $pendingRepeats"
            } else {
                "Monitoreando $activeAlerts alerta(s)"
            }
        return NotificationCompat.Builder(appContext, FOREGROUND_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(appContext.getString(R.string.app_name))
            .setContentText(message)
            .setOngoing(true)
            .setContentIntent(mainPendingIntent())
            .build()
    }

    fun showAlertFired(symbol: String, targetPrice: Double) {
        ensureChannels()
        val notification = NotificationCompat.Builder(appContext, ALERTS_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Alerta: $symbol")
            .setContentText("Se alcanzó $targetPrice")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(mainPendingIntent())
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Apagar alarma",
                stopAlarmPendingIntent(),
            )
            .build()
        manager.notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), notification)
    }

    private fun mainPendingIntent(): PendingIntent {
        val intent = Intent(appContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        return PendingIntent.getActivity(
            appContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun stopAlarmPendingIntent(): PendingIntent {
        val intent = Intent(appContext, PriceMonitorService::class.java).apply {
            action = PriceMonitorService.Actions.StopAlarm
        }
        return PendingIntent.getService(
            appContext,
            1,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    companion object {
        const val FOREGROUND_CHANNEL_ID = "monitor"
        const val ALERTS_CHANNEL_ID = "price_alerts"
    }
}
