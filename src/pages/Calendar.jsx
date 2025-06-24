import React, { useEffect, useState } from "react";
import CalendarView from "../components/CalendarView";
import { habitService } from "../services/api";
import styles from "./Calendar.module.css";

export default function Calendar() {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const habitsResponse = await habitService.getHabits();
        setHabits(habitsResponse.data || []);
      } catch (err) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Laster...</div>;

  return (
    <div className={styles.container}>
      <CalendarView habits={habits} />
    </div>
  );
}
