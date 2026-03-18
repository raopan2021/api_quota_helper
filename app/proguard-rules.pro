# API Quota Helper ProGuard Rules

# Kotlin 序列化
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}

-keep,includedescriptorclasses class com.apiapp.api_quota_helper.**$$serializer { *; }
-keepclassmembers class com.apiapp.api_quota_helper.** {
    *** Companion;
}
-keepclasseswithmembers class com.apiapp.api_quota_helper.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Ktor
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**
-dontwarn kotlinx.coroutines.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn org.conscrypt.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# SLF4J (from Ktor)
-dontwarn org.slf4j.**
-keep class org.slf4j.** { *; }

# AndroidX
-keep class androidx.** { *; }
-dontwarn androidx.**

# Compose
-dontwarn androidx.compose.**
-keep class androidx.compose.** { *; }
