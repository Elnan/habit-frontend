import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./NavTabs.module.css";

/**
 * Navigation component for main app sections
 * Uses React Router's NavLink for automatic active state
 * Sections:
 * - Today's habits
 * - Habit management
 * - Calendar view
 * - Statistics
 */
function NavTabs() {
  return (
    <nav className={styles.navTabs}>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Today
      </NavLink>
      <NavLink
        to="/habits"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Habits
      </NavLink>
      <NavLink
        to="/calendar"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Calendar
      </NavLink>
      <NavLink
        to="/stats"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Stats
      </NavLink>
    </nav>
  );
}

export default NavTabs;
