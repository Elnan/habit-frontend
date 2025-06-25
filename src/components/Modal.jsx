import { useRef, useState, useEffect } from "react";
import styles from "./Modal.module.css";

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTouchStart = (e) => {
    e.stopPropagation();
    setDragStart(e.touches[0].clientY);
    setIsDragging(true);
    modalRef.current.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStart;

    if (diff < 0) return; // Prevent dragging up

    setCurrentTranslate(diff);
    modalRef.current.style.transform = `translateY(${diff}px)`;
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    modalRef.current.style.transition = "transform 0.3s ease-out";

    if (currentTranslate > 100) {
      modalRef.current.style.transform = "translateY(100%)";
      setTimeout(() => {
        onClose();
        setCurrentTranslate(0);
      }, 300);
    } else {
      modalRef.current.style.transform = "translateY(0)";
      setCurrentTranslate(0);
    }
  };

  // Handle cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentTranslate(0);
      setIsDragging(false);
      if (modalRef.current) {
        modalRef.current.style.transform = "translateY(100%)";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
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
