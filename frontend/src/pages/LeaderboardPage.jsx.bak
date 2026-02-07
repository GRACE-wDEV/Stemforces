import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Crown, User, TrendingUp } from "lucide-react";
import api from "../api/axios.js";

export default function LeaderboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await api.get("/leaderboard");
      return res.data;
    }
  });

  const leaderboardData = data?.success ? data.data.leaderboard : (Array.isArray(data?.leaderboard) ? data.leaderboard : []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-[var(--text-tertiary)]">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="card p-8 max-w-md text-center">
          <Trophy className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Unable to Load Leaderboard</h3>
          <p className="text-[var(--error)]">Please try again later.</p>
        </div>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <div className="leaderboard-rank gold">1</div>;
      case 2:
        return <div className="leaderboard-rank silver">2</div>;
      case 3:
        return <div className="leaderboard-rank bronze">3</div>;
      default:
        return <div className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-[var(--text-tertiary)]">{rank}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 pb-28 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Leaderboard</h1>
                <p className="text-[var(--text-secondary)]">Top performers in STEM challenges</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
              <TrendingUp className="w-4 h-4" />
              <span>Updated in real-time</span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboardData && leaderboardData.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <div className="card p-4 text-center order-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
                <Medal className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {leaderboardData[1]?.username || leaderboardData[1]?.name}
              </p>
              <p className="text-2xl font-bold text-[var(--text-secondary)]">
                {leaderboardData[1]?.total_xp || leaderboardData[1]?.score}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">2nd Place</p>
            </div>

            {/* 1st Place */}
            <div className="card p-4 text-center order-2 border-2 border-yellow-400/50 -mt-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {leaderboardData[0]?.username || leaderboardData[0]?.name}
              </p>
              <p className="text-3xl font-bold text-yellow-500">
                {leaderboardData[0]?.total_xp || leaderboardData[0]?.score}
              </p>
              <p className="text-xs text-yellow-500 font-medium">🏆 Champion</p>
            </div>

            {/* 3rd Place */}
            <div className="card p-4 text-center order-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {leaderboardData[2]?.username || leaderboardData[2]?.name}
              </p>
              <p className="text-2xl font-bold text-[var(--text-secondary)]">
                {leaderboardData[2]?.total_xp || leaderboardData[2]?.score}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">3rd Place</p>
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="card">
          <div className="p-5 border-b border-[var(--border-primary)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Complete Rankings</h2>
          </div>

          <div className="divide-y divide-[var(--border-primary)]">
            {leaderboardData.map((user, index) => {
              const rank = index + 1;
              const maxScore = (leaderboardData[0]?.total_xp || leaderboardData[0]?.score) || 1;
              const userScore = user.total_xp || user.score || 0;
              const progressPercent = (userScore / maxScore) * 100;

              return (
                <div 
                  key={user._id || user.id} 
                  className="flex items-center gap-4 p-4 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  {/* Rank */}
                  {getRankBadge(rank)}

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="avatar avatar-md bg-[var(--brand-primary)]">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {user.username || user.name}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        Level {user.level || 1} • {user.total_questions_correct || 0} correct
                      </p>
                    </div>
                  </div>

                  {/* Score & Progress */}
                  <div className="text-right">
                    <p className="font-bold text-[var(--text-primary)]">
                      {userScore} <span className="text-sm font-normal text-[var(--text-tertiary)]">XP</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--brand-primary)] rounded-full"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] w-8">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {(!leaderboardData || leaderboardData.length === 0) && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">No Rankings Yet</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                Be the first to answer questions and climb the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
