// api.js
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "/api", // Replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  
  },
   withCredentials: true,
 
});



export default api;
