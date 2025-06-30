import { User } from '../types';

const STORAGE_KEY = 'grading_system_user';
const USERS_KEY = 'grading_system_users';

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const removeUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getAllUsers = (): User[] => {
  const usersData = localStorage.getItem(USERS_KEY);
  return usersData ? JSON.parse(usersData) : [];
};

export const saveAllUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getAllUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveAllUsers(users);
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  // In a real app, you'd verify the password
  const users = getAllUsers();
  return users.find(user => user.email === email) || null;
};

export const validateAlQudsEmail = (email: string): boolean => {
  return email.endsWith('@students.alquds.edu');
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

export const isDoctorRole = (): boolean => {
  const user = getUser();
  return user?.role === 'doctor';
};

export const isStudentRole = (): boolean => {
  const user = getUser();
  return user?.role === 'student';
};