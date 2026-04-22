// Minimal JSON Ledger API v2 client.
// Each participant has its own HTTP endpoint on a known port.
// We build one client per party and route calls appropriately.

const DEFAULT_USER = 'ledger-api-user';

export class LedgerClient {
  constructor({ host = 'localhost', port, party, userId = DEFAULT_USER }) {
    this.baseUrl = `http://${host}:${port}`;
    this.party = party;
    this.userId = userId;
  }

  async _post(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new Error(
        `Ledger ${path} returned ${res.status}: ${text}`,
      );
    }
    return parsed;
  }

  async _get(path) {
    const res = await fetch(`${this.baseUrl}${path}`);
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new Error(
        `Ledger ${path} returned ${res.status}: ${text}`,
      );
    }
    return parsed;
  }

  async listParties() {
    return this._get('/v2/parties');
  }

  async allocateParty(partyIdHint) {
    return this._post('/v2/parties', { partyIdHint });
  }

  async submitCommand(commandId, actAs, commands) {
    return this._post(
      '/v2/commands/submit-and-wait-for-transaction-tree',
      { commands, commandId, actAs, userId: this.userId },
    );
  }

  async create(templateId, args, commandId) {
    const result = await this.submitCommand(
      commandId,
      [this.party],
      [{ CreateCommand: { templateId, createArguments: args } }],
    );
    // Find the first Created event.
    const events = Object.values(
      result.transactionTree?.eventsById ?? {},
    );
    const created = events.find((e) => e.CreatedTreeEvent);
    return created?.CreatedTreeEvent?.value;
  }

  async exercise(templateId, contractId, choice, choiceArg, commandId, actAs) {
    const result = await this.submitCommand(
      commandId,
      actAs ?? [this.party],
      [
        {
          ExerciseCommand: {
            templateId,
            contractId,
            choice,
            choiceArgument: choiceArg,
          },
        },
      ],
    );
    return result.transactionTree;
  }

  async activeContracts(templateId, { limit = 100 } = {}) {
    // Query current ledger end, then pull the ACS at that offset.
    const end = await this._get('/v2/state/ledger-end');
    return this._post(
      `/v2/state/active-contracts?limit=${limit}`,
      {
        filter: {
          filtersByParty: {
            [this.party]: {
              cumulative: [
                {
                  identifierFilter: {
                    TemplateFilter: {
                      value: {
                        templateId,
                        includeCreatedEventBlob: false,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        verbose: false,
        activeAtOffset: end.offset,
      },
    );
  }
}
