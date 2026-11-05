package com.cryptoflash.alerta.sound

import android.content.Context
import android.media.MediaPlayer
import android.media.Ringtone
import android.media.RingtoneManager
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class SoundPlayer(
    private val appContext: Context,
) {
    private var currentPlayer: MediaPlayer? = null
    private var currentRingtone: Ringtone? = null

    suspend fun playOnce(soundKey: String) {
        val option = SoundCatalog.findByKey(soundKey)
        if (option.rawResId != null) {
            playRawOnce(option.rawResId)
        } else {
            playSystemRingtoneOnce(soundKey, millis = 2_500)
        }
    }

    suspend fun playPreview(soundKey: String) {
        val option = SoundCatalog.findByKey(soundKey)
        if (option.rawResId != null) {
            playRawPreview(option.rawResId, millis = 2_500)
        } else {
            playSystemRingtoneOnce(soundKey, millis = 1_500)
        }
    }

    suspend fun stop() = withContext(Dispatchers.Main) { stopAll() }

    private suspend fun playRawOnce(rawResId: Int) = withContext(Dispatchers.Main) {
        stopAll()
        suspendCancellableCoroutine { cont ->
            val player = MediaPlayer.create(appContext, rawResId)
            if (player == null) {
                cont.resume(Unit)
                return@suspendCancellableCoroutine
            }
            currentPlayer = player
            wireCompletion(player, cont)
            player.start()
        }
    }

    private suspend fun playRawPreview(rawResId: Int, millis: Long) = withContext(Dispatchers.Main) {
        stopAll()
        val player = MediaPlayer.create(appContext, rawResId) ?: return@withContext
        currentPlayer = player
        try {
            player.start()
            delay(millis)
        } finally {
            runCatching { player.stop() }
            player.release()
            if (currentPlayer === player) currentPlayer = null
        }
    }

    private suspend fun playSystemRingtoneOnce(soundKey: String, millis: Long) = withContext(Dispatchers.Main) {
        stopAll()
        val uri =
            when (soundKey) {
                SoundCatalog.SystemNotificationKey -> RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                else -> RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            }
        val ringtone = RingtoneManager.getRingtone(appContext, uri) ?: return@withContext
        currentRingtone = ringtone
        ringtone.play()
        delay(millis)
        runCatching { ringtone.stop() }
        if (currentRingtone === ringtone) currentRingtone = null
    }

    private fun stopAll() {
        currentRingtone?.let { runCatching { it.stop() } }
        currentRingtone = null

        currentPlayer?.let { p ->
            runCatching { if (p.isPlaying) p.stop() }
            runCatching { p.release() }
        }
        currentPlayer = null
    }

    private fun wireCompletion(player: MediaPlayer, cont: CancellableContinuation<Unit>) {
        fun finish() {
            if (cont.isActive) cont.resume(Unit)
        }
        player.setOnCompletionListener {
            it.release()
            if (currentPlayer === it) currentPlayer = null
            finish()
        }
        player.setOnErrorListener { mp, _, _ ->
            mp.release()
            if (currentPlayer === mp) currentPlayer = null
            finish()
            true
        }
        cont.invokeOnCancellation {
            runCatching { player.release() }
            if (currentPlayer === player) currentPlayer = null
        }
    }
}
