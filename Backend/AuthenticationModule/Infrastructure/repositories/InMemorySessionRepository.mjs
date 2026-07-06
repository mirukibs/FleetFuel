import { database } from '../database/inMemoryDatabase.mjs';

export class InMemorySessionRepository {
  save(session) {
    database.sessions.push(session);
    return session;
  }

  findByToken(token) {
    return database.sessions.find(session => session.token === token) ?? null;
  }

  deleteByToken(token) {
    const index = database.sessions.findIndex(session => session.token === token);
    if (index === -1) return false;
    database.sessions.splice(index, 1);
    return true;
  }
}
