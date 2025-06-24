import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./HabitForm.module.css";

/**
 * Array of weekdays for habit scheduling
 * Each object contains a key (backend value) and label (display text)
 */
const weekdays = [
  { key: "mon", label: "Man" },
  { key: "tue", label: "Tir" },
  { key: "wed", label: "Ons" },
  { key: "thu", label: "Tor" },
  { key: "fri", label: "Fre" },
  { key: "sat", label: "Lør" },
  { key: "sun", label: "Søn" },
];

/**
 * Form component for creating and editing habits
 * Supports both creation of new habits and editing existing ones
 * @param {Object} habit - Existing habit data for edit mode (optional)
 * @param {string} mode - Either 'new' or 'edit'
 * @param {Function} onSuccess - Callback function after successful save
 */
export default function HabitForm({ habit = null, mode = "new", onSuccess }) {
  // Form state management
  const [name, setName] = useState(habit?.name || "");
  const [description, setDescription] = useState(habit?.description || "");
  const [days, setDays] = useState(habit?.days || []);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Update form fields when habit prop changes
   * Ensures form reflects current habit data in edit mode
   */
  useEffect(() => {
    if (habit) {
      setName(habit.name || "");
      setDescription(habit.description || "");
      setDays(habit.days || []);
    }
  }, [habit]);

  /**
   * Toggle day selection in weekday picker
   * Removes day if already selected, adds if not
   */
  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  /**
   * Handle form submission
   * Validates input and sends data to backend
   * Supports both create and update operations
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("Navn er påkrevd");
      return;
    }

    try {
      const payload = {
        name,
        description,
        days,
        completed: false,
        done: false,
        stats: {
          totalCompleted: 0,
          lastCompletedDate: null,
          streak: 0,
        },
      };

      const url = habit?.id ? `/api/habits/${habit.id}` : "/api/habits";
      const method = habit?.id ? "put" : "post";

      await axios[method](url, payload, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
      });

      if (!habit?.id) {
        setName("");
        setDescription("");
        setDays([]);
      }
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("Noe gikk galt under lagring");
    }
  };

  /**
   * Handle habit deletion
   * Shows confirmation dialog before deleting
   * Only available in edit mode
   */
  const handleDelete = async () => {
    if (!habit?.id) return;

    if (!window.confirm("Er du sikker på at du vil slette denne vanen?")) {
      return;
    }

    try {
      await axios.delete(`/api/habits/${habit.id}`, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke slette vanen");
    }
  };

  return (
    <div className={styles.habitForm}>
      <h2 className={styles.title}>
        {mode === "new" ? "Ny vane" : "Rediger vane"}
      </h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={styles.success}>
          Vanen ble {mode === "new" ? "opprettet" : "oppdatert"}!
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label className={styles.label}>Navn:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div>
          <label className={styles.label}>Beskrivelse:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </div>

        <div>
          <label className={styles.label}>Dager:</label>
          <div className={styles.dayGrid}>
            {weekdays.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`${styles.day} ${
                  days.includes(day.key) ? styles.selected : ""
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={`${styles.button} ${styles.submit}`}>
            {mode === "new" ? "Opprett" : "Oppdater"}
          </button>

          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              className={`${styles.button} ${styles.delete}`}
            >
              Slett vane
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
