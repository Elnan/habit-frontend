import React from "react";
import styles from "./HabitCard.module.css";

/**
 * Card component to display individual habit information
 * Shows:
 * - Habit name
 * - Completion rate
 * - Current streak (if any)
 * @param {Object} habit - Habit data to display
 * @param {Function} toggleDone - Callback to toggle completion status
 */
function HabitCard({ habit, toggleDone, className = "" }) {
  // Calculate completion percentage
  const completionRate = habit.stats?.totalCompleted
    ? Math.round((habit.stats.totalCompleted / habit.days.length) * 100)
    : 0;

  return (
    <div
      className={`${styles.card} ${habit.done ? styles.done : ""} ${className}`}
      onClick={toggleDone}
    >
      <h3>{habit.name}</h3>
      <p>Fullført {completionRate}%</p>
      {habit.stats?.streak > 0 && (
        <p className={styles.streak}>🔥 {habit.stats.streak} dager streak</p>
      )}
    </div>
  );
}

export default HabitCard;
