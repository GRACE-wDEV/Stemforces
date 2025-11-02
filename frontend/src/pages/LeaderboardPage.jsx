import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Crown, User, TrendingUp, Loader2 } from "lucide-react";
import api from "../api/axios.js";

export default function LeaderboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await api.get("/leaderboard");
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center card max-w-md">
          <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Leaderboard</h3>
          <p className="text-red-600 dark:text-red-400">Please try again later.</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBackgroundColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Top performers in STEM challenges</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>Updated in real-time</span>
            </div>
          </div>
        </div>

        {/* top 3 podium */}
        {data && data.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">🏆 Top Performers 🏆</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="md:order-1 flex flex-col items-center">
                <div className="card w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-500"></div>
                  <div className="pt-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{data[1]?.name}</h3>
                    <p className="text-3xl font-bold text-gray-600 dark:text-gray-300 mb-2">{data[1]?.score}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2nd Place</p>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="md:order-2 flex flex-col items-center">
                <div className="card w-full text-center relative overflow-hidden transform md:scale-110">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                  <div className="pt-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{data[0]?.name}</h3>
                    <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{data[0]?.score}</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">🏆 Champion</p>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 flex flex-col items-center">
                <div className="card w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                  <div className="pt-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{data[2]?.name}</h3>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{data[2]?.score}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">3rd Place</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* full Leaderboard table */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Complete Rankings</h2>
            <p className="text-gray-600 dark:text-gray-300">All participants and their scores</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Student</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">Score</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">Progress</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(data) ? data : []).map((user, index) => {
                  const rank = index + 1;
                  const maxScore = (Array.isArray(data) && data[0]?.score) || 1;
                  const progressPercent = (user.score / maxScore) * 100;

                  return (
                    <tr 
                      key={user._id} 
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {getRankIcon(rank)}
                          {rank <= 3 && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRankBackgroundColor(rank)}`}>
                              TOP {rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{user.score}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">pts</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(!data || data.length === 0) && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Rankings Yet</h3>
              <p className="text-gray-600 dark:text-gray-300">Be the first to answer questions and climb the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
