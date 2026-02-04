import { useState, useEffect, useRef } from "react";
import { X, Save, Eye, Code, Bold, Italic, List, ListOrdered, Image, Trash2, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../api/admin.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: question?.title || "",
    question_text: question?.question_text || question?.description || "",
    image_url: question?.image_url || "",
    subject: question?.subject || "",
    difficulty: question?.difficulty || "medium",
    published: question?.published || false,
    points: question?.points || 10,
    time_limit_seconds: question?.time_limit_seconds || question?.time_limit || 60,
    explanation: question?.explanation || "",
    source: question?.source || "Test Bank",
    tags: question?.tags || [],
    choices: question?.choices || [
      { id: "1", text: "", is_correct: false },
      { id: "2", text: "", is_correct: false },
      { id: "3", text: "", is_correct: false },
      { id: "4", text: "", is_correct: false }
    ]
  });

  const [activeTab, setActiveTab] = useState("editor");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await adminAPI.uploadImage(file);
      const imageUrl = response.data.url;
      setFormData({ ...formData, image_url: imageUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove image handler
  const handleRemoveImage = async () => {
    if (formData.image_url) {
      const filename = formData.image_url.split('/').pop();
      try {
        await adminAPI.deleteImage(filename);
      } catch (error) {
        // Ignore delete errors, just remove from form
        console.log('Failed to delete image from server:', error);
      }
      setFormData({ ...formData, image_url: '' });
      toast.success('Image removed');
    }
  };

  // Text editing functions
  const insertText = (before, after = '') => {
    const textarea = document.getElementById('question-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.question_text.substring(start, end);
    
    const newText = 
      formData.question_text.substring(0, start) +
      before + selectedText + after +
      formData.question_text.substring(end);
    
    setFormData({ ...formData, question_text: newText });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleList = () => {
    const textarea = document.getElementById('question-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = formData.question_text.lastIndexOf('\n', start - 1) + 1;
    
    const newText = 
      formData.question_text.substring(0, lineStart) +
      '- ' +
      formData.question_text.substring(lineStart);
    
    setFormData({ ...formData, question_text: newText });
  };

  const handleOrderedList = () => {
    const textarea = document.getElementById('question-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = formData.question_text.lastIndexOf('\n', start - 1) + 1;
    
    const newText = 
      formData.question_text.substring(0, lineStart) +
      '1. ' +
      formData.question_text.substring(lineStart);
    
    setFormData({ ...formData, question_text: newText });
  };

  const insertLatex = () => {
    insertText('$$', '$$');
  };

  const insertInlineLatex = () => {
    insertText('$', '$');
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (question?._id) {
        return adminAPI.updateQuestion(question._id, data);
      } else {
        return adminAPI.createQuestion(data);
      }
    },
    onSuccess: () => {
      toast.success(question ? "Question updated successfully" : "Question created successfully");
      onSave();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save question");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.question_text.trim()) {
      toast.error("Question text is required");
      return;
    } 
    if (formData.choices.filter(c => c.text.trim()).length < 2) {
      toast.error("At least 2 choices are required");
      return;
    }
    if (!formData.choices.some(c => c.is_correct)) {
      toast.error("At least one correct answer is required");
      return;
    }

    // Clean up empty choices
    const cleanedData = {
      ...formData,
      choices: formData.choices.filter(choice => choice.text.trim())
    };

    saveMutation.mutate(cleanedData);
  };

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...formData.choices];
    if (field === 'text') {
      newChoices[index][field] = value;
    } else if (field === 'is_correct') {
      newChoices[index][field] = value;
    }
    setFormData({ ...formData, choices: newChoices });
  };

  const addChoice = () => {
    const newId = String(formData.choices.length + 1);
    setFormData({
      ...formData,
      choices: [...formData.choices, { id: newId, text: "", is_correct: false }]
    });
  };

  const removeChoice = (index) => {
    if (formData.choices.length > 2) {
      const newChoices = formData.choices.filter((_, i) => i !== index);
      setFormData({ ...formData, choices: newChoices });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {question ? "Edit Question" : "Create New Question"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "editor", label: "Editor", icon: Code },
              { id: "preview", label: "Preview", icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            {activeTab === "editor" ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter question title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      required
                      className="input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      <option value="Math">Math</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="French">French</option>
                      <option value="Geology">Geology</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                      <option value="Deutsch">Deutsch</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Mechanics">Mechanics</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="input"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="input"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="600"
                      className="input"
                      value={formData.time_limit_seconds}
                      onChange={(e) => setFormData({ ...formData, time_limit_seconds: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="e.g., Test Bank, Olympiad, ACT"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Text *
                  </label>
                  <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                    {/* Toolbar */}
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                      <button 
                        type="button" 
                        onClick={handleBold}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Bold (**text**)"
                      >
                        <Bold className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        type="button" 
                        onClick={handleItalic}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Italic (*text*)"
                      >
                        <Italic className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        type="button" 
                        onClick={handleList}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        type="button" 
                        onClick={handleOrderedList}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        type="button" 
                        onClick={insertLatex}
                        className="px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-mono text-gray-600 dark:text-gray-400"
                        title="Insert LaTeX Display ($$formula$$)"
                      >
                        $$
                      </button>
                      <button 
                        type="button" 
                        onClick={insertInlineLatex}
                        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-mono text-gray-600 dark:text-gray-400"
                        title="Insert Inline LaTeX ($formula$)"
                      >
                        $
                      </button>
                      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        Markdown & LaTeX supported • Try: $$x^2 + y^2 = z^2$$
                      </div>
                    </div>
                    <textarea
                      id="question-textarea"
                      required
                      rows={5}
                      className="w-full p-4 border-0 focus:ring-0 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      placeholder="Enter your question here... You can use **bold**, *italic*, and $$LaTeX$$ formatting"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Use **text** for bold, *text* for italic, and $$x^2 + y^2 = z^2$$ for math equations
                  </p>
                </div>

                {/* Question Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/30">
                    {formData.image_url ? (
                      <div className="relative">
                        <img 
                          src={`${API_BASE_URL}${formData.image_url}`}
                          alt="Question" 
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="question-image-upload"
                        />
                        <label
                          htmlFor="question-image-upload"
                          className={`cursor-pointer inline-flex flex-col items-center justify-center p-6 ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                          } rounded-lg transition-colors`}
                        >
                          {isUploading ? (
                            <>
                              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Click to upload an image
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                PNG, JPG, GIF up to 5MB
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Choices */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Answer Choices *
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.choices.length} options (min: 2)
                    </span>
                  </div>
                  <div className="space-y-3">
                    {formData.choices.map((choice, index) => (
                      <div key={index} className="group relative">
                        <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                          choice.is_correct 
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20' 
                            : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800/50'
                        } hover:shadow-md`}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`choice-${index}`}
                              checked={choice.is_correct}
                              onChange={(e) => handleChoiceChange(index, 'is_correct', e.target.checked)}
                              className="w-5 h-5 text-emerald-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded focus:ring-emerald-500 focus:ring-2"
                            />
                            <label htmlFor={`choice-${index}`} className={`ml-3 text-sm font-medium ${
                              choice.is_correct 
                                ? 'text-emerald-700 dark:text-emerald-300' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {choice.is_correct ? '✓ Correct' : 'Mark as Correct'}
                            </label>
                          </div>
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 border-0 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                            value={choice.text}
                            onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                            placeholder={`Enter choice ${index + 1}...`}
                          />
                          {formData.choices.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeChoice(index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove this choice"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addChoice}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <span className="text-lg">+</span> Add Another Choice
                    </button>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Provide an explanation for the correct answer..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Publication Status
                  </label>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="published" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formData.published ? '🌟 Published (Visible to Students)' : '📝 Draft (Hidden from Students)'}
                      </label>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formData.published 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {formData.published ? 'LIVE' : 'DRAFT'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <QuestionPreview question={formData} />
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isLoading}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isLoading ? "Saving..." : "Save Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// LaTeX Renderer Component
const LaTeXRenderer = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!text || !containerRef.current) return;

    // Load KaTeX dynamically if not already loaded
    if (!window.katex) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.onload = () => {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        document.head.appendChild(cssLink);
        renderMath();
      };
      document.head.appendChild(script);
    } else {
      renderMath();
    }

    function renderMath() {
      const container = containerRef.current;
      if (!container) return;

      // Process the text to render LaTeX
      let processedText = text
        // Bold text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic text  
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Bullet lists
        .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
        // Numbered lists
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
        // Line breaks
        .replace(/\n/g, '<br>');

      container.innerHTML = processedText;

      // Find and render LaTeX expressions
      const latexRegex = /\$\$([^$]+)\$\$/g;
      const matches = [...text.matchAll(latexRegex)];

      matches.forEach((match) => {
        try {
          const latex = match[1];
          const span = document.createElement('span');
          span.className = 'katex-display inline-block mx-2';
          
          window.katex.render(latex, span, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#cc0000'
          });

          // Replace the LaTeX in the HTML
          container.innerHTML = container.innerHTML.replace(
            match[0],
            span.outerHTML
          );
        } catch (error) {
          console.error('LaTeX rendering error:', error);
        }
      });

      // Handle inline LaTeX $...$
      const inlineLatexRegex = /\$([^$]+)\$/g;
      const inlineMatches = [...text.matchAll(inlineLatexRegex)];

      inlineMatches.forEach((match) => {
        try {
          const latex = match[1];
          const span = document.createElement('span');
          span.className = 'katex-inline';
          
          window.katex.render(latex, span, {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000'
          });

          container.innerHTML = container.innerHTML.replace(
            match[0],
            span.outerHTML
          );
        } catch (error) {
          console.error('Inline LaTeX rendering error:', error);
        }
      });
    }
  }, [text]);

  return (
    <div 
      ref={containerRef}
      className="text-gray-800 dark:text-gray-200 leading-relaxed"
    />
  );
};

// Question Preview Component
const QuestionPreview = ({ question }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {question.subject} • {question.difficulty} • {question.points} points
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {question.time_limit_seconds}s
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {question.title || "Question Title"}
        </h3>
      </div>

      <div className="mb-6">
        <div className="prose dark:prose-invert max-w-none">
          {question.question_text ? (
            <LaTeXRenderer text={question.question_text} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">Question text will appear here...</p>
          )}
        </div>

        {/* Question Image */}
        {question.image_url && (
          <div className="mt-4">
            <img 
              src={`${API_BASE_URL}${question.image_url}`}
              alt="Question illustration" 
              className="max-w-full rounded-lg shadow-md mx-auto"
            />
          </div>
        )}
        
        {/* Show formatting hints */}
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <strong>Formatting Preview:</strong>
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• <strong>**text**</strong> renders as <strong>bold text</strong></li>
            <li>• <strong>*text*</strong> renders as <em>italic text</em></li>
            <li>• <strong>$$x^2$$</strong> renders as actual LaTeX equations</li>
            <li>• <strong>$inline$</strong> for inline math formulas</li>
            <li>• Line breaks are preserved</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        {question.choices?.map((choice, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              choice.is_correct
                ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {String.fromCharCode(65 + index)}
              </span>
              <div className="flex-1">
                {choice.text ? (
                  <LaTeXRenderer text={choice.text} />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Choice {index + 1}</span>
                )}
              </div>
              {choice.is_correct && (
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium ml-auto">
                  ✓ Correct
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Explanation:</h4>
          <div className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
            <LaTeXRenderer text={question.explanation} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;