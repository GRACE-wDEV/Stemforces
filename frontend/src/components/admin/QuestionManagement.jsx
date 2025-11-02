import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import QuestionEditor from './QuestionEditor';

const QuestionManagement = () => {
  const [page, setPage] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    published: ''
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-questions', page, filters],
    queryFn: () => adminAPI.getQuestions({ page, ...filters }),
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Question Management</h1>
          <button 
            onClick={() => setShowEditor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
        <div className="text-center py-8">Loading questions...</div>
        
        {/* Question Editor Modal */}
        {showEditor && (
          <QuestionEditor
            question={selectedQuestion}
            onSave={() => {
              setShowEditor(false);
              setSelectedQuestion(null);
              queryClient.invalidateQueries(['admin-questions']);
            }}
            onCancel={() => {
              setShowEditor(false);
              setSelectedQuestion(null);
            }}
          />
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Question Management</h1>
          <button 
            onClick={() => setShowEditor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
        <div className="text-center py-8 text-red-600">
          Error loading questions: {error?.message || 'Unknown error'}
        </div>
        
        {/* Question Editor Modal */}
        {showEditor && (
          <QuestionEditor
            question={selectedQuestion}
            onSave={() => {
              setShowEditor(false);
              setSelectedQuestion(null);
              queryClient.invalidateQueries(['admin-questions']);
            }}
            onCancel={() => {
              setShowEditor(false);
              setSelectedQuestion(null);
            }}
          />
        )}
      </div>
    );
  }

  const questions = data?.data?.questions || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Question Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage quiz questions</p>
          </div>
          <button 
            onClick={() => setShowEditor(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      
        
        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
            </select>
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <select
              value={filters.published}
              onChange={(e) => setFilters(prev => ({ ...prev, published: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
            
            <button
              onClick={() => {
                setFilters({ subject: '', difficulty: '', published: '' });
                setPage(1);
              }}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>        {/* Questions List */}
        <div className="space-y-4 mb-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="text-gray-500 dark:text-gray-400 text-lg">
                No questions found
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Create your first question to get started
              </p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{question.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    question.published 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  }`}>
                    {question.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex flex-wrap gap-4">
                  <span className="flex items-center">
                    <span className="font-medium">Subject:</span>
                    <span className="ml-1">{question.subject}</span>
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium">Difficulty:</span>
                    <span className="ml-1">{question.difficulty}</span>
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium">Points:</span>
                    <span className="ml-1">{question.points}</span>
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{question.description}</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowEditor(true);
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Delete
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    question.published 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}>
                    {question.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-900 dark:text-white font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Question Editor Modal */}
        {showEditor && (
          <QuestionEditor
            question={selectedQuestion}
            onSave={() => {
              setShowEditor(false);
              setSelectedQuestion(null);
              queryClient.invalidateQueries(['admin-questions']);
            }}
            onCancel={() => {
              setShowEditor(false);
              setSelectedQuestion(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionManagement;
