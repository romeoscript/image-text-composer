"use client";

import { useState, useEffect } from "react";

// Subscription modals disabled - subscription features removed

export const Modals = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Subscription modals disabled - subscription features removed */}
    </>
  );
};
