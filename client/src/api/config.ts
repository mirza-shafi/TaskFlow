export const BASE_URL = 'http://localhost:8000';
const API_URL = process.env.REACT_APP_API_URL || `${BASE_URL}/api/v1`;

export default API_URL;
