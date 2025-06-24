import React, { useState, useEffect } from "react";
import StatsView from "../components/Stats";
import { api } from "../services/api";
import styles from "./Stats.module.css";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const response = await api.get(`/stats/monthly/${year}/${month}`);
        setStats(response.data);
      } catch (err) {
        setError("Kunne ikke hente statistikk");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <div>Laster...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!stats) return <div>Ingen data tilgjengelig</div>;

  return (
    <div className={styles.container}>
      <StatsView stats={stats} />
    </div>
  );
}
