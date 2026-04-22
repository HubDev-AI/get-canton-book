import { useEffect, useState } from 'react';
import { api } from './api.js';

const ROLES = ['supplier', 'buyer', 'factor'];

function extractInvoice(entry) {
  const created = entry?.contractEntry?.JsActiveContract?.createdEvent;
  if (!created) return null;
  const arg = created.createArgument ?? {};
  return {
    contractId: created.contractId,
    invoiceNumber: arg.invoiceNumber,
    amount: arg.amount,
    currency: arg.currency,
    status: arg.status,
    supplier: arg.supplier,
    buyer: arg.buyer,
    dueDate: arg.dueDate,
  };
}

function InvoiceRow({ inv, role, onConfirm, onPay }) {
  return (
    <tr>
      <td>{inv.invoiceNumber}</td>
      <td>{inv.amount} {inv.currency}</td>
      <td>{inv.status}</td>
      <td>
        {role === 'buyer' && inv.status === 'Draft' && (
          <button onClick={() => onConfirm(inv.contractId)}>
            Confirm
          </button>
        )}
        {role === 'buyer' && inv.status === 'Confirmed' && (
          <button onClick={() => onPay(inv.contractId)}>
            Pay
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateForm({ onCreated }) {
  const [form, setForm] = useState({
    invoiceNumber: 'INV-',
    amount: '1000.00',
    currency: 'USD',
    dueDate: '2027-06-30T00:00:00Z',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.createInvoice(form);
      setForm((f) => ({ ...f, invoiceNumber: 'INV-' }));
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 4, maxWidth: 300 }}>
      <label>
        Invoice number{' '}
        <input value={form.invoiceNumber}
               onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
      </label>
      <label>
        Amount{' '}
        <input value={form.amount}
               onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      </label>
      <label>
        Currency{' '}
        <input value={form.currency} maxLength={3}
               onChange={(e) => setForm({ ...form, currency: e.target.value })} />
      </label>
      <label>
        Due date{' '}
        <input value={form.dueDate}
               onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </label>
      <button disabled={busy} type="submit">
        {busy ? 'Creating...' : 'Create invoice'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default function App() {
  const [role, setRole] = useState('supplier');
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);

  async function refresh() {
    try {
      const data = await api.listInvoices(role);
      setInvoices(
        (Array.isArray(data) ? data : [])
          .map(extractInvoice)
          .filter(Boolean),
      );
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [role]);

  async function onConfirm(cid) {
    await api.confirmInvoice(cid);
    refresh();
  }
  async function onPay(cid) {
    await api.payInvoice(cid);
    refresh();
  }

  return (
    <main style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 960 }}>
      <h1>Invoice Factoring</h1>
      <nav style={{ marginBottom: 16 }}>
        View as:{' '}
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              marginRight: 4,
              fontWeight: role === r ? 'bold' : 'normal',
            }}>
            {r}
          </button>
        ))}
      </nav>

      {role === 'supplier' && (
        <section>
          <h2>Create invoice</h2>
          <CreateForm onCreated={refresh} />
        </section>
      )}

      <section>
        <h2>Invoices visible to {role}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table cellPadding={6}>
          <thead>
            <tr>
              <th align="left">Number</th>
              <th align="left">Amount</th>
              <th align="left">Status</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={4}><em>No invoices</em></td></tr>
            )}
            {invoices.map((inv) => (
              <InvoiceRow
                key={inv.contractId}
                inv={inv} role={role}
                onConfirm={onConfirm} onPay={onPay}
              />
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
