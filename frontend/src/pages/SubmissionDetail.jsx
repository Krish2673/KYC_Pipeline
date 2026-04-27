import { useEffect, useState } from "react";
import API from "../api/api";

export default function SubmissionDetail({ id, triggerRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`review/${id}/`)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [id]);

  const handleAction = async (action) => {
    let body = { action };

    if (action === "rejected") {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;
      body.reason = reason;
    }

    try {
      setLoading(true);

      await API.post(`review/${id}/action/`, body);

      alert("Action completed");

      triggerRefresh();
    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h3>{data.name}</h3>
      <p><b>Email:</b> {data.email}</p>
      <p><b>Business:</b> {data.business_name}</p>
      <p><b>Status:</b> {data.state}</p>

      <button
        className="btn-primary"
        onClick={() => handleAction("approved")}
        disabled={loading}
      >
        Approve
      </button>

      <button
        className="btn-danger"
        onClick={() => handleAction("rejected")}
        disabled={loading}
      >
        Reject
      </button>
    </div>
  );
}