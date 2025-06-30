export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'student';
  address?: string;
  phoneNumber?: string;
  studentId?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number; // in minutes
  isActive: boolean;
  moduleNumber: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: number[];
  score: number;
  completedAt: string;
  duration: number;
}

export interface Grade {
  id: string;
  studentId: string;
  type: 'exam' | 'assignment' | 'participation' | 'project';
  title: string;
  score: number;
  maxScore: number;
  feedback?: string;
  gradedAt: string;
  gradedBy: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  updatedAt: string;
}