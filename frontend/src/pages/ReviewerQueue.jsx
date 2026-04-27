import { useEffect, useState } from "react";
import API from "../api/api";

export default function ReviewerQueue({ setSelected, refreshFlag }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("review/queue/")
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [refreshFlag]);

  return (
    <div className="card">
      <h2>Reviewer Queue</h2>

      {data.length === 0 && <p>No submissions in queue</p>}

      {data.map((item) => (
        <div
          key={item.id}
          onClick={() => setSelected(item.id)}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
        >
          <b>{item.name}</b> - {item.state}

          <span
            className={`badge ${
              item.at_risk ? "badge-risk" : "badge-ok"
            }`}
          >
            {item.at_risk ? "At Risk" : "OK"}
          </span>
        </div>
      ))}
    </div>
  );
}