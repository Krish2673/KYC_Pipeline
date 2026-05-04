import { useState } from "react";
import MerchantForm from "./pages/MerchantForm";
import ReviewerQueue from "./pages/ReviewerQueue";
import SubmissionDetail from "./pages/SubmissionDetail";
import { setToken } from "./api/api";

const USERS = {
  merchant: "d6169b508cdcf394a8e8fc1d3401f05f4bf94b9f",
  reviewer: "b14266228fb84510a5e2f2750296e0561d7e21ee",
};

const ROLE_META = {
  merchant: {
    title: "Merchant",
    blurb: "Submit KYC and upload verification documents.",
  },
  reviewer: {
    title: "Reviewer",
    blurb: "Open the queue, review details, and approve or reject.",
  },
};

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleLogin = (user) => {
    setToken(USERS[user]);
    setSelectedUser(user);
  };

  const handleLogout = () => {
    setSelectedUser(null);
    setSelectedSubmission(null);
  };

  const triggerRefresh = () => {
    setSelectedSubmission(null);
    setRefreshFlag((prev) => prev + 1);
  };

  if (!selectedUser) {
    return (
      <div className="app-shell login-shell">
        <header className="login-header">
          <div className="brand-mark" aria-hidden />
          <h1 className="login-title">Playto KYC</h1>
          <p className="login-lead">
            Know-your-customer flow for merchants and reviewers.
          </p>
        </header>
        <div className="role-grid">
          {Object.keys(USERS).map((user) => (
            <button
              key={user}
              type="button"
              className="role-card"
              onClick={() => handleLogin(user)}
            >
              <span className="role-card-title">
                {ROLE_META[user]?.title || user}
              </span>
              <span className="role-card-blurb">
                {ROLE_META[user]?.blurb}
              </span>
              <span className="role-card-cta">Continue →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-row">
            <span className="brand-mark sm" aria-hidden />
            <div>
              <h1 className="app-title">Playto KYC</h1>
              <p className="app-sub">
                Signed in as{" "}
                <strong>{ROLE_META[selectedUser]?.title || selectedUser}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="app-main">
        {selectedUser === "merchant" && <MerchantForm />}

        {selectedUser === "reviewer" && (
          <div className="reviewer-layout">
            <ReviewerQueue
              setSelected={setSelectedSubmission}
              refreshFlag={refreshFlag}
            />
            {selectedSubmission && (
              <SubmissionDetail
                id={selectedSubmission}
                triggerRefresh={triggerRefresh}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
