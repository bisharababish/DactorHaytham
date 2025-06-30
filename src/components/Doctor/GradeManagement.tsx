import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Save, X, BookOpen, User, Calendar, Search } from 'lucide-react';
import { Grade, User as UserType } from '../../types';
import { getGrades, saveGrade, getStudentGrades } from '../../utils/storage';
import { getAllUsers, getUser } from '../../utils/auth';

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<UserType[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newGrade, setNewGrade] = useState({
    type: 'exam' as Grade['type'],
    title: '',
    score: '',
    maxScore: '',
    feedback: ''
  });

  const currentUser = getUser();

  useEffect(() => {
    const allUsers = getAllUsers();
    const studentUsers = allUsers.filter(user => user.role === 'student');
    setStudents(studentUsers);
    
    const allGrades = getGrades();
    setGrades(allGrades);
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const handleAddGrade = () => {
    if (!selectedStudent || !newGrade.title || !newGrade.score || !newGrade.maxScore) {
      return;
    }

    const grade: Grade = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      type: newGrade.type,
      title: newGrade.title,
      score: parseFloat(newGrade.score),
      maxScore: parseFloat(newGrade.maxScore),
      feedback: newGrade.feedback || undefined,
      gradedAt: new Date().toISOString(),
      gradedBy: currentUser!.id
    };

    saveGrade(grade);
    setGrades(prev => [...prev, grade]);
    setNewGrade({
      type: 'exam',
      title: '',
      score: '',
      maxScore: '',
      feedback: ''
    });
    setIsAddingGrade(false);
  };

  const handleUpdateGrade = (gradeId: string, updatedGrade: Partial<Grade>) => {
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) return;

    const updated = { ...grade, ...updatedGrade };
    saveGrade(updated);
    setGrades(prev => prev.map(g => g.id === gradeId ? updated : g));
    setEditingGrade(null);
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTypeIcon = (type: Grade['type']) => {
    switch (type) {
      case 'exam': return '📝';
      case 'assignment': return '📋';
      case 'participation': return '🗣️';
      case 'project': return '💼';
      default: return '📚';
    }
  };

  const studentGrades = selectedStudent ? grades.filter(g => g.studentId === selectedStudent) : grades;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Grade Management</h2>
        <motion.button
          onClick={() => setIsAddingGrade(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Grade</span>
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Search Students
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or student ID..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
              />
            </div>
          </div>
          
          <div className="lg:w-64">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Filter by Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
            >
              <option value="">All Students</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id} className="bg-gray-800">
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Grade Form */}
      {isAddingGrade && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Add New Grade</h3>
            <button
              onClick={() => setIsAddingGrade(false)}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id} className="bg-gray-800">
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Type</label>
              <select
                value={newGrade.type}
                onChange={(e) => setNewGrade({ ...newGrade, type: e.target.value as Grade['type'] })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
              >
                <option value="exam" className="bg-gray-800">Exam</option>
                <option value="assignment" className="bg-gray-800">Assignment</option>
                <option value="participation" className="bg-gray-800">Participation</option>
                <option value="project" className="bg-gray-800">Project</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={newGrade.title}
                onChange={(e) => setNewGrade({ ...newGrade, title: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                placeholder="Grade title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Score</label>
                <input
                  type="number"
                  value={newGrade.score}
                  onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  placeholder="Score"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Max Score</label>
                <input
                  type="number"
                  value={newGrade.maxScore}
                  onChange={(e) => setNewGrade({ ...newGrade, maxScore: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  placeholder="Max"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white/80 text-sm font-medium mb-2">Feedback (Optional)</label>
            <textarea
              value={newGrade.feedback}
              onChange={(e) => setNewGrade({ ...newGrade, feedback: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
              rows={3}
              placeholder="Optional feedback for the student..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddingGrade(false)}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleAddGrade}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Grade
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Grades List */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">
            {selectedStudent ? `Grades for ${getStudentName(selectedStudent)}` : 'All Grades'}
          </h3>
          <p className="text-white/70 text-sm">
            {studentGrades.length} grade{studentGrades.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {studentGrades.map((grade) => (
                <motion.tr
                  key={grade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-white font-medium">
                        {getStudentName(grade.studentId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(grade.type)}</span>
                      <span className="text-white/80 capitalize">{grade.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {grade.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getGradeColor(grade.score, grade.maxScore)}`}>
                        {grade.score}/{grade.maxScore}
                      </span>
                      <span className="text-white/60 text-sm">
                        ({Math.round((grade.score / grade.maxScore) * 100)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/80">
                    {new Date(grade.gradedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={() => setEditingGrade(grade.id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {studentGrades.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No grades found</p>
              <p className="text-white/40 text-sm">Add some grades to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;