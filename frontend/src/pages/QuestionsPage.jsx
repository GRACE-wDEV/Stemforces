import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Filter, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import QuestionCard from "../components/QuestionCard";

export default function QuestionsPage() {
  const { subject, source } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["questions", subject, source],
    queryFn: async () => {
      const res = await api.get(`/questions?subject=${subject}&source=${source}`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center card max-w-md">
          <div className="text-red-500 mb-4">
            <BookOpen className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Questions</h3>
          <p className="text-red-600">Unable to fetch questions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {subject} Questions
                </h1>
                <p className="text-gray-600 mt-1">
                  Source: {source} • {data?.questions?.length || 0} questions available
                </p>
              </div>
            </div>
            
            {/* action buttons */}
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        {data?.questions?.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.questions.map((question, index) => (
              <div key={question._id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <QuestionCard question={question} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="card max-w-md mx-auto">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h3>
              <p className="text-gray-600">
                No questions available for {subject} from {source}. Check back later for updates!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}