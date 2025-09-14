// User service functions
export const findUserByUsername = (users, username) => {
  return users.find(u => u.username === username);
};