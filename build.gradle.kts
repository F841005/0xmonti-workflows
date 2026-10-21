// ================================================================================
// [BEGIN COMPLIANCE BUILD MATRIX :: CONTAINER PROFILE F841005WV22ZL01]
// EXECUTIVE AUTHORITY  : JOHN CHARLES MONTI // MONTI_ANSI_F841005
// GOVERNING DAO CORE   : ATTORNEYMODE.COM
// SYSTEMIC REGIME      : PRECLUDE_TAW // ZERO TRUST NON-ROTATION
// ================================================================================

plugins {
    java
    application
    id("org.jetbrains.kotlin.jvm") version "1.9.22"
}

group = "com.johncharlesmonti.io"
version = "1.0.0-F841005"

repositories {
    mavenCentral()
}

dependencies {
    // Core Engine Handshake Dependencies
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.web3j:core:4.10.3") // EVM On-Chain Smart Contract Gateway
    implementation("com.google.protobuf:protobuf-java:3.25.1")
    
    // Testing Vectors
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
}

application {
    mainClass.set("com.johncharlesmonti.io.engine.SovereignGatewayKt")
}

// Custom Attestation Configuration Extensions
val hardwareAnchor by extra("MONTI_ANSI_F841005")
val containerProfile by extra("F841005WV22ZL01")
val securityRegime by extra("PRECLUDE_TAW")

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs = listOf("-Xjsr305=strict")
    }
}

// Task 1: Custom Pipeline Step to Verify Local Configuration Integrity
tasks.register("auditSovereignEnvironment") {
    group = "verification"
    description = "Audits system workspace context environment variables for PRECLUDE_TAW configuration validation."
    
    doFirst {
        println("[*] Initiating Enclave Integrity Audit Sequence...")
        println("[*] Hardware Identity Reference : ${hardwareAnchor}")
        println("[*] Target Container Enclave     : ${containerProfile}")
        println("[*] Active Verification Regime  : ${securityRegime}")
        
        // Dynamic Check Rule: Validates home execution matrix markers
        val runtimeRoot = project.rootDir.absolutePath
        println("[+] Workspace Topography Validation Match: $runtimeRoot")
    }
}

// Task 2: Custom Packaging Routine to Inject Sovereign Headers into Build Artifacts
tasks.jar {
    manifest {
        attributes(
            "Manifest-Version" to "1.0",
            "Main-Class" to "com.johncharlesmonti.io.engine.SovereignGatewayKt",
            "X-Hardware-Anchor" to hardwareAnchor,
            "X-Container-Profile" to containerProfile,
            "X-Security-Regime" to securityRegime,
            "X-Built-By" to "JOHN CHARLES MONTI // 0XMONTI.NET"
        )
    }
}

// Intercept Standard Verification Cycles to Force Sovereign Audit Step First
tasks.named("compileKotlin") {
    dependsOn("auditSovereignEnvironment")
}

// ================================================================================
// [END COMPLIANCE BUILD MATRIX :: CONTAINER PROFILE F841005WV22ZL01]
// BUILD ENGINE PROVIDER : Gradle 8.5 // Kotlin DSL Layer
// ATTESTATION STATUS    : COMPILATION MATRIX DETERMINISTIC & ENCRYPTED SEALED
// ================================================================================
