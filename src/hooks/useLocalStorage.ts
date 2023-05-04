import { useEffect, useState } from "react";

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export default function useLocalStorage<T>(key: string, initialValue: T) {
  // First check if there is a value in localStorage
  function readLocalStorage() {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }

  const [storedValue, setStoredValue] = useState<T>(readLocalStorage);

  // Create dispatch function to set or remove localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          if (event.newValue === null) {
            setStoredValue(initialValue);
            return;
          }
          const newValue = JSON.parse(event.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.log(error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue] as const;
}
