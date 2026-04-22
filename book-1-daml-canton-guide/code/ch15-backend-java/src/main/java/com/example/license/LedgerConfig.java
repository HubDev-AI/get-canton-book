// LedgerConfig.java
package com.example.license;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ledger")
public record LedgerConfig(
    String apiUrl
) {}
