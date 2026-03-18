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

# 数据模型
-keep class com.apiapp.api_quota_helper.data.model.** { *; }

# AndroidX
-dontwarn androidx.**
-keep class androidx.** { *; }

# Compose
-allowaccessmodification
-repackageclasses

# 移除日志
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# 移除调试信息
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
