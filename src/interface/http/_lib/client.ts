import axios from "axios";
import { config } from "../../../config.ts";

export const aiApiClient = axios.create({
  baseURL: config.http.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
