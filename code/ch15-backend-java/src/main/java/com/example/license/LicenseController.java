// LicenseController.java
package com.example.license;

import com.fasterxml.jackson.databind.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/licenses")
public class LicenseController {
    private final LicenseService svc;

    public LicenseController(LicenseService svc) {
        this.svc = svc;
    }

    @PostMapping
    public ResponseEntity<?> create(
        @RequestBody JsonNode body,
        @RequestHeader("Authorization") String auth
    ) {
        try {
            var token = auth.replace("Bearer ", "");
            var result = svc.createLicense(
                token,
                body.get("vendor").asText(),
                body.get("customer").asText(),
                body.get("product").asText(),
                body.get("expiresAt").asText()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(java.util.Map.of(
                    "error", e.getMessage()
                ));
        }
    }

    @GetMapping
    public ResponseEntity<?> list(
        @RequestParam String party,
        @RequestHeader("Authorization") String auth
    ) {
        try {
            var token = auth.replace("Bearer ", "");
            var data = svc.listLicenses(token, party);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity
                .status(500)
                .body(java.util.Map.of(
                    "error", e.getMessage()
                ));
        }
    }
}
