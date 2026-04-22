// LicenseService.java
package com.example.license;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class LicenseService {
    private static final String TEMPLATE =
        "Main.License:License";
    private final LedgerClient ledger;
    private final ObjectMapper mapper =
        new ObjectMapper();

    public LicenseService(LedgerClient ledger) {
        this.ledger = ledger;
    }

    public JsonNode createLicense(
        String token,
        String vendor,
        String customer,
        String product,
        String expiresAt
    ) throws Exception {
        var args = mapper.createObjectNode();
        args.put("vendor", vendor);
        args.put("customer", customer);
        args.put("product", product);
        args.put("issuedAt",
            java.time.Instant.now().toString());
        args.put("expiresAt", expiresAt);

        var cmd = mapper.createObjectNode();
        var create = mapper.createObjectNode();
        create.put("templateId", TEMPLATE);
        create.set("createArguments", args);
        cmd.set("CreateCommand", create);

        return ledger.submitCommand(
            token,
            new String[]{ vendor },
            new ObjectNode[]{ cmd },
            "create-license-" + UUID.randomUUID()
        );
    }

    public JsonNode renewLicense(
        String token,
        String vendor,
        String contractId,
        String newExpiry
    ) throws Exception {
        var cmd = mapper.createObjectNode();
        var exercise = mapper.createObjectNode();
        exercise.put("templateId", TEMPLATE);
        exercise.put("contractId", contractId);
        exercise.put("choice", "Renew");
        var choiceArg = mapper.createObjectNode();
        choiceArg.put("newExpiry", newExpiry);
        exercise.set("choiceArgument", choiceArg);
        cmd.set("ExerciseCommand", exercise);

        return ledger.submitCommand(
            token,
            new String[]{ vendor },
            new ObjectNode[]{ cmd },
            "renew-license-" + UUID.randomUUID()
        );
    }

    public JsonNode listLicenses(
        String token, String party
    ) throws Exception {
        return ledger.getActiveContracts(
            token, party, TEMPLATE
        );
    }
}
