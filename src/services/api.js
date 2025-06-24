import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://habit-api.fly.dev/api" // Add /api to the base URL
    : "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_API_KEY,
  },
});

// Improved error logging
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Success [${response.config.method}] ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `API Error [${error.config?.method}] ${error.config?.url}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Create habit service with common API calls
export const habitService = {
  getAll: () => api.get("/habits"),
  getHabits: () => api.get("/habits"),
  createHabit: (habit) => api.post("/habits", habit),
  updateHabit: (id, habit) => api.put(`/habits/${id}`, habit),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  getEntries: (date) => api.get(`/entries/${date}`),
  updateEntry: (date, entry) => api.put(`/entries/${date}`, entry),
  getStats: (year, month) => api.get(`/stats/monthly/${year}/${month}`),
};

// Create entry service with entry-specific API calls
export const entryService = {
  getEntriesByMonth: (year, month) =>
    api.get(`/entries/month/${year}/${month}`),
  getEntry: (date) => api.get(`/entries/${date}`),
  updateEntry: (date, entry) => api.put(`/entries/${date}`, entry),
};

export { api };
