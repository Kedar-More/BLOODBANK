import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialDonor = { full_name: "", blood_group: "O+", phone_number: "", email: "" };
const initialRequest = {
  recipient_id: "",
  bank_id: "",
  blood_group: "O+",
  units_required: "1",
  request_date: "",
  priority: "Normal",
  status: "Pending",
  notes: "",
};

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [banks, setBanks] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [inventoryFilter, setInventoryFilter] = useState("");

  const [donorForm, setDonorForm] = useState(initialDonor);
  const [requestForm, setRequestForm] = useState(initialRequest);

  async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: "Unexpected server response" };
    if (!response.ok) {
      throw new Error(body.message || "Request failed");
    }
    return body;
  }

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, bankRows, recipientRows, inventoryRows] = await Promise.all([
        request("/dashboard"),
        request("/bloodbanks"),
        request("/recipients"),
        request("/inventory"),
      ]);

      setDashboard(dash);
      setBanks(bankRows);
      setRecipients(recipientRows);
      setInventory(inventoryRows);
      setMessage({ type: "", text: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAll();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAll]);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    return () => document.body.classList.remove("dark");
  }, [darkMode]);

  async function createRecord(endpoint, payload, resetForm) {
    try {
      await request(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      resetForm();
      await loadAll();
      setMessage({ type: "success", text: "Saved successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  const filteredInventory = useMemo(() => {
    if (!inventoryFilter) return inventory;
    return inventory.filter((item) => item.blood_group === inventoryFilter);
  }, [inventory, inventoryFilter]);

  const unitsTotal = useMemo(
    () => inventory.reduce((sum, row) => sum + Number(row.units_available || 0), 0),
    [inventory]
  );

  const canRequest = recipients.length > 0 && banks.length > 0;

  return (
    <>
      <a href="#home" className="skip-link">
        Skip to content
      </a>
      <header className="navbar">
        <div className="brand">
          <span className="logo" aria-hidden="true">
            ❤
          </span>
          <strong>BloodCare</strong>
        </div>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#donate">Donate</a>
          <a href="#request">Request Blood</a>
          <a href="#contact">Contact</a>
        </nav>
        <button type="button" className="ghost-btn" onClick={() => setDarkMode((v) => !v)}>
          {darkMode ? "Light" : "Dark"} Mode
        </button>
      </header>

      <main className="page" id="home">
        <section className="hero card">
          <div className="hero-copy">
            <span className="eyebrow">Healthcare Operations Suite</span>
            <h1>Blood Bank Management Platform</h1>
            <p className="subtitle">
              A modern dashboard to register donors, manage blood requests, and monitor availability.
            </p>
            <div className="hero-actions">
              <a className="btn" href="#donate">
                Donate Now
              </a>
              <a className="btn secondary" href="#request">
                Request Blood
              </a>
            </div>
          </div>
          <div className="hero-badge" aria-label="Total available units">
            <span>Available Units</span>
            <strong>{unitsTotal.toFixed(1)}</strong>
          </div>
        </section>

        {message.text && (
          <p className={`message ${message.type === "error" ? "error" : "success"}`}>{message.text}</p>
        )}

        <section className="stats-grid" aria-label="Dashboard statistics">
          {loading ? (
            [...Array(4)].map((_, idx) => <div key={idx} className="card skeleton" />)
          ) : (
            <>
              <article className="card stat-card">
                <p>Total Donors</p>
                <h2>{dashboard?.donors ?? 0}</h2>
              </article>
              <article className="card stat-card">
                <p>Total Blood Banks</p>
                <h2>{dashboard?.bloodBanks ?? 0}</h2>
              </article>
              <article className="card stat-card">
                <p>Total Hospitals</p>
                <h2>{dashboard?.hospitals ?? 0}</h2>
              </article>
              <article className="card stat-card">
                <p>Pending Requests</p>
                <h2>{dashboard?.pendingRequests ?? 0}</h2>
              </article>
            </>
          )}
        </section>

        <section className="content-grid">
          <section className="card" id="donate">
            <h3>Donor Registration</h3>
            <p className="section-desc">Step 1: Enter donor information</p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                createRecord("/donors", donorForm, () => setDonorForm(initialDonor));
              }}
            >
              <div className="field">
                <label htmlFor="donorName">Full Name</label>
                <input
                  id="donorName"
                  placeholder="Enter donor full name"
                  value={donorForm.full_name}
                  onChange={(event) => setDonorForm({ ...donorForm, full_name: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="donorBloodGroup">Blood Group</label>
                <select
                  id="donorBloodGroup"
                  value={donorForm.blood_group}
                  onChange={(event) => setDonorForm({ ...donorForm, blood_group: event.target.value })}
                  required
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="donorPhone">Phone</label>
                <input
                  id="donorPhone"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={donorForm.phone_number}
                  onChange={(event) =>
                    setDonorForm({ ...donorForm, phone_number: event.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="donorEmail">Email</label>
                <input
                  id="donorEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={donorForm.email}
                  onChange={(event) => setDonorForm({ ...donorForm, email: event.target.value })}
                />
              </div>
              <button className="btn" type="submit">
                Register Donor
              </button>
            </form>
          </section>

          <section className="card" id="request">
            <h3>Blood Request Form</h3>
            <p className="section-desc">Step 2: Fill requirement details</p>
            {!canRequest && (
              <p className="hint">Add at least one blood bank and recipient before requesting blood.</p>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                createRecord("/requests", requestForm, () => setRequestForm(initialRequest));
              }}
            >
              <div className="field">
                <label htmlFor="recipient">Recipient</label>
                <select
                  id="recipient"
                  value={requestForm.recipient_id}
                  onChange={(event) =>
                    setRequestForm({ ...requestForm, recipient_id: event.target.value })
                  }
                  disabled={!canRequest}
                  required
                >
                  <option value="">Select recipient</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.recipient_id} value={recipient.recipient_id}>
                      {recipient.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="requestBank">Blood Bank</label>
                <select
                  id="requestBank"
                  value={requestForm.bank_id}
                  onChange={(event) => setRequestForm({ ...requestForm, bank_id: event.target.value })}
                  disabled={!canRequest}
                  required
                >
                  <option value="">Select blood bank</option>
                  {banks.map((bank) => (
                    <option key={bank.bank_id} value={bank.bank_id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="requestGroup">Blood Group</label>
                  <select
                    id="requestGroup"
                    value={requestForm.blood_group}
                    onChange={(event) =>
                      setRequestForm({ ...requestForm, blood_group: event.target.value })
                    }
                  >
                    {bloodGroups.map((group) => (
                      <option key={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="units">Units Required</label>
                  <input
                    id="units"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={requestForm.units_required}
                    onChange={(event) =>
                      setRequestForm({ ...requestForm, units_required: event.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="requestDate">Request Date</label>
                <input
                  id="requestDate"
                  type="datetime-local"
                  value={requestForm.request_date}
                  onChange={(event) =>
                    setRequestForm({ ...requestForm, request_date: event.target.value })
                  }
                  required
                />
              </div>
              <button className="btn" type="submit" disabled={!canRequest}>
                Submit Request
              </button>
            </form>
          </section>
        </section>

        <section className="card">
          <div className="table-header">
            <h3>Blood Availability</h3>
            <div className="field small">
              <label htmlFor="inventoryFilter">Filter by group</label>
              <select
                id="inventoryFilter"
                value={inventoryFilter}
                onChange={(event) => setInventoryFilter(event.target.value)}
              >
                <option value="">All</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Units Available</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="3">No inventory found.</td>
                  </tr>
                ) : (
                  filteredInventory.map((row) => (
                    <tr key={row.inventory_id}>
                      <td>{row.blood_group}</td>
                      <td>{row.units_available}</td>
                      <td>{row.expiry_date || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <section>
          <h4>BloodCare</h4>
          <p>Professional blood donation and request management platform.</p>
        </section>
        <section>
          <h4>Quick Links</h4>
          <a href="#home">Home</a>
          <a href="#donate">Donate</a>
          <a href="#request">Request</a>
        </section>
        <section>
          <h4>Contact</h4>
          <p>Email: support@bloodcare.org</p>
          <p>Phone: +91 90000 00000</p>
          <div className="social" aria-label="Social links">
            <span aria-hidden="true">○</span>
            <span aria-hidden="true">△</span>
            <span aria-hidden="true">□</span>
          </div>
        </section>
      </footer>
    </>
  );
}

export default App;
