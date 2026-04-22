// src/api/eventStream.js -- SSE event streaming (from book Chapter 17)
//
// Subscribe to real-time ledger updates via the JSON Ledger API's
// Server-Sent Events stream.

export function subscribeToEvents(
  token, party, templateId, onEvent
) {
  const url =
    "http://localhost:3975/v2/updates/flats";
  const body = JSON.stringify({
    filter: {
      filtersByParty: {
        [party]: {
          cumulative: [{
            templateFilters: [{ templateId }],
          }],
        },
      },
    },
    beginExclusive: 0,
  });

  // Use fetch with streaming response
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body,
  }).then(async (resp) => {
    const reader = resp.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } =
        await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      // Parse SSE events
      for (const line of text.split("\n")) {
        if (line.startsWith("data:")) {
          const data =
            JSON.parse(line.slice(5));
          onEvent(data);
        }
      }
    }
  });
}
