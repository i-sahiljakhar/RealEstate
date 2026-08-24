// const API_URL = import.meta.VITE_API_URL || "http://localhost:5173";
// //if you deploy here only you have to paste the 
// //live or hosted url for backend

// export default API_URL

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default API_URL;