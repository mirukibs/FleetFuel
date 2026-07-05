import { database } from '../database/inMemoryDatabase.mjs';

export class InMemoryUserRepository {
  save(user) {
    const index = database.users.findIndex(existing => existing.id === user.id);
    if (index >= 0) {
      database.users[index] = user;
      return user;
    }

    database.users.push(user);
    return user;
  }

  findByEmail(email) {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    return database.users.find(user => user.email === normalizedEmail) ?? null;
  }

  findById(id) {
    return database.users.find(user => user.id === id) ?? null;
  }
}
