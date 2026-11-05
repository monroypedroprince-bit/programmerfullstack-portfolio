package com.cryptoflash.alerta.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.shape.CircleShape
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.cryptoflash.alerta.AlertsViewModel
import com.cryptoflash.alerta.model.Exchange
import com.cryptoflash.alerta.model.PriceAlert
import com.cryptoflash.alerta.model.RepeatMode
import com.cryptoflash.alerta.R
import com.cryptoflash.alerta.sound.SoundCatalog
import com.cryptoflash.alerta.sound.SoundPlayer
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsScreen(
    vm: AlertsViewModel,
    onBack: () -> Unit,
) {
    val alerts by vm.alerts.collectAsStateWithLifecycle()
    val currentPrice by vm.price.collectAsStateWithLifecycle()
    val selectedExchange by vm.selectedExchange.collectAsStateWithLifecycle()

    val symbols = remember { listOf("BTCUSDT", "ETHUSDT", "BNBUSDT") }
    val sounds = remember { SoundCatalog.allOptions() }
    val context = LocalContext.current
    val soundPlayer = remember(context.applicationContext) { SoundPlayer(context.applicationContext) }
    val scope = rememberCoroutineScope()

    var selectedSymbol by rememberSaveable { mutableStateOf(symbols.first()) }
    var priceText by rememberSaveable { mutableStateOf("") }
    var selectedRepeatMode by rememberSaveable { mutableStateOf(RepeatMode.Once) }
    var selectedSoundKey by rememberSaveable { mutableStateOf(SoundCatalog.SystemAlarmKey) }

    LaunchedEffect(selectedSymbol) {
        vm.setSelectedSymbol(selectedSymbol)
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Image(
                        painter = painterResource(id = R.drawable.ic_launcher_foreground_image),
                        contentDescription = null,
                        modifier = Modifier.size(50.dp),
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás")
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                CurrentPriceCard(symbol = selectedSymbol, price = currentPrice, exchange = selectedExchange)
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Nueva alerta", style = MaterialTheme.typography.titleMedium)

                        ExchangeDropdown(
                            selected = selectedExchange,
                            onSelected = { vm.setSelectedExchange(it) },
                        )

                        SymbolDropdown(
                            symbols = symbols,
                            selected = selectedSymbol,
                            onSelected = { selectedSymbol = it },
                        )

                        OutlinedTextField(
                            value = priceText,
                            onValueChange = { priceText = it.replace(',', '.') },
                            label = { Text("Precio objetivo") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                        )

                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                            RepeatModeDropdown(
                                selected = selectedRepeatMode,
                                onSelected = { selectedRepeatMode = it },
                                modifier = Modifier.weight(1f),
                            )

                            SoundDropdown(
                                sounds = sounds,
                                selectedKey = selectedSoundKey,
                                onSelectedKey = {
                                    selectedSoundKey = it
                                    scope.launch { soundPlayer.playPreview(it) }
                                },
                                modifier = Modifier.weight(1f),
                            )
                        }

                        val parsedPrice = priceText.toDoubleOrNull()
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End,
                        ) {
                            TextButton(onClick = { scope.launch { soundPlayer.playPreview(selectedSoundKey) } }) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.padding(end = 6.dp))
                                Text("Probar sonido")
                            }
                        }

                        Button(
                            onClick = {
                                val price = parsedPrice ?: return@Button
                                vm.addAlert(
                                    symbol = selectedSymbol,
                                    targetPrice = price,
                                    repeatMode = selectedRepeatMode,
                                    soundKey = selectedSoundKey,
                                )
                                priceText = ""
                                selectedRepeatMode = RepeatMode.Once
                            },
                            enabled = parsedPrice != null,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Activar alerta")
                        }
                    }
                }
            }

            item {
                Text("Alertas programadas", style = MaterialTheme.typography.titleMedium)
            }

            if (alerts.isEmpty()) {
                item {
                    Text("Todavía no tienes alertas.", style = MaterialTheme.typography.bodyMedium)
                }
            } else {
                items(alerts, key = { it.id }) { alert ->
                    AlertRow(
                        alert = alert,
                        onDelete = { vm.deleteAlert(alert.id) },
                        onToggleActive = { vm.setAlertActive(alert.id, it) },
                    )
                }
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }
}

