// npm install node-fetch
import fetch from "node-fetch";

const projectId = process.env.PROJECT_ID || "abc123";      // apna project ID
const dataset = process.env.DATASET || "production";    // dataset name
const token = process.env.GROQ_API_KEY || "your-api-key-here";    // tera read token from .env

const query = '*[_type=="post"][0..2]';  // simple test query
const url = `https://${projectId}.api.sanity.io/v1/data/query/${dataset}?query=${encodeURIComponent(query)}`;

const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
};

fetch(url, { headers })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log("✅ GROQ API working!");
    console.log(data);
  })
  .catch(err => {
    console.log("❌ API error:", err.message);
  });
