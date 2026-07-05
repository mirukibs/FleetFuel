export const inMemoryDatabase = {
  fuelAccounts: new Map(),
  counters: new Map()
};

export const resetInMemoryDatabase = () => {
  inMemoryDatabase.fuelAccounts.clear();
  inMemoryDatabase.counters.clear();
};

export const nextId = (prefix) => {
  const current = inMemoryDatabase.counters.get(prefix) ?? 0;
  const next = current + 1;
  inMemoryDatabase.counters.set(prefix, next);
  return `${prefix}-${String(next).padStart(3, '0')}`;
};
