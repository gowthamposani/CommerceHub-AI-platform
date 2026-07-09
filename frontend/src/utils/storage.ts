export function getStorageItem<T>(key: string, fallback: T): T {
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : fallback;
}

export function setStorageItem<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key: string): void {
  window.localStorage.removeItem(key);
}
