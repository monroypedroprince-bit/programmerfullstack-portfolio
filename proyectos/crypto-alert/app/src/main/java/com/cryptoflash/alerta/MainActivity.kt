package com.cryptoflash.alerta

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cryptoflash.alerta.ui.AppNav

private val CryptoAlertColorScheme = lightColorScheme(
    primary = Color(0xFFFFC928),
    onPrimary = Color(0xFF171717),
    primaryContainer = Color(0xFFFFE8A3),
    onPrimaryContainer = Color(0xFF171717),
    secondary = Color(0xFF222222),
    onSecondary = Color.White,
    background = Color(0xFFF4F4F1),
    onBackground = Color(0xFF171717),
    surface = Color.White,
    onSurface = Color(0xFF171717),
    surfaceVariant = Color(0xFFEAE9E3),
    onSurfaceVariant = Color(0xFF5B5A54),
    surfaceContainerHigh = Color(0xFFF6F4EC),
    outline = Color(0xFFB8B6AC),
)

class MainActivity : ComponentActivity() {
    private val requestNotifications =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme(colorScheme = CryptoAlertColorScheme) {
                val context = LocalContext.current
                var crashText by remember { mutableStateOf(CrashLog.read(context)) }

                if (crashText != null) {
                    CrashScreen(
                        crashText = crashText.orEmpty(),
                        onClear = {
                            CrashLog.clear(context)
                            crashText = null
                        },
                    )
                } else {
                    val vm: AlertsViewModel = viewModel()
                    LaunchedEffect(Unit) {
                        if (Build.VERSION.SDK_INT >= 33) {
                            requestNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
                        }
                    }
                    AppNav(vm = vm)
                }
            }
        }
    }
}

@Composable
private fun CrashScreen(
    crashText: String,
    onClear: () -> Unit,
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Se detectó un error al abrir la app")
            Column(
                modifier = Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()),
            ) {
                Text(
                    text = crashText,
                    fontFamily = FontFamily.Monospace,
                )
            }
            Button(
                onClick = onClear,
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(vertical = 14.dp),
            ) {
                Text("Borrar log e intentar abrir")
            }
        }
    }
}
