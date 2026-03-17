import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'providers/account_provider.dart';
import 'pages/home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 加载主题设置
  final prefs = await SharedPreferences.getInstance();
  final isDarkMode = prefs.getBool('darkMode') ?? false;
  
  runApp(QuotaApp(isDarkMode: isDarkMode));
}

class QuotaApp extends StatelessWidget {
  final bool isDarkMode;
  
  const QuotaApp({super.key, required this.isDarkMode});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AccountProvider(),
      child: MaterialApp(
        title: 'API 额度查询',
        debugShowCheckedModeBanner: false,
        // 亮色主题
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        // 暗黑主题
        darkTheme: ThemeData(
          brightness: Brightness.dark,
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.blue,
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
        ),
        // 根据设置切换主题
        themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
        home: const HomePage(),
      ),
    );
  }
}
