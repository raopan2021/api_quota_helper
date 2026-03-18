import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  bool _isDarkMode;
  int _refreshInterval; // 分钟

  ThemeProvider({
    required bool isDarkMode,
    required int refreshInterval,
  })  : _isDarkMode = isDarkMode,
        _refreshInterval = refreshInterval;

  bool get isDarkMode => _isDarkMode;
  int get refreshInterval => _refreshInterval;

  Future<void> setDarkMode(bool value) async {
    _isDarkMode = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('darkMode', value);
    notifyListeners();
  }

  Future<void> setRefreshInterval(int minutes) async {
    _refreshInterval = minutes;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('refreshInterval', minutes);
    notifyListeners();
  }
}
