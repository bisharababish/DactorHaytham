import { Question, Exam, ExamAttempt, Grade, ChatMessage, ChatRoom } from '../types';

// Questions Storage
const QUESTIONS_KEY = 'grading_system_questions';
const EXAMS_KEY = 'grading_system_exams';
const EXAM_ATTEMPTS_KEY = 'grading_system_exam_attempts';
const GRADES_KEY = 'grading_system_grades';
const CHAT_MESSAGES_KEY = 'grading_system_chat_messages';
const CHAT_ROOMS_KEY = 'grading_system_chat_rooms';

// Initialize with sample questions
export const initializeQuestions = (): void => {
  const existingQuestions = localStorage.getItem(QUESTIONS_KEY);
  if (!existingQuestions) {
    const sampleQuestions: Question[] = generateSampleQuestions();
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(sampleQuestions));
  }
};

export const generateSampleQuestions = (): Question[] => {
  const questions: Question[] = [];
  const categories = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Anatomy'];
  
  for (let i = 1; i <= 100; i++) {
    questions.push({
      id: i.toString(),
      question: `Sample medical question ${i}: What is the correct answer for this medical scenario?`,
      options: [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return questions;
};

export const getQuestions = (): Question[] => {
  const questions = localStorage.getItem(QUESTIONS_KEY);
  return questions ? JSON.parse(questions) : [];
};

export const getRandomQuestions = (count: number = 10): Question[] => {
  const allQuestions = getQuestions();
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Exams Storage
export const getExams = (): Exam[] => {
  const exams = localStorage.getItem(EXAMS_KEY);
  if (!exams) {
    const defaultExams = createDefaultExams();
    localStorage.setItem(EXAMS_KEY, JSON.stringify(defaultExams));
    return defaultExams;
  }
  return JSON.parse(exams);
};

export const createDefaultExams = (): Exam[] => {
  const examTitles = [
    'Human Anatomy Fundamentals',
    'Pathophysiology Basics',
    'Pharmacology Principles',
    'Medical Ethics & Law',
    'Clinical Diagnosis Methods',
    'Emergency Medicine Protocols'
  ];

  return examTitles.map((title, index) => ({
    id: (index + 1).toString(),
    title,
    description: `Comprehensive examination covering ${title.toLowerCase()}`,
    questions: getRandomQuestions(10),
    duration: 30,
    isActive: true,
    moduleNumber: index + 1
  }));
};

// Exam Attempts Storage
export const saveExamAttempt = (attempt: ExamAttempt): void => {
  const attempts = getExamAttempts();
  attempts.push(attempt);
  localStorage.setItem(EXAM_ATTEMPTS_KEY, JSON.stringify(attempts));
};

export const getExamAttempts = (): ExamAttempt[] => {
  const attempts = localStorage.getItem(EXAM_ATTEMPTS_KEY);
  return attempts ? JSON.parse(attempts) : [];
};

export const getStudentAttempts = (studentId: string): ExamAttempt[] => {
  return getExamAttempts().filter(attempt => attempt.studentId === studentId);
};

// Grades Storage
export const saveGrade = (grade: Grade): void => {
  const grades = getGrades();
  const existingGradeIndex = grades.findIndex(g => g.id === grade.id);
  
  if (existingGradeIndex >= 0) {
    grades[existingGradeIndex] = grade;
  } else {
    grades.push(grade);
  }
  
  localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
};

export const getGrades = (): Grade[] => {
  const grades = localStorage.getItem(GRADES_KEY);
  return grades ? JSON.parse(grades) : [];
};

export const getStudentGrades = (studentId: string): Grade[] => {
  return getGrades().filter(grade => grade.studentId === studentId);
};

// Chat Storage
export const saveChatMessage = (message: ChatMessage): void => {
  const messages = getChatMessages();
  messages.push(message);
  localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
};

export const getChatMessages = (): ChatMessage[] => {
  const messages = localStorage.getItem(CHAT_MESSAGES_KEY);
  return messages ? JSON.parse(messages) : [];
};

export const getChatMessagesBetweenUsers = (userId1: string, userId2: string): ChatMessage[] => {
  const messages = getChatMessages();
  return messages.filter(msg => 
    (msg.senderId === userId1 && msg.receiverId === userId2) ||
    (msg.senderId === userId2 && msg.receiverId === userId1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getChatRooms = (): ChatRoom[] => {
  const rooms = localStorage.getItem(CHAT_ROOMS_KEY);
  return rooms ? JSON.parse(rooms) : [];
};

export const saveChatRoom = (room: ChatRoom): void => {
  const rooms = getChatRooms();
  const existingRoomIndex = rooms.findIndex(r => r.id === room.id);
  
  if (existingRoomIndex >= 0) {
    rooms[existingRoomIndex] = room;
  } else {
    rooms.push(room);
  }
  
  localStorage.setItem(CHAT_ROOMS_KEY, JSON.stringify(rooms));
};