import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/",
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Token ${token}`;
};

export default API;