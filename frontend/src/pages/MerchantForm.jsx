import { useState } from "react";
import API from "../api/api";

export default function MerchantForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    business_type: "",
    expected_volume: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await API.post("kyc/create/", form);
      await API.post(`kyc/${res.data.id}/submit/`);

      alert("KYC Submitted!");

      setForm({
        name: "",
        email: "",
        phone: "",
        business_name: "",
        business_type: "",
        expected_volume: "",
      });

    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Merchant KYC</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          value={form[key]} 
          placeholder={key.replace("_", " ")}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
        />
      ))}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit KYC"}
      </button>
    </div>
  );
}