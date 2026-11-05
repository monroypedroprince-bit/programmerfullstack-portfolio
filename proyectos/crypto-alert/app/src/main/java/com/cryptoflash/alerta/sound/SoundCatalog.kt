package com.cryptoflash.alerta.sound

import com.cryptoflash.alerta.R

object SoundCatalog {
    const val SystemAlarmKey = "system:alarm"
    const val SystemNotificationKey = "system:notification"

    fun allOptions(): List<SoundOption> {
        val base = listOf(
            SoundOption(SystemAlarmKey, "Alarma del sistema", null),
            SoundOption(SystemNotificationKey, "Notificación del sistema", null),
        )

        val raw = runCatching {
            R.raw::class.java.fields
                .mapNotNull { field ->
                    val id = runCatching { field.getInt(null) }.getOrNull() ?: return@mapNotNull null
                    val name = field.name
                    SoundOption("raw:$name", name.replace('_', ' '), id)
                }
                .sortedBy { it.label.lowercase() }
        }.getOrElse { emptyList() }

        return base + raw
    }

    fun findByKey(key: String): SoundOption =
        allOptions().firstOrNull { it.key == key } ?: SoundOption(SystemAlarmKey, "Alarma del sistema", null)
}
