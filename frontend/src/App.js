import { useState } from "react";
import MerchantForm from "./pages/MerchantForm";
import ReviewerQueue from "./pages/ReviewerQueue";
import SubmissionDetail from "./pages/SubmissionDetail";
import { setToken } from "./api/api";

const USERS = {
  merchant: "d6169b508cdcf394a8e8fc1d3401f05f4bf94b9f",
  reviewer: "b14266228fb84510a5e2f2750296e0561d7e21ee",
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