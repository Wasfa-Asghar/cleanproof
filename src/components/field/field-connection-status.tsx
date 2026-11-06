"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnline() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

/** Live online/offline indicator for field shell — must match field workspace semantics. */
export function FieldConnectionStatus() {
  const online = useSyncExternalStore(subscribe, getOnline, getServerSnapshot);
  return (
    <span
      className={`text-xs font-medium ${online ? "text-[var(--cp-teal)]" : "text-amber-700"}`}
      data-testid="field-connection-status"
    >
      {online ? "Online" : "Offline"}
    </span>
  );
}
