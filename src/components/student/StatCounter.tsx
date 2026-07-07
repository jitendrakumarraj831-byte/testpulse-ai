"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface StatCounterProps {
  value: number;
  suffix?: string;
}

export function StatCounter({ value, suffix = "" }: StatCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [value, suffix]);

  return <span ref={nodeRef}>0{suffix}</span>;
}
