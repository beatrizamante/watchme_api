import axios from "axios";
import { config } from "../../../config.ts";

export const aiApiClient = axios.create({
  baseURL: config.http.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
