import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  // get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // sllow value to be a function so we have the same api as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // save state
      setStoredValue(valueToStore);
      
      // save to local storage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
