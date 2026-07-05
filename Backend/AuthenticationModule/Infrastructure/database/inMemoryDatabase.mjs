export const database = {
  users: [],
  sessions: []
};

export const resetInMemoryDatabase = () => {
  database.users.length = 0;
  database.sessions.length = 0;
};
