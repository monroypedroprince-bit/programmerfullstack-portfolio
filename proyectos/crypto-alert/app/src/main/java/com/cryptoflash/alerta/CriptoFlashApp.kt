package com.cryptoflash.alerta

import android.app.Application
import android.content.Context
import android.util.Log
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter

class CriptoFlashApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Thread.setDefaultUncaughtExceptionHandler { t, e ->
            val text = CrashLog.format(t, e)
            CrashLog.write(applicationContext, text)
            Log.e("CriptoFlash", text)
        }
    }
}

object CrashLog {
    private const val FileName = "crash.log"

    fun read(context: Context): String? {
        val file = File(context.filesDir, FileName)
        if (!file.exists()) return null
        return runCatching { file.readText() }.getOrNull()?.takeIf { it.isNotBlank() }
    }

    fun write(context: Context, text: String) {
        val file = File(context.filesDir, FileName)
        runCatching { file.writeText(text) }
    }

    fun clear(context: Context) {
        val file = File(context.filesDir, FileName)
        runCatching { if (file.exists()) file.delete() }
    }

    fun format(thread: Thread, e: Throwable): String {
        val sw = StringWriter()
        e.printStackTrace(PrintWriter(sw))
        val ts = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.US).format(java.util.Date())
        return buildString {
            appendLine("CrashLog $ts")
            appendLine("Thread: ${thread.name}")
            appendLine("${e::class.java.name}: ${e.message}")
            appendLine(sw.toString())
        }
    }
}
