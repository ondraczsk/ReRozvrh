export const getLocalStorageSizeInKB = (key: string): number => {
  if (typeof window === 'undefined' || !window.localStorage) {
    // Pokud se kód vykonává mimo prohlížeč, vracíme 0 nebo vhodnou výchozí hodnotu.
    return 0;
  }

  const item = window.localStorage.getItem(key);
  if (!item) return 0; // Pokud položka neexistuje, velikost je 0 KB
  const sizeInBytes = new Blob([item]).size; // Spočítá velikost v bajtech
  return sizeInBytes / 1024; // Převod na KB
};
