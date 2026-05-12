import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const WA_NUMBER = "628998553333";
export const WA_DISPLAY = "0899-855-3333";
export const WA_LINK = (msg = "") =>
  `https://wa.me/${WA_NUMBER}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;

export const trackCta = async (label, section = "") => {
  try {
    await axios.post(`${API}/cta`, { label, section });
  } catch (e) {
    // silent fail
  }
};

export const COVER_FRONT =
  "https://customer-assets.emergentagent.com/job_f5c74294-4192-43ad-b4da-a1bc0dd721ea/artifacts/0rb0jb7v_ChatGPT%20Image%2030%20Apr%202026%2C%2013.14.39.png";

export const COVER_BACK =
  "https://customer-assets.emergentagent.com/job_f5c74294-4192-43ad-b4da-a1bc0dd721ea/artifacts/pl57yf9e_ChatGPT%20Image%2030%20Apr%202026%2C%2013.29.01.png";
