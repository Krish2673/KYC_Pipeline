import axios from "axios";

const baseURL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  "https://kyc-pipeline-avwm.onrender.com/api/v1/";

const API = axios.create({
  baseURL,
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Token ${token}`;
};

/**
 * Upload a KYC document (multipart). Do not set Content-Type manually;
 * the browser sets the boundary for FormData.
 */
export function uploadDocument(submissionId, docType, file) {
  const data = new FormData();
  data.append("submission", String(submissionId));
  data.append("doc_type", docType);
  data.append("file", file);
  return API.post("kyc/upload-doc/", data);
}

export default API;
