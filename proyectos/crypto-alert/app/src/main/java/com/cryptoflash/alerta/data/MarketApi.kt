package com.cryptoflash.alerta.data

import com.cryptoflash.alerta.model.Exchange
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MarketApi {
    suspend fun fetchPrice(exchange: Exchange, symbol: String): Double? =
        withContext(Dispatchers.IO) {
            runCatching {
                when (exchange) {
                    Exchange.Binance -> fetchBinance(symbol)
                    Exchange.Bybit -> fetchBybit(symbol)
                    Exchange.Okx -> fetchOkx(symbol)
                }
            }.getOrNull()
        }

    private fun fetchBinance(symbol: String): Double? {
        val url = URL("https://api.binance.com/api/v3/ticker/price?symbol=$symbol")
        val body = httpGet(url) ?: return null
        return JSONObject(body).optString("price").toDoubleOrNull()
    }

    private fun fetchBybit(symbol: String): Double? {
        val linear = fetchBybitTick(symbol, category = "linear")?.optString("lastPrice")?.toDoubleOrNull()
        if (linear != null) return linear
        val spot = fetchBybitTick(symbol, category = "spot")?.optString("lastPrice")?.toDoubleOrNull()
        return spot
    }

    private fun fetchBybitTick(symbol: String, category: String): JSONObject? {
        val url = URL("https://api.bybit.com/v5/market/tickers?category=$category&symbol=$symbol")
        val body = httpGet(url) ?: return null
        val root = JSONObject(body)
        if (root.optInt("retCode", -1) != 0) return null
        val result = root.optJSONObject("result") ?: return null
        val list = result.optJSONArray("list") ?: JSONArray()
        if (list.length() == 0) return null
        return list.optJSONObject(0)
    }

    private fun fetchOkx(symbol: String): Double? {
        val instId = toOkxInstId(symbol)
        val url = URL("https://www.okx.com/api/v5/market/ticker?instId=$instId")
        val body = httpGet(url) ?: return null
        val root = JSONObject(body)
        if (root.optString("code") != "0") return null
        val data = root.optJSONArray("data") ?: JSONArray()
        if (data.length() == 0) return null
        val first = data.optJSONObject(0) ?: return null
        return first.optString("last").toDoubleOrNull()
    }

    private fun toOkxInstId(symbol: String): String {
        val upper = symbol.trim().uppercase()
        return if (upper.endsWith("USDT") && upper.length > 4) {
            val base = upper.substring(0, upper.length - 4)
            "$base-USDT"
        } else {
            upper
        }
    }

    private fun httpGet(url: URL): String? {
        return runCatching {
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 7_000
                readTimeout = 7_000
                setRequestProperty("User-Agent", "CriptoFlash/1.0")
            }
            try {
                val code = connection.responseCode
                val stream = if (code in 200..299) connection.inputStream else connection.errorStream
                val body = stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
                if (code in 200..299) body else null
            } finally {
                connection.disconnect()
            }
        }.getOrNull()
    }
}
