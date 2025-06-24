import React from "react";
import styles from "./Stats.module.css";

/**
 * Statistics dashboard component
 * Displays various metrics:
 * - Longest streak
 * - Perfect days count
 * - Most consistent habit
 * - Monthly completion rate
 * - Weekly trend visualization
 * @param {Object} stats - Statistics data object
 */
export default function Stats({ stats }) {
  // Show loading state if stats aren't loaded
  if (!stats) {
    return <div>Laster statistikk...</div>;
  }

  return (
    <div className={styles.stats}>
      <h2>Statistikk</h2>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <h3>Beste Streak 🔥</h3>
          <div className={styles.bigNumber}>
            {stats.longestStreak || 0}
            <span className={styles.label}>dager</span>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Perfekte Dager ⭐</h3>
          <div className={styles.bigNumber}>
            {stats.perfectDays || 0}
            <span className={styles.label}>dager</span>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Mest Konsistent</h3>
          {stats.mostConsistent ? (
            <div className={styles.consistentHabit}>
              <div className={styles.habitName}>
                {stats.mostConsistent.name}
              </div>
              <div className={styles.percentage}>
                {Math.round(stats.mostConsistent.percentage)}%
              </div>
            </div>
          ) : (
            <div className={styles.noData}>Ingen data</div>
          )}
        </div>

        <div className={styles.card}>
          <h3>Månedens fullføringsrate</h3>
          <div className={styles.percentage}>
            {Math.round(stats.monthlyCompletion || 0)}%
          </div>
        </div>

        <div className={styles.wideCard}>
          <h3>Ukens Trend</h3>
          <div className={styles.trendGraph}>
            {stats.weeklyTrend?.map((day, i) => (
              <div
                key={i}
                className={styles.trendBar}
                style={{ height: `${day.percentage || 0}%` }}
              >
                <span className={styles.trendDate}>
                  {new Date(day.date).toLocaleDateString("no", {
                    weekday: "short",
                  })}
                </span>
              </div>
            )) || <div className={styles.noData}>Ingen trend data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
