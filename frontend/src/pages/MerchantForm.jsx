import { useState } from "react";
import API, { uploadDocument } from "../api/api";

const DOC_SLOTS = [
  { type: "pan", label: "PAN / tax ID", hint: "PDF, JPG or PNG — max 5MB" },
  {
    type: "aadhaar",
    label: "Government-issued ID",
    hint: "Aadhaar, passport, or driver license",
  },
  {
    type: "bank_statement",
    label: "Bank statement",
    hint: "Recent statement showing business account",
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  business_name: "",
  business_type: "",
  expected_volume: "",
};

function formatError(err) {
  const d = err.response?.data;
  if (d && typeof d === "object") {
    try {
      return JSON.stringify(d, null, 2);
    } catch {
      return String(d);
    }
  }
  return err.message || "Something went wrong";
}

export default function MerchantForm() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({
    pan: null,
    aadhaar: null,
    bank_statement: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setMessage(null);
  };

  const updateFile = (type, fileList) => {
    const file = fileList?.[0] || null;
    setFiles((prev) => ({ ...prev, [type]: file }));
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    const vol = parseInt(String(form.expected_volume).trim(), 10);
    if (Number.isNaN(vol) || vol < 0) {
      setError("Please enter a valid non-negative number for expected monthly volume.");
      return;
    }

    const payload = {
      ...form,
      expected_volume: vol,
    };

    try {
      setLoading(true);

      const res = await API.post("kyc/create/", payload);
      const submissionId = res.data.id;

      const slotsWithFiles = DOC_SLOTS.filter((s) => files[s.type]);
      for (const slot of slotsWithFiles) {
        try {
          await uploadDocument(submissionId, slot.type, files[slot.type]);
        } catch (e) {
          setError(
            `Draft #${submissionId} was created, but uploading "${slot.label}" failed:\n${formatError(
              e
            )}\n\nYour application was not submitted. Fix the file and try again, or continue without that document.`
          );
          setLoading(false);
          return;
        }
      }

      await API.post(`kyc/${submissionId}/submit/`);

      setMessage("Your KYC has been submitted successfully.");
      setForm(initialForm);
      setFiles({ pan: null, aadhaar: null, bank_statement: null });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <section className="card merchant-hero">
        <p className="eyebrow">Merchant onboarding</p>
        <h2 className="card-title">Submit your KYC</h2>
        <p className="muted">
          Provide accurate business details and supporting documents. Accepted
          files: PDF, JPEG, PNG up to 5MB each.
        </p>
      </section>

      {message && (
        <div className="flash flash-success" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="flash flash-error" role="alert">
          <pre className="flash-pre">{error}</pre>
        </div>
      )}

      <section className="card">
        <h3 className="section-title">Contact</h3>
        <div className="field-grid">
          <label className="field">
            <span className="field-label">Full name</span>
            <input
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Legal name as on ID"
            />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label className="field field-span-2">
            <span className="field-label">Phone</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+1 · include country code"
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">Business</h3>
        <div className="field-grid">
          <label className="field field-span-2">
            <span className="field-label">Business legal name</span>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              placeholder="Registered business name"
            />
          </label>
          <label className="field">
            <span className="field-label">Business type</span>
            <input
              type="text"
              value={form.business_type}
              onChange={(e) => updateField("business_type", e.target.value)}
              placeholder="e.g. Retail, SaaS, Marketplace"
            />
          </label>
          <label className="field">
            <span className="field-label">Expected monthly volume</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.expected_volume}
              onChange={(e) => updateField("expected_volume", e.target.value)}
              placeholder="e.g. 50000"
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">Documents</h3>
        <p className="muted small">
          Upload any combination; each slot maps to a verification category on
          our side.
        </p>
        <div className="doc-list">
          {DOC_SLOTS.map((slot) => (
            <label key={slot.type} className="doc-row">
              <div className="doc-meta">
                <span className="doc-label">{slot.label}</span>
                <span className="doc-hint">{slot.hint}</span>
              </div>
              <div className="file-input-wrap">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={(e) => updateFile(slot.type, e.target.files)}
                  className="file-input"
                />
                {files[slot.type] && (
                  <span className="file-name">{files[slot.type].name}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="sticky-submit">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting…" : "Submit KYC"}
        </button>
      </div>
    </div>
  );
}
