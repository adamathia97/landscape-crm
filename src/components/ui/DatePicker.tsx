import React, { useState, useRef, useEffect } from "react";
import styles from "./DatePicker.module.css";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [y, m] = value.split("-");
      return new Date(parseInt(y), parseInt(m) - 1, 1);
    }
    return new Date();
  });
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const cells = [];
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const todayStr = new Date().toISOString().split('T')[0];

  // Weekdays
  weekdays.forEach(day => {
    cells.push(<div key={`wd-${day}`} className={styles.weekday}>{day}</div>);
  });

  // Previous Month
  for (let i = 0; i < firstDay; i++) {
    const prevDay = daysInPrevMonth - firstDay + i + 1;
    cells.push(
      <div 
        key={`prev-${i}`} 
        className={`${styles.day} ${styles.otherMonth}`}
        onClick={() => {
          const prevDate = new Date(year, month - 1, prevDay);
          onChange(prevDate.toISOString().split('T')[0]);
          setIsOpen(false);
        }}
      >
        {prevDay}
      </div>
    );
  }

  // Current Month
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = `${currentMonthPrefix}-${String(i).padStart(2, '0')}`;
    const isToday = dayStr === todayStr;
    const isSelected = dayStr === value;
    
    cells.push(
      <div 
        key={`day-${i}`} 
        className={`${styles.day} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
        onClick={() => {
          onChange(dayStr);
          setIsOpen(false);
        }}
      >
        {i}
      </div>
    );
  }

  // Next Month
  const totalCells = firstDay + daysInMonth;
  const nextDays = (Math.ceil(totalCells / 7) * 7) - totalCells;
  for (let i = 1; i <= nextDays; i++) {
    cells.push(
      <div 
        key={`next-${i}`} 
        className={`${styles.day} ${styles.otherMonth}`}
        onClick={() => {
          const nextDate = new Date(year, month + 1, i);
          onChange(nextDate.toISOString().split('T')[0]);
          setIsOpen(false);
        }}
      >
        {i}
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={`${styles.inputWrapper} ${isOpen ? styles.active : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <input 
          type="text" 
          className={styles.input} 
          value={value} 
          readOnly 
          placeholder="Select date"
        />
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.header}>
            <button 
              type="button"
              className={styles.navBtn} 
              onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(year, month - 1, 1)); }}
            >
              &lt;
            </button>
            <div className={styles.currentMonth}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              type="button"
              className={styles.navBtn} 
              onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(year, month + 1, 1)); }}
            >
              &gt;
            </button>
          </div>
          <div className={styles.grid}>
            {cells}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
             <button
               type="button"
               style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
               onClick={() => {
                 onChange("");
                 setIsOpen(false);
               }}
             >
               Clear
             </button>
             <button
               type="button"
               style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem' }}
               onClick={() => {
                 onChange(todayStr);
                 setCurrentMonth(new Date());
                 setIsOpen(false);
               }}
             >
               Today
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
