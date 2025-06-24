import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import styles from "./CalendarView.module.css";
import { entryService } from "../services/api";

// Constants for calendar localization
const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTHS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Calendar component for visualizing habit completion
 * Features:
 * - Monthly view with color-coded completion rates
 * - Detailed daily view with habit lists
 * - Swipe gestures for navigation
 * @param {Array} habits - List of all habits
 */
export default function CalendarView({ habits }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthEntries, setMonthEntries] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches and formats habit entries for the current month
   * Converts array of entries to object with date keys for faster lookup
   */
  useEffect(() => {
    const fetchMonthEntries = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const response = await entryService.getEntriesByMonth(year, month);
        const entries = response.data || [];

        // Converting to object with date keys
        const entriesMap = entries.reduce((acc, entry) => {
          const date = new Date(entry.date);
          acc[date.toDateString()] = entry;
          return acc;
        }, {});

        setMonthEntries(entriesMap);
      } catch (error) {
        console.error("Failed to fetch entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthEntries();
  }, [currentMonth]);

  /**
   * Calculates completion statistics for a specific date
   * @param {Date} date - Date to calculate stats for
   * @returns {Object} Stats containing completed, total, and percentage
   */
  const getCompletionStats = (date, habits) => {
    const dateKey = date.toDateString();
    const entry = monthEntries[dateKey];

    if (!entry) return { completed: 0, total: 0, percentage: 0 };

    return {
      completed: entry.completedHabits.length,
      total: entry.scheduledHabits.length,
      percentage: entry.stats.completionRate,
    };
  };

  /**
   * Determines the color class based on completion percentage
   * - Perfect (100%): Green
   * - High (75-99%): Light green
   * - Medium (50-74%): Yellow
   * - Low (1-49%): Orange
   * - None (0%): Gray
   */
  const getCompletionColor = (stats) => {
    if (!stats || stats.total === 0) return styles.none;

    const percentage = stats.percentage;
    if (percentage === 100) return styles.perfect;
    if (percentage >= 75) return styles.high;
    if (percentage >= 50) return styles.medium;
    if (percentage > 0) return styles.low;
    return styles.none;
  };

  /**
   * Generates array of days for the current month
   * Includes date objects for each day
   */
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const currentDate = new Date(year, month, day);
      return {
        day,
        date: currentDate,
      };
    });
  };

  /**
   * Retrieves habits scheduled for a specific date
   * Marks habits as done based on completion data
   */
  const getHabitsForDate = (date, habits) => {
    const dateKey = date.toDateString();
    const entry = monthEntries[dateKey];

    if (!entry) return [];

    // Scheduled habits for that day
    return entry.scheduledHabits.map((scheduledHabit) => ({
      ...scheduledHabit,
      done: entry.completedHabits.some(
        (completed) => completed.id === scheduledHabit.id
      ),
    }));
  };

  const days = getDaysInMonth(currentMonth);

  // Swipe handler configuration for closing daily view
  const swipeHandlers = useSwipeable({
    onSwipedDown: () => setSelectedDate(null),
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  return (
    <div className={styles.calendar}>
      {/* Navigation header with month selection */}
      <div className={styles.header}>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
            )
          }
        >
          ←
        </button>
        <h2>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
            )
          }
        >
          →
        </button>
      </div>

      {/* Weekday labels */}
      <div className={styles.weekdays}>
        {DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid with completion indicators */}
      <div className={styles.days}>
        {Array(
          new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
          ).getDay()
        )
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptyDay} />
          ))}

        {days.map(({ day, date }) => {
          const stats = getCompletionStats(date, habits);
          const colorClass = getCompletionColor(stats);

          return (
            <div
              key={day}
              className={`${styles.day} ${
                date.toDateString() === selectedDate?.toDateString()
                  ? styles.selected
                  : ""
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <span>{day}</span>
              <div className={`${styles.completionIndicator} ${colorClass}`} />
              {stats.total > 0 && (
                <small className={styles.completionText}>
                  {stats.completed}/{stats.total}
                </small>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed view for selected day */}
      {selectedDate && (
        <div
          {...swipeHandlers}
          className={`${styles.dayDetails} ${
            !selectedDate ? styles.hidden : ""
          }`}
        >
          <div className={styles.swipeIndicator} />
          <div className={styles.dayHeader}>
            <h3>
              {selectedDate.toLocaleDateString("no", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedDate(null)}
            >
              ×
            </button>
          </div>

          <div className={styles.habitsList}>
            {getHabitsForDate(selectedDate, habits).map((habit) => (
              <div
                key={habit.id}
                className={`${styles.habitItem} ${
                  habit.done ? styles.completed : ""
                }`}
              >
                <span>{habit.name}</span>
                {habit.done ? "✓" : ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
