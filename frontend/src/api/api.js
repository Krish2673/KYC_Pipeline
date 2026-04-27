import axios from "axios";

const API = axios.create({
  baseURL: "https://kyc-pipeline-avwm.onrender.com/api/v1/",
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Token ${token}`;
};

export default API;