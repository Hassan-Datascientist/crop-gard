import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const onTouchStart = (e) => {
    if (refreshing) return;
    // Only begin a pull gesture when the page is scrolled to the very top
    startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
  };

  const onTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      // Rubber-band resistance for a native feel
      setPull(Math.min(delta * 0.5, THRESHOLD + 30));
    }
  };

  const onTouchEnd = async () => {
    if (startY.current === null) return;
    const reached = pull >= THRESHOLD;
    startY.current = null;
    if (reached && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const indicator = refreshing ? THRESHOLD : pull;
  const progress = Math.min(pull / THRESHOLD, 1);
  const visible = indicator > 0 || refreshing;

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-opacity"
        style={{ top: `${-36 + indicator}px`, opacity: visible ? 1 : 0 }}
      >
        <Loader2
          className={cn("h-6 w-6 text-emerald-600", refreshing && "animate-spin")}
          style={{ transform: `rotate(${progress * 360}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}