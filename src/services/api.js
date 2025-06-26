import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://habit-api.fly.dev/api"
    : "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_API_KEY,
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    if (!error.config.retry && error.response?.status >= 500) {
      error.config.retry = true;
      return api(error.config);
    }
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
  createEntry: (entry) => api.post("/entries", entry),
};

export { api };
