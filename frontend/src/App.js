import { useState } from "react";
import MerchantForm from "./pages/MerchantForm";
import ReviewerQueue from "./pages/ReviewerQueue";
import SubmissionDetail from "./pages/SubmissionDetail";
import { setToken } from "./api/api";

const USERS = {
  merchant: "dd6efa58049f9169a94e5f6efc4fb52cfed197f6",
  reviewer: "88c595fe6e7f8d7d20ecdb3d7ad504f78a01490a",
};

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // 🔐 Login
  const handleLogin = (user) => {
    setToken(USERS[user]);
    setSelectedUser(user);
  };

  // 🚪 Logout
  const handleLogout = () => {
    setSelectedUser(null);
    setSelectedSubmission(null);
  };

  // 🔄 Refresh queue after action
  const triggerRefresh = () => {
    setSelectedSubmission(null); // close detail view
    setRefreshFlag((prev) => prev + 1); // reload queue
  };

  // 🔴 Login screen
  if (!selectedUser) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Select User</h2>

        {Object.keys(USERS).map((user) => (
          <button key={user} onClick={() => handleLogin(user)}>
            Login as {user}
          </button>
        ))}
      </div>
    );
  }

  // 🟢 Main app
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Playto KYC</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <p>Logged in as: {selectedUser}</p>

      {/* Merchant View */}
      {selectedUser === "merchant" && <MerchantForm />}

      {/* Reviewer View */}
      {selectedUser === "reviewer" && (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;