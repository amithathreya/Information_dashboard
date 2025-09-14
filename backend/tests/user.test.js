import { findUserByUsername } from '../src/services/user.service.js';

describe('User Service', () => {
  it('should find user by username', () => {
    const users = [{ username: 'amith', password: '123' }];
    const user = findUserByUsername(users, 'amith');
    expect(user).toEqual({ username: 'amith', password: '123' });
  });
});