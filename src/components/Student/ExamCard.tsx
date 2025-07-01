import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Play, CheckCircle, Lock } from 'lucide-react';
import { Exam, ExamAttempt } from '../../types';

interface ExamCardProps {
  exam: Exam;
  attempt?: ExamAttempt;
  onStartExam: (examId: string) => void;
  isLocked?: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, attempt, onStartExam, isLocked = false }) => {
  const getStatusColor = () => {
    if (isLocked) return 'from-gray-500 to-gray-600';
    if (attempt) return 'from-green-500 to-green-600';
    return 'from-gray-700 to-black';
  };

  const getStatusIcon = () => {
    if (isLocked) return <Lock className="h-5 w-5" />;
    if (attempt) return <CheckCircle className="h-5 w-5" />;
    return <Play className="h-5 w-5" />;
  };

  const getStatusText = () => {
    if (isLocked) return 'Locked';
    if (attempt) return 'Completed';
    return 'Start Exam';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{exam.title}</h3>
          <p className="text-white/70 text-sm mb-3">{exam.description}</p>

          <div className="flex items-center space-x-4 text-sm text-white/60">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{exam.questions.length} Questions</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{exam.duration} Minutes</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-1">
            {exam.moduleNumber}
          </div>
          <div className="text-xs text-white/60">Module</div>
        </div>
      </div>

      {attempt && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm font-medium">Completed</span>
            <span className="text-green-400 text-sm">
              {new Date(attempt.completedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      <motion.button
        onClick={() => !isLocked && !attempt && onStartExam(exam.id)}
        disabled={isLocked || !!attempt}
        className={`w-full bg-gradient-to-r ${getStatusColor()} text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
        whileHover={!isLocked && !attempt ? { scale: 1.02 } : {}}
        whileTap={!isLocked && !attempt ? { scale: 0.98 } : {}}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </motion.button>
    </motion.div>
  );
};

export default ExamCard;