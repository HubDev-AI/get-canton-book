// LedgerClient.java
package com.example.license;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.net.URI;
import java.net.http.*;
import java.net.http.HttpResponse.BodyHandlers;
import org.springframework.stereotype.Component;

@Component
public class LedgerClient {
    private final HttpClient http =
        HttpClient.newHttpClient();
    private final ObjectMapper mapper =
        new ObjectMapper();
    private final String baseUrl;

    public LedgerClient(LedgerConfig cfg) {
        this.baseUrl = cfg.apiUrl();
    }

    public JsonNode submitCommand(
        String token,
        String[] actAs,
        Object[] commands,
        String commandId
    ) throws Exception {
        var body = mapper.createObjectNode();
        body.set("commands",
            mapper.valueToTree(commands));
        body.set("actAs",
            mapper.valueToTree(actAs));
        body.put("commandId", commandId);
        body.put("applicationId",
            "license-app");

        var req = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl
                + "/v2/commands/submit-and-wait"))
            .header("Content-Type",
                "application/json")
            .header("Authorization",
                "Bearer " + token)
            .POST(HttpRequest.BodyPublishers
                .ofString(
                    mapper.writeValueAsString(body)
                ))
            .build();

        var resp = http.send(
            req, BodyHandlers.ofString()
        );
        if (resp.statusCode() >= 400) {
            throw new RuntimeException(
                "Ledger error "
                + resp.statusCode()
                + ": " + resp.body()
            );
        }
        return mapper.readTree(resp.body());
    }

    public JsonNode getActiveContracts(
        String token,
        String party,
        String templateId
    ) throws Exception {
        var filter = mapper.createObjectNode();
        var partyFilter = mapper.createObjectNode();
        var cumEntry = mapper.createObjectNode();
        var tplFilter = mapper.createObjectNode();
        tplFilter.put("templateId", templateId);
        cumEntry.set("templateFilters",
            mapper.createArrayNode().add(tplFilter));
        partyFilter.set("cumulative",
            mapper.createArrayNode().add(cumEntry));
        var byParty = mapper.createObjectNode();
        byParty.set(party, partyFilter);
        filter.set("filtersByParty", byParty);
        var body = mapper.createObjectNode();
        body.set("filter", filter);

        var req = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl
                + "/v2/state/active-contracts"))
            .header("Content-Type",
                "application/json")
            .header("Authorization",
                "Bearer " + token)
            .POST(HttpRequest.BodyPublishers
                .ofString(
                    mapper.writeValueAsString(body)
                ))
            .build();

        var resp = http.send(
            req, BodyHandlers.ofString()
        );
        if (resp.statusCode() >= 400) {
            throw new RuntimeException(
                "ACS error "
                + resp.statusCode()
                + ": " + resp.body()
            );
        }
        return mapper.readTree(resp.body());
    }
}
