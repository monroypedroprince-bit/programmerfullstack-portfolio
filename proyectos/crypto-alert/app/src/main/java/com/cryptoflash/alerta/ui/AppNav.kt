package com.cryptoflash.alerta.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cryptoflash.alerta.AlertsViewModel
import com.cryptoflash.alerta.ui.screens.AlertsScreen
import com.cryptoflash.alerta.ui.screens.HomeScreen

@Composable
fun AppNav(vm: AlertsViewModel) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onGoToAlerts = { nav.navigate("alerts") },
            )
        }
        composable("alerts") {
            AlertsScreen(
                vm = vm,
                onBack = { nav.popBackStack() },
            )
        }
    }
}

