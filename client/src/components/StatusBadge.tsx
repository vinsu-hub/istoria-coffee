import { useState, useEffect } from "react";

/**
 * StatusBadge — shows "Open until 3AM" or "Closed — opens 12PM"
 * Uses Asia/Manila timezone, 12PM–3AM (next day) operating hours.
 * Warm minimalist design: subtle pill badge.
 */
export default function StatusBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const checkStatus = () => {
      // Get current time in Asia/Manila timezone
      const manilaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });
      const now = new Date(manilaTime);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      // Open hours: 12:00 PM (720 min) to 3:00 AM next day (180 min)
      // So: if time >= 720 OR time < 180 → open
      const openStart = 12 * 60; // 12:00 PM = 720 minutes
      const openEnd = 3 * 60;    // 3:00 AM = 180 minutes (next day)

      const currentlyOpen = timeInMinutes >= openStart || timeInMinutes < openEnd;
      setIsOpen(currentlyOpen);

      if (currentlyOpen) {
        setLabel("Open until 3AM");
      } else {
        setLabel("Closed — opens 12PM");
      }
    };

    checkStatus();
    // Update every minute
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-body font-medium">
      <span
        className={`w-2 h-2 rounded-full ${
          isOpen ? "bg-green-500 animate-pulse" : "bg-charcoal-light/50"
        }`}
      />
      <span>{label}</span>
    </div>
  );
}
