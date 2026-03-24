// LicenseApplication.java
package com.example.license;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(LedgerConfig.class)
public class LicenseApplication {
    public static void main(String[] args) {
        SpringApplication.run(LicenseApplication.class, args);
    }
}
