import React, { useState, useEffect } from "react";
import { habitService } from "../services/api";
import HabitForm from "../components/HabitForm";
import { Modal } from "../components/Modal";
import styles from "./Habits.module.css";

function Habits() {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const response = await habitService.getHabits();
      setHabits(response.data || []);
    } catch (err) {
      setError("Kunne ikke hente vaner");
      setHabits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleFormSuccess = () => {
    fetchHabits();
    setShowModal(false);
    setSelectedHabit(null);
  };

  if (isLoading) {
    return <div>Laster...</div>;
  }

  return (
    <div className={styles.habitsPage}>
      <div className={styles.habitsList}>
        <h2>Mine vaner</h2>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.grid}>
          {habits.length === 0 ? (
            <p>Ingen vaner funnet</p>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className={styles.habitCard}
                onClick={() => {
                  setSelectedHabit(habit);
                  setShowModal(true);
                }}
              >
                <h3>{habit.name}</h3>
                {habit.description && <p>{habit.description}</p>}
                <div className={styles.days}>
                  {habit.days?.map((day) => (
                    <span key={day} className={styles.day}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        className={styles.fab}
        onClick={() => {
          setSelectedHabit(null);
          setShowModal(true);
        }}
      >
        +
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <HabitForm
          habit={selectedHabit}
          mode={selectedHabit ? "edit" : "new"}
          onSuccess={handleFormSuccess}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}

export default Habits;
