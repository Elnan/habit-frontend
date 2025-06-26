import React, { useState, useEffect } from "react";
import HabitCard from "./HabitCard";
import styles from "./DailyChecklist.module.css";
import { habitService, entryService } from "../services/api";

/**
 * Calculates a priority score for habit sorting
 * Higher score = higher priority based on:
 * - If the habit is scheduled for today (+100)
 * - How often it's been completed (negative impact)
 * - Days since last completion (positive impact)
 */
function getHabitScore(habit, today) {
  const isToday = habit.days.includes(today);
  const frequency = habit.stats?.totalCompleted || 0;
  const lastCompleted = habit.stats?.lastCompletedDate
    ? new Date(habit.stats.lastCompletedDate)
    : null;

  const daysSinceLast = lastCompleted
    ? Math.floor((Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  let score = 0;

  if (isToday) score += 100;
  score -= frequency;
  score += daysSinceLast;

  return score;
}

/**
 * Filters habits for today and sorts them by priority score
 * Returns only habits scheduled for the current day of the week
 */
function getTodayHabits(habits) {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = days[new Date().getDay()];

  const filteredHabits = (habits || [])
    .filter((habit) => habit?.days?.includes(today))
    .map((habit) => ({
      ...habit,
      score: getHabitScore(habit, today),
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return filteredHabits;
}

/**
 * Main component for daily habit tracking
 * Features:
 * - Displays today's habits in a checklist
 * - Shows completion percentage
 * - Separates completed and incomplete habits
 * - Handles habit completion toggling with animations
 */
function DailyChecklist() {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Changed from object to boolean
  const [error, setError] = useState(null);
  const [animatingHabits, setAnimatingHabits] = useState(new Set());

  // Fetch habits on component mount
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await habitService.getHabits();
        const habitsData = response.data || [];
        setHabits(habitsData);
      } catch (err) {
        setError("Kunne ikke hente vaner");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, []);

  // Simplify toggleDone function
  const toggleDone = async (id) => {
    if (animatingHabits.has(id)) return;
    setAnimatingHabits((prev) => new Set(prev).add(id));

    try {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;

      const isCompleting = !habit.done;
      const today = new Date().toISOString().split("T")[0];

      // Optimistic UI update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                done: isCompleting,
                isCompleting,
                animationState: isCompleting ? "completing" : "uncompleting",
              }
            : h
        )
      );

      // Get current entry for today
      let currentEntry;
      try {
        const response = await entryService.getEntry(today);
        currentEntry = response.data;
      } catch (error) {
        currentEntry = {
          date: today,
          scheduledHabits: [],
          completedHabits: [],
          stats: { completionRate: 0, streak: 0 },
        };
      }

      // Update scheduledHabits and completedHabits
      const updatedEntry = {
        ...currentEntry,
        date: today,
        scheduledHabits: getTodayHabits(habits).map((h) => ({
          id: h.id,
          name: h.name,
          completed: h.id === id ? isCompleting : h.done,
        })),
        completedHabits: getTodayHabits(habits)
          .filter((h) => (h.id === id ? isCompleting : h.done))
          .map((h) => ({
            id: h.id,
            name: h.name,
            completedAt: new Date().toISOString(),
          })),
      };

      // Update entry in background
      await entryService.updateEntry(today, updatedEntry);

      // Update habit status
      await habitService.updateHabit(id, {
        ...habit,
        done: isCompleting,
        stats: {
          ...habit.stats,
          totalCompleted:
            (habit.stats?.totalCompleted || 0) + (isCompleting ? 1 : -1),
          lastCompletedDate: isCompleting ? new Date().toISOString() : null,
          streak: isCompleting ? (habit.stats?.streak || 0) + 1 : 0,
        },
      });
    } catch (error) {
      // Revert UI on error
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, done: !isCompleting } : h))
      );
      console.error("Failed to update habit:", error);
    } finally {
      setAnimatingHabits((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  /**
   * Calculates the current streak for a habit
   * @param {Object} habit - Habit object
   * @param {boolean} completed - New completion status
   */
  function calculateStreak(habit, completed) {
    if (!completed) return 0;
    return (habit.stats?.streak || 0) + 1;
  }

  // Filter habits into completed and incomplete lists
  const todayHabits = getTodayHabits(habits);
  const done = todayHabits.filter((h) => h.done);
  const notDone = todayHabits.filter((h) => !h.done);
  const [showCompleted, setShowCompleted] = useState(false);

  const completionPercentage =
    todayHabits.length > 0
      ? Math.round((done.length / todayHabits.length) * 100)
      : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Dagens vaner</h1>
      <h2 className={styles.subtitle}>
        {done.length} av {todayHabits.length} fullført ({completionPercentage}%)
      </h2>

      <div className={styles.grid}>
        {notDone.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            toggleDone={() => toggleDone(habit.id)}
            className={`
              ${habit.animationState ? styles[habit.animationState] : ""}
            `}
          />
        ))}
      </div>

      {done.length > 0 && (
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={styles.toggleDone}
        >
          {showCompleted
            ? "Skjul fullførte vaner"
            : `Vis ${done.length} fullførte`}
        </button>
      )}

      <div
        className={`${styles.doneWrapper} ${showCompleted ? styles.show : ""}`}
      >
        <div className={styles.gridDone}>
          {done.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              toggleDone={() => toggleDone(habit.id)}
              className={`
                ${habit.animationState ? styles[habit.animationState] : ""}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DailyChecklist;
