import { useEffect, useState } from "react";
import API from "../api/api";

const STATE_CLASS = {
  submitted: "state-submitted",
  under_review: "state-review",
  approved: "state-approved",
  rejected: "state-rejected",
  draft: "state-draft",
  more_info_requested: "state-info",
};

function stateLabel(state) {
  return String(state || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ReviewerQueue({ setSelected, refreshFlag }) {
  const [data, setData] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoadError(null);
    API.get("review/queue/")
      .then((queueRes) => setData(queueRes.data))
      .catch((err) => {
        setLoadError(err.message || "Failed to load queue");
        console.error(err);
      });
    API.get("review/dashboard/")
      .then((dashRes) => setDashboard(dashRes.data))
      .catch(() => setDashboard(null));
  }, [refreshFlag]);

  return (
    <div className="stack">
      {dashboard && (
        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-value">{dashboard.total_in_queue}</span>
            <span className="stat-label">In queue</span>
          </div>
          <div className="stat-pill">
            <span className="stat-value">
              {dashboard.avg_time_in_queue_hours != null
                ? dashboard.avg_time_in_queue_hours.toFixed(1)
                : "—"}
            </span>
            <span className="stat-label">Avg wait (hrs)</span>
          </div>
          <div className="stat-pill">
            <span className="stat-value">
              {Math.round((dashboard.approval_rate_last_7_days || 0) * 100)}%
            </span>
            <span className="stat-label">Approved (7d)</span>
          </div>
        </div>
      )}

      <section className="card queue-card">
        <div className="queue-head">
          <div>
            <p className="eyebrow">Review</p>
            <h2 className="card-title">Submission queue</h2>
          </div>
          <span className="badge badge-soft">{data.length} open</span>
        </div>

        {loadError && (
          <p className="flash flash-error" role="alert">
            {loadError}
          </p>
        )}

        {!loadError && data.length === 0 && (
          <p className="empty-hint">No submissions waiting right now.</p>
        )}

        <ul className="queue-list">
          {data.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="queue-item"
                onClick={() => setSelected(item.id)}
              >
                <div className="queue-item-main">
                  <span className="queue-name">{item.name}</span>
                  <span className="queue-business">{item.business_name}</span>
                </div>
                <div className="queue-item-meta">
                  <span
                    className={`state-pill ${
                      STATE_CLASS[item.state] || "state-draft"
                    }`}
                  >
                    {stateLabel(item.state)}
                  </span>
                  <span
                    className={`risk-dot ${item.at_risk ? "at-risk" : "ok"}`}
                    title={item.at_risk ? "Older than 24h" : "Within SLA"}
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
