// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Today from "./pages/Today";
import Habits from "./pages/Habits";
import Calendar from "./pages/Calendar";
import Stats from "./pages/Stats";
import NavTabs from "./components/NavTabs";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
      <NavTabs />
    </div>
  );
}

export default App;
