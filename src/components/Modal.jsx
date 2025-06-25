import { useRef, useState } from "react";
import styles from "./Modal.module.css";

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientY);
    setIsDragging(true);
    modalRef.current.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStart;

    if (diff < 0) return; // Prevent dragging up

    setCurrentTranslate(diff);
    modalRef.current.style.transform = `translateY(${diff}px)`;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    modalRef.current.style.transition = "transform 0.3s ease-out";

    if (currentTranslate > 100) {
      modalRef.current.style.transform = "translateY(100%)";
      setTimeout(onClose, 300);
    } else {
      modalRef.current.style.transform = "translateY(0)";
    }

    setCurrentTranslate(0);
  };

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ""}`}>
      <div
        ref={modalRef}
        className={styles.modalContent}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <div className={styles.modalHandle} />
        {children}
      </div>
    </div>
  );
}
