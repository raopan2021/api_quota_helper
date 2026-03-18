# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /opt/android-sdk/tools/proguard/proguard-android.txt

# Keep Kotlin serialization
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
