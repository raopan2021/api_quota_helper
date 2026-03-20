plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.apiapp.api_quota_helper"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.apiapp.api_quota_helper"
        minSdk = 26
        targetSdk = 35
        // versionName为唯一数据源，versionCode自动计算（语义化版本：major*10000 + minor*100 + patch）
        val ver = "1.1.4"
        val parts = ver.split(".")
        versionCode = parts[0].toInt() * 10000 + parts[1].toInt() * 100 + parts[2].toInt()
        versionName = ver

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // 只打包 arm64-v8a，减小体积
        ndk {
            abiFilters += listOf("arm64-v8a")
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file("api_quota_helper.jks")
            storePassword = System.getenv("KEY_STORE_PASSWORD") ?: "android"
            keyAlias = System.getenv("KEY_ALIAS") ?: "api_quota_helper"
            keyPassword = System.getenv("KEY_PASSWORD") ?: "android"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // 使用签名配置（如果没有 keystore 会跳过）
            if (file("api_quota_helper.jks").exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
        debug {
            isDebuggable = true
            isMinifyEnabled = true
            isShrinkResources = true
            applicationIdSuffix = ".debug"
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    // APK 输出文件名：api-quota-helper-vX.X.XX.apk
    applicationVariants.configureEach {
        outputs.all {
            val variantOutput = this as com.android.build.gradle.internal.api.BaseVariantOutputImpl
            variantOutput.outputFileName = "api-quota-helper-${versionName}.apk"
        }
    }
}

dependencies {
    // Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
    implementation(composeBom)

    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.animation:animation")

    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // HTTP - 使用系统自带 HttpURLConnection

    // Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")

    // Debug
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