@Composable
private fun CurrentPriceCard(symbol: String, price: Double?, exchange: Exchange) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                val ex = remember(exchange) { exchangeMeta(exchange) }
                BadgeIcon(label = ex.shortLabel, background = ex.color, size = 18.dp)
                Text(
                    "Precios actuales • ${ex.name}",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(start = 10.dp),
                )
            }
            PriceChip(meta = cryptoMeta(symbol), price = price, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
private fun PriceChip(meta: CryptoMeta, price: Double?, modifier: Modifier = Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier,
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            BadgeIcon(
                label = meta.ticker,
                background = meta.color,
                size = 26.dp,
            )
            Text(
                meta.name,
                style = MaterialTheme.typography.labelMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
            )
            Text(
                text = price?.let { "%.4f".format(it) } ?: "—",
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
            )
        }
    }
}

@Composable
private fun SymbolDropdown(
    symbols: List<String>,
    selected: String,
    onSelected: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedMeta = remember(selected) { cryptoMeta(selected) }
    Box(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = "${selectedMeta.name} (${selectedMeta.ticker})",
            onValueChange = {},
            readOnly = true,
            label = { Text("Cripto") },
            leadingIcon = {
                BadgeIcon(
                    label = selectedMeta.ticker,
                    background = selectedMeta.color,
                    size = 22.dp,
                )
            },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Box(
            modifier =
                Modifier
                    .matchParentSize()
                    .clickable { expanded = true },
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            symbols.forEach { symbol ->
                val meta = cryptoMeta(symbol)
                DropdownMenuItem(
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            BadgeIcon(
                                label = meta.ticker,
                                background = meta.color,
                                size = 22.dp,
                            )
                            Column(modifier = Modifier.padding(start = 10.dp)) {
                                Text(meta.name, style = MaterialTheme.typography.bodyMedium)
                                Text(meta.ticker, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    },
                    onClick = {
                        onSelected(symbol)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
private fun ExchangeDropdown(
    selected: Exchange,
    onSelected: (Exchange) -> Unit,
) {
    val options = remember { listOf(Exchange.Binance, Exchange.Bybit, Exchange.Okx) }
    var expanded by remember { mutableStateOf(false) }
    val selectedMeta = remember(selected) { exchangeMeta(selected) }
    Box(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = selectedMeta.name,
            onValueChange = {},
            readOnly = true,
            label = { Text("Exchange") },
            leadingIcon = { BadgeIcon(label = selectedMeta.shortLabel, background = selectedMeta.color, size = 22.dp) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Box(
            modifier =
                Modifier
                    .matchParentSize()
                    .clickable { expanded = true },
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { option ->
                val meta = exchangeMeta(option)
                DropdownMenuItem(
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            BadgeIcon(label = meta.shortLabel, background = meta.color, size = 22.dp)
                            Text(meta.name, modifier = Modifier.padding(start = 10.dp))
                        }
                    },
                    onClick = {
                        onSelected(option)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
private fun RepeatModeDropdown(
    selected: RepeatMode,
    onSelected: (RepeatMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    val options = remember { listOf(RepeatMode.Once, RepeatMode.TwiceAfter1Min) }
    var expanded by remember { mutableStateOf(false) }
    Box(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = repeatModeLabel(selected),
            onValueChange = {},
            readOnly = true,
            label = { Text("Repetición") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Box(
            modifier =
                Modifier
                    .matchParentSize()
                    .clickable { expanded = true },
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(repeatModeLabel(option)) },
                    onClick = {
                        onSelected(option)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
private fun SoundDropdown(
    sounds: List<com.cryptoflash.alerta.sound.SoundOption>,
    selectedKey: String,
    onSelectedKey: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var expanded by remember { mutableStateOf(false) }
    val selected = sounds.firstOrNull { it.key == selectedKey } ?: sounds.first()

    Box(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = selected.label,
            onValueChange = {},
            readOnly = true,
            label = { Text("Sonido") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Box(
            modifier =
                Modifier
                    .matchParentSize()
                    .clickable { expanded = true },
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            sounds.forEach { sound ->
                DropdownMenuItem(
                    text = { Text(sound.label) },
                    onClick = {
                        onSelectedKey(sound.key)
                        expanded = false
                    },
                )
            }
        }
    }
}

private data class CryptoMeta(
    val symbol: String,
    val ticker: String,
    val name: String,
    val color: Color,
)

private data class ExchangeMeta(
    val exchange: Exchange,
    val shortLabel: String,
    val name: String,
    val color: Color,
)

private fun cryptoMeta(symbol: String): CryptoMeta {
    val upper = symbol.uppercase()
    return when (upper) {
        "BTCUSDT" -> CryptoMeta(symbol = upper, ticker = "BTC", name = "Bitcoin", color = Color(0xFFF7931A))
        "ETHUSDT" -> CryptoMeta(symbol = upper, ticker = "ETH", name = "Ethereum", color = Color(0xFF627EEA))
        "BNBUSDT" -> CryptoMeta(symbol = upper, ticker = "BNB", name = "BNB", color = Color(0xFFF3BA2F))
        else -> CryptoMeta(symbol = upper, ticker = upper.take(4), name = upper, color = Color(0xFF546E7A))
    }
}

private fun exchangeMeta(exchange: Exchange): ExchangeMeta =
    when (exchange) {
        Exchange.Binance -> ExchangeMeta(exchange, shortLabel = "BN", name = "Binance", color = Color(0xFFF3BA2F))
        Exchange.Bybit -> ExchangeMeta(exchange, shortLabel = "BY", name = "Bybit", color = Color(0xFFF7A600))
        Exchange.Okx -> ExchangeMeta(exchange, shortLabel = "OK", name = "OKX", color = Color(0xFF111111))
    }

@Composable
private fun BadgeIcon(
    label: String,
    background: Color,
    size: androidx.compose.ui.unit.Dp,
) {
    Box(
        modifier = Modifier.size(size).clip(CircleShape).background(background),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            color = Color.White,
            fontSize = (size.value * 0.38f).sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

private fun repeatModeLabel(mode: RepeatMode): String =
    when (mode) {
        RepeatMode.Once -> "Una vez"
        RepeatMode.TwiceAfter1Min -> "Una vez más en 1 minuto"
    }

@Composable
private fun AlertRow(
    alert: PriceAlert,
    onDelete: () -> Unit,
    onToggleActive: (Boolean) -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.weight(1f)) {
                    val meta = remember(alert.symbol) { cryptoMeta(alert.symbol) }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        BadgeIcon(label = meta.ticker, background = meta.color, size = 22.dp)
                        Text(
                            meta.name,
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.padding(start = 10.dp),
                        )
                        Spacer(modifier = Modifier.weight(1f))
                        Switch(
                            checked = alert.isActive && !alert.isFired,
                            onCheckedChange = onToggleActive,
                        )
                    }
                    Text(
                        "Objetivo: ${alert.targetPrice} • ${exchangeMeta(alert.exchange).name} • ${repeatModeLabel(alert.repeatMode)}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }

                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Eliminar")
                }
            }

            Text(
                text = if (alert.isFired) "Estado: sonó" else if (alert.isActive) "Estado: activa" else "Estado: desactivada",
                style = MaterialTheme.typography.bodyMedium,
            )

            if (alert.isFired) {
                TextButton(onClick = { onToggleActive(true) }, modifier = Modifier.align(Alignment.End)) {
                    Text("Reactivar")
                }
            }
        }
    }
}
