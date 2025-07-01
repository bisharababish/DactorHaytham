import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Exam, ExamAttempt } from '../../types';
import { saveExamAttempt } from '../../utils/storage';
import { getUser } from '../../utils/auth';

interface ExamInterfaceProps {
  exam: Exam;
  onComplete: (attempt: ExamAttempt) => void;
  onBack: () => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ exam, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(exam.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const user = getUser();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / exam.questions.length) * 100;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const score = calculateScore();
    const duration = Math.round((Date.now() - startTime) / 1000 / 60); // Convert to minutes

    const attempt: ExamAttempt = {
      id: Date.now().toString(),
      examId: exam.id,
      studentId: user!.id,
      answers,
      score,
      completedAt: new Date().toISOString(),
      duration
    };

    saveExamAttempt(attempt);
    onComplete(attempt);
  };

  const answeredQuestions = answers.filter(answer => answer !== -1).length;
  const progress = (answeredQuestions / exam.questions.length) * 100;

  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-white">{exam.title}</h1>
                <p className="text-white/70 text-sm">Question {currentQuestion + 1} of {exam.questions.length}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-gray-700 to-black h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-white/70 text-sm mt-2">
            {answeredQuestions} of {exam.questions.length} questions answered
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-6"
          >
            <div className="mb-6">
              <div className="text-sm text-white/60 mb-2">Question {currentQuestion + 1}</div>
              <h2 className="text-xl text-white font-medium leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${answers[currentQuestion] === index
                    ? 'bg-blue-500/20 border-blue-500/50 text-white'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                    }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion] === index
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-white/30'
                      }`}>
                      {answers[currentQuestion] === index && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{String.fromCharCode(65 + index)}. {option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </motion.button>

          <div className="flex items-center space-x-2">
            {exam.questions.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${index === currentQuestion
                  ? 'bg-blue-500 text-white'
                  : answers[index] !== -1
                    ? 'bg-green-500/50 text-white'
                    : 'bg-white/20 text-white/70 hover:bg-white/30'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          {currentQuestion === exam.questions.length - 1 ? (
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit Exam</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Warning for unanswered questions */}
        {answeredQuestions < exam.questions.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="text-yellow-400">
              <div className="font-medium">Incomplete Questions</div>
              <div className="text-sm text-yellow-400/80">
                {exam.questions.length - answeredQuestions} questions remaining. Make sure to answer all questions before submitting.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExamInterface;