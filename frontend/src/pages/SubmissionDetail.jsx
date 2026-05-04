import { useEffect, useState } from "react";
import API from "../api/api";

const DOC_LABEL = {
  pan: "PAN / tax ID",
  aadhaar: "Government ID",
  bank_statement: "Bank statement",
};

const STATE_CLASS = {
  submitted: "state-submitted",
  under_review: "state-review",
  approved: "state-approved",
  rejected: "state-rejected",
  draft: "state-draft",
  more_info_requested: "state-info",
};

function prettyState(state) {
  return String(state || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatErr(err) {
  const d = err.response?.data;
  if (d && typeof d === "object") return JSON.stringify(d);
  return err.message || "Error";
}

export default function SubmissionDetail({ id, triggerRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setError(null);
    API.get(`review/${id}/`)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(formatErr(err));
        console.error(err);
      });
  }, [id]);

  const handleAction = async (action) => {
    if (action === "rejected") {
      if (!rejectReason.trim()) {
        setError("Please enter a rejection reason.");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const body = { action };
      if (action === "rejected") body.reason = rejectReason.trim();
      await API.post(`review/${id}/action/`, body);
      setRejectOpen(false);
      setRejectReason("");
      triggerRefresh();
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  };

  if (error && !data) {
    return (
      <div className="card">
        <p className="flash flash-error">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card detail-loading">
        <div className="skeleton-line wide" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    );
  }

  const docs = Array.isArray(data.documents) ? data.documents : [];

  return (
    <div className="card detail-card">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Submission #{data.id}</p>
          <h3 className="detail-title">{data.name}</h3>
          <p className="muted">{data.business_name}</p>
        </div>
        <span
          className={`state-pill state-pill-lg ${
            STATE_CLASS[data.state] || "state-draft"
          }`}
        >
          {prettyState(data.state)}
        </span>
      </div>

      {error && (
        <p className="flash flash-error" role="alert">
          {error}
        </p>
      )}

      <div className="detail-grid">
        <div>
          <h4 className="mini-title">Contact</h4>
          <dl className="kv">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${data.email}`}>{data.email}</a>
            </dd>
            <dt>Phone</dt>
            <dd>{data.phone}</dd>
          </dl>
        </div>
        <div>
          <h4 className="mini-title">Business</h4>
          <dl className="kv">
            <dt>Type</dt>
            <dd>{data.business_type}</dd>
            <dt>Expected volume</dt>
            <dd>{data.expected_volume}</dd>
          </dl>
        </div>
      </div>

      <div className="docs-section">
        <h4 className="mini-title">Documents</h4>
        {docs.length === 0 ? (
          <p className="muted small">No files attached.</p>
        ) : (
          <ul className="doc-links">
            {docs.map((doc) => (
              <li key={doc.id}>
                <span className="doc-type-tag">
                  {DOC_LABEL[doc.doc_type] || doc.doc_type}
                </span>
                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-link"
                  >
                    Open file
                  </a>
                ) : (
                  <span className="muted small">No URL</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="detail-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleAction("approved")}
          disabled={loading || data.state === "approved"}
        >
          Approve
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setRejectOpen((v) => !v)}
          disabled={loading || data.state === "approved"}
        >
          Reject
        </button>
      </div>

      {rejectOpen && (
        <div className="reject-panel">
          <label className="field">
            <span className="field-label">Rejection reason</span>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Required for compliance…"
            />
          </label>
          <div className="reject-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleAction("rejected")}
              disabled={loading}
            >
              Confirm reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
