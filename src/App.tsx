import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, TrendingUp, Clock, Award, MessageCircle, User as UserIcon } from 'lucide-react';

// Components
import Layout from './components/Layout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import ExamCard from './components/Student/ExamCard';
import ExamInterface from './components/Student/ExamInterface';
import ChatInterface from './components/Chat/ChatInterface';
import GradeManagement from './components/Doctor/GradeManagement';

// Utils and Types
import { isAuthenticated, getUser, isDoctorRole, getAllUsers } from './utils/auth';
import { initializeQuestions, getExams, getStudentAttempts, getGrades, getStudentGrades } from './utils/storage';
import { Exam, User } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<string>('');

  const user = getUser();
  const isDoctor = isDoctorRole();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    initializeQuestions();
  }, []);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleStartExam = (examId: string) => {
    const exams = getExams();
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      setCurrentExam(exam);
    }
  };

  const handleExamComplete = () => {
    setCurrentExam(null);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {showSignup ? (
            <SignupForm
              key="signup"
              onSuccess={handleAuthSuccess}
              onToggleForm={() => setShowSignup(false)}
            />
          ) : (
            <LoginForm
              key="login"
              onSuccess={handleAuthSuccess}
              onToggleForm={() => setShowSignup(true)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (currentExam) {
    return (
      <ExamInterface
        exam={currentExam}
        onComplete={handleExamComplete}
        onBack={() => setCurrentExam(null)}
      />
    );
  }

  const renderDashboard = () => {
    if (isDoctor) {
      return <DoctorDashboard />;
    } else {
      return <StudentDashboard onStartExam={handleStartExam} />;
    }
  };

  const renderExams = () => {
    const exams = getExams();
    const attempts = getStudentAttempts(user!.id);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Medical Examinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, index) => {
            const attempt = attempts.find(a => a.examId === exam.id);
            const isLocked = index > 0 && !attempts.find(a => a.examId === exams[index - 1].id);

            return (
              <ExamCard
                key={exam.id}
                exam={exam}
                attempt={attempt}
                onStartExam={handleStartExam}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderGrades = () => {
    if (isDoctor) {
      return <GradeManagement />;
    } else {
      return <StudentGrades />;
    }
  };

  const renderStudents = () => {
    const students = getAllUsers().filter(u => u.role === 'student');

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Students Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {students.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-white/70 capitalize">{user?.role}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                  {user?.email}
                </div>
              </div>
              {user?.studentId && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Student ID</label>
                  <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    {user.studentId}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Address</label>
              <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                {user?.address}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Phone Number</label>
              <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                {user?.phoneNumber}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Member Since</label>
              <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'exams':
        return renderExams();
      case 'grades':
        return renderGrades();
      case 'students':
        return renderStudents();
      case 'chat':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Messages</h2>
            <ChatInterface
              selectedUserId={selectedChatUser}
              onSelectUser={setSelectedChatUser}
            />
          </div>
        );
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

// Dashboard Components
const DoctorDashboard: React.FC = () => {
  const students = getAllUsers().filter(u => u.role === 'student');
  const allGrades = getGrades();
  const avgGrade = allGrades.length > 0
    ? allGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / allGrades.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
        <div className="text-white/80">
          Welcome back, Dr. {getUser()?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={students.length.toString()}
          icon={<Users className="h-6 w-6" />}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Grades"
          value={allGrades.length.toString()}
          icon={<BookOpen className="h-6 w-6" />}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(avgGrade)}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Active Exams"
          value="6"
          icon={<Award className="h-6 w-6" />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
};

const StudentDashboard: React.FC<{ onStartExam: (examId: string) => void }> = ({ onStartExam }) => {
  const exams = getExams();
  const attempts = getStudentAttempts(getUser()!.id);
  const grades = getStudentGrades(getUser()!.id);

  const completedExams = attempts.length;
  const avgScore = attempts.length > 0
    ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
        <div className="text-white/80">
          Welcome, {getUser()?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Completed Exams"
          value={`${completedExams}/6`}
          icon={<BookOpen className="h-6 w-6" />}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(avgScore)}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Total Grades"
          value={grades.length.toString()}
          icon={<Award className="h-6 w-6" />}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Next Exam"
          value={completedExams < 6 ? `Module ${completedExams + 1}` : 'Complete'}
          icon={<Clock className="h-6 w-6" />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Exam Access</h3>
          <div className="space-y-3">
            {exams.slice(0, 3).map((exam, index) => {
              const attempt = attempts.find(a => a.examId === exam.id);
              const isLocked = index > 0 && !attempts.find(a => a.examId === exams[index - 1].id);

              return (
                <motion.div
                  key={exam.id}
                  className={`p-3 rounded-lg border ${attempt
                    ? 'bg-green-500/20 border-green-500/30'
                    : isLocked
                      ? 'bg-gray-500/20 border-gray-500/30'
                      : 'bg-blue-500/20 border-blue-500/30 cursor-pointer hover:bg-blue-500/30'
                    } transition-all`}
                  onClick={() => !attempt && !isLocked && onStartExam(exam.id)}
                  whileHover={!attempt && !isLocked ? { scale: 1.02 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{exam.title}</div>
                      <div className="text-white/70 text-sm">{exam.questions.length} questions</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${attempt
                      ? 'bg-green-500 text-white'
                      : isLocked
                        ? 'bg-gray-500 text-white'
                        : 'bg-blue-500 text-white'
                      }`}>
                      {attempt ? 'Complete' : isLocked ? 'Locked' : 'Available'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Grades</h3>
          <div className="space-y-3">
            {grades.slice(-5).reverse().map(grade => (
              <div key={grade.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">{grade.title}</div>
                  <div className="text-white/70 text-sm capitalize">{grade.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">
                    {grade.score}/{grade.maxScore}
                  </div>
                  <div className="text-white/70 text-xs">
                    {Math.round((grade.score / grade.maxScore) * 100)}%
                  </div>
                </div>
              </div>
            ))}
            {grades.length === 0 && (
              <p className="text-white/60 text-center py-4">No grades yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentGrades: React.FC = () => {
  const grades = getStudentGrades(getUser()!.id);
  const attempts = getStudentAttempts(getUser()!.id);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Grades</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Results */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Exam Results</h3>
          <div className="space-y-3">
            {attempts.map(attempt => {
              const exam = getExams().find(e => e.id === attempt.examId);
              return (
                <div key={attempt.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">{exam?.title}</div>
                    <div className={`text-lg font-bold ${attempt.score >= 90 ? 'text-green-400' :
                      attempt.score >= 80 ? 'text-blue-400' :
                        attempt.score >= 70 ? 'text-yellow-400' :
                          attempt.score >= 60 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                      {Math.round(attempt.score)}%
                    </div>
                  </div>
                  <div className="text-white/70 text-sm">
                    Completed: {new Date(attempt.completedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            {attempts.length === 0 && (
              <p className="text-white/60 text-center py-4">No exam results yet</p>
            )}
          </div>
        </div>

        {/* Other Grades */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Other Grades</h3>
          <div className="space-y-3">
            {grades.map(grade => (
              <div key={grade.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{grade.title}</div>
                    <div className="text-white/70 text-sm capitalize">{grade.type}</div>
                  </div>
                  <div className={`text-lg font-bold ${(grade.score / grade.maxScore) >= 0.9 ? 'text-green-400' :
                    (grade.score / grade.maxScore) >= 0.8 ? 'text-blue-400' :
                      (grade.score / grade.maxScore) >= 0.7 ? 'text-yellow-400' :
                        (grade.score / grade.maxScore) >= 0.6 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                    {grade.score}/{grade.maxScore}
                  </div>
                </div>
                {grade.feedback && (
                  <div className="text-white/80 text-sm bg-white/10 p-2 rounded mt-2">
                    {grade.feedback}
                  </div>
                )}
                <div className="text-white/70 text-xs mt-2">
                  Graded: {new Date(grade.gradedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {grades.length === 0 && (
              <p className="text-white/60 text-center py-4">No other grades yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/70 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-full flex items-center justify-center text-white`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const StudentCard: React.FC<{ student: User }> = ({ student }) => {
  const studentGrades = getStudentGrades(student.id);
  const studentAttempts = getStudentAttempts(student.id);

  const avgGrade = studentGrades.length > 0
    ? studentGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / studentGrades.length
    : 0;

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{student.name}</h3>
          <p className="text-white/70 text-sm">{student.studentId}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Completed Exams</span>
          <span className="text-white">{studentAttempts.length}/6</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Average Grade</span>
          <span className="text-white">{Math.round(avgGrade)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Total Grades</span>
          <span className="text-white">{studentGrades.length}</span>
        </div>
      </div>
    </motion.div>
  );
};

const RecentActivity: React.FC = () => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
    <div className="space-y-3">
      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Award className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm">New exam completed by student</p>
          <p className="text-white/60 text-xs">2 hours ago</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm">New message from student</p>
          <p className="text-white/60 text-xs">4 hours ago</p>
        </div>
      </div>
    </div>
  </div>
);

const QuickActions: React.FC = () => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        className="p-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Add Grade
      </motion.button>
      <motion.button
        className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Send Message
      </motion.button>
      <motion.button
        className="p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View Reports
      </motion.button>
      <motion.button
        className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Exam Settings
      </motion.button>
    </div>
  </div>
);

export default App;