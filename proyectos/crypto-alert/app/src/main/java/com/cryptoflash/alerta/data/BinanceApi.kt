package com.cryptoflash.alerta.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class BinanceApi {
    suspend fun fetchPrice(symbol: String): Double? = withContext(Dispatchers.IO) {
        val url = URL("https://api.binance.com/api/v3/ticker/price?symbol=$symbol")
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 7_000
            readTimeout = 7_000
        }

        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            if (code !in 200..299) return@withContext null
            val json = JSONObject(body)
            json.optString("price").toDoubleOrNull()
        } finally {
            connection.disconnect()
        }
    }
}

