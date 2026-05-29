import { useEffect, useState } from "react";

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode / quota / etc.)
  }
}

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => loadJSON(key, initialValue));

  useEffect(() => {
    saveJSON(key, state);
  }, [key, state]);

  return [state, setState];
}

