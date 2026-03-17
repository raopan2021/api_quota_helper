# Flutter specific
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep home_widget
-keep class es.antonborri.home_widget.** { *; }

# Keep model classes
-keep class com.apiapp.api_quota_helper.** { *; }

# Dio
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Remove logging
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Google Play Core (required for Flutter)
-keep class com.google.android.play.core.** { *; }
-dontwarn com.google.android.play.core.**
