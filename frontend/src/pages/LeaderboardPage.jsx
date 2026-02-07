import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { calculateLevel, getLevelTitle, getLevelColor, formatXP } from "../utils/levelUtils";
import api from "../api/axios.js";
import {
  Trophy, Crown, Medal, Award, User, TrendingUp, Flame, Target,
  BookOpen, Zap, ChevronDown, Search, X, Clock, Star, Shield
} from "lucide-react";

/* ─── Constants ─── */
const TIMEFRAMES = [
  { id: "all", label: "All Time", icon: <Trophy size={14} /> },
  { id: "month", label: "This Month", icon: <Clock size={14} /> },
  { id: "week", label: "This Week", icon: <Flame size={14} /> },
];

const SUBJECTS = [
  "Math", "Arabic", "Physics", "Chemistry", "English",
  "Deutsch", "Earth Science", "French", "Biology"
];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  // Global leaderboard
  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ["leaderboard", timeframe],
    queryFn: async () => {
      const res = await api.get(`/leaderboard?timeframe=${timeframe}&limit=100`);
      return res.data;
    },
    enabled: !selectedSubject,
  });

  // Subject leaderboard
  const { data: subjectData, isLoading: subjectLoading } = useQuery({
    queryKey: ["leaderboard-subject", selectedSubject],
    queryFn: async () => {
      const res = await api.get(`/leaderboard/subject/${encodeURIComponent(selectedSubject)}?limit=100`);
      return res.data;
    },
    enabled: !!selectedSubject,
  });

  // User's own ranking
  const { data: myRank } = useQuery({
    queryKey: ["my-ranking"],
    queryFn: async () => {
      const res = await api.get("/leaderboard/me");
      return res.data?.data;
    },
    enabled: !!user,
  });

  const isLoading = selectedSubject ? subjectLoading : globalLoading;
  const rawData = useMemo(() => {
    return selectedSubject
      ? subjectData?.data?.leaderboard || []
      : globalData?.data?.leaderboard || globalData?.leaderboard || [];
  }, [selectedSubject, subjectData, globalData]);

  // Search filter
  const leaderboard = useMemo(() => {
    if (!searchQuery.trim()) return rawData;
    const q = searchQuery.toLowerCase();
    return rawData.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q)
    );
  }, [rawData, searchQuery]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const myGlobalRank = myRank?.userStats?.globalRank;
  const myXP = myRank?.userStats?.total_xp || 0;
  const myLevel = calculateLevel(myXP);

  const getRankDisplay = (rank) => {
    if (rank === 1)
      return (
        <div className="lb-rank-badge gold">
          <Crown size={16} />
        </div>
      );
    if (rank === 2)
      return (
        <div className="lb-rank-badge silver">
          <Medal size={16} />
        </div>
      );
    if (rank === 3)
      return (
        <div className="lb-rank-badge bronze">
          <Award size={16} />
        </div>
      );
    return <div className="lb-rank-num">{rank}</div>;
  };

  return (
    <div className="lb">
      {/* ═══ HERO ═══ */}
      <section className="lb-hero">
        <div className="lb-hero-bg" />
        <div className="lb-hero-inner">
          <div className="lb-hero-left">
            <div className="lb-trophy-wrap">
              <Trophy size={32} />
            </div>
            <div>
              <h1 className="lb-title">Leaderboard</h1>
              <p className="lb-subtitle">Top performers in STEM challenges</p>
            </div>
          </div>

          {/* Your Rank Card */}
          {user && myGlobalRank && (
            <div className="lb-my-rank">
              <div className="lb-my-rank-num">#{myGlobalRank}</div>
              <div className="lb-my-rank-info">
                <span className="lb-my-rank-name">{user.name}</span>
                <span className="lb-my-rank-meta">
                  <span style={{ color: getLevelColor(myLevel) }}>{getLevelTitle(myLevel)}</span>
                  {" · "}
                  {formatXP(myXP)} XP
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CONTROLS ═══ */}
      <section className="lb-controls">
        {/* Timeframe tabs */}
        <div className="lb-timeframe-tabs">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              className={`lb-tf-tab ${timeframe === tf.id && !selectedSubject ? "active" : ""}`}
              onClick={() => {
                setTimeframe(tf.id);
                setSelectedSubject(null);
                setShowSubjectPicker(false);
              }}
            >
              {tf.icon} {tf.label}
            </button>
          ))}
          <button
            className={`lb-tf-tab ${selectedSubject ? "active" : ""}`}
            onClick={() => setShowSubjectPicker(!showSubjectPicker)}
          >
            <BookOpen size={14} /> {selectedSubject || "By Subject"} <ChevronDown size={12} />
          </button>
        </div>

        {/* Search */}
        <div className="lb-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="lb-search-clear" onClick={() => setSearchQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      {/* Subject picker dropdown */}
      {showSubjectPicker && (
        <section className="lb-subject-picker">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              className={`lb-subj-btn ${selectedSubject === s ? "active" : ""}`}
              onClick={() => {
                setSelectedSubject(s);
                setShowSubjectPicker(false);
              }}
            >
              {s}
            </button>
          ))}
          {selectedSubject && (
            <button
              className="lb-subj-btn clear"
              onClick={() => {
                setSelectedSubject(null);
                setShowSubjectPicker(false);
              }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </section>
      )}

      {/* ═══ PODIUM (top 3) ═══ */}
      {!isLoading && !selectedSubject && top3.length >= 3 && !searchQuery && (
        <section className="lb-podium">
          {/* 2nd */}
          <div className="lb-podium-card second">
            <div className="lb-podium-medal silver"><Medal size={22} /></div>
            <div className="lb-podium-avatar" style={{ borderColor: getLevelColor(calculateLevel(top3[1]?.total_xp || 0)) }}>
              {(top3[1]?.name || top3[1]?.username || "?").charAt(0).toUpperCase()}
            </div>
            <h4 className="lb-podium-name">{top3[1]?.name || top3[1]?.username}</h4>
            <span className="lb-podium-title" style={{ color: getLevelColor(calculateLevel(top3[1]?.total_xp || 0)) }}>
              {getLevelTitle(calculateLevel(top3[1]?.total_xp || 0))}
            </span>
            <div className="lb-podium-xp">{formatXP(top3[1]?.total_xp || top3[1]?.score || 0)}</div>
            <div className="lb-podium-label">XP</div>
            <div className="lb-podium-pillar second-pillar" />
          </div>

          {/* 1st */}
          <div className="lb-podium-card first">
            <div className="lb-podium-medal gold"><Crown size={24} /></div>
            <div className="lb-podium-avatar champion" style={{ borderColor: getLevelColor(calculateLevel(top3[0]?.total_xp || 0)) }}>
              {(top3[0]?.name || top3[0]?.username || "?").charAt(0).toUpperCase()}
            </div>
            <h4 className="lb-podium-name">{top3[0]?.name || top3[0]?.username}</h4>
            <span className="lb-podium-title" style={{ color: getLevelColor(calculateLevel(top3[0]?.total_xp || 0)) }}>
              {getLevelTitle(calculateLevel(top3[0]?.total_xp || 0))}
            </span>
            <div className="lb-podium-xp champion-xp">{formatXP(top3[0]?.total_xp || top3[0]?.score || 0)}</div>
            <div className="lb-podium-label">XP</div>
            <div className="lb-podium-pillar first-pillar" />
          </div>

          {/* 3rd */}
          <div className="lb-podium-card third">
            <div className="lb-podium-medal bronze"><Award size={20} /></div>
            <div className="lb-podium-avatar" style={{ borderColor: getLevelColor(calculateLevel(top3[2]?.total_xp || 0)) }}>
              {(top3[2]?.name || top3[2]?.username || "?").charAt(0).toUpperCase()}
            </div>
            <h4 className="lb-podium-name">{top3[2]?.name || top3[2]?.username}</h4>
            <span className="lb-podium-title" style={{ color: getLevelColor(calculateLevel(top3[2]?.total_xp || 0)) }}>
              {getLevelTitle(calculateLevel(top3[2]?.total_xp || 0))}
            </span>
            <div className="lb-podium-xp">{formatXP(top3[2]?.total_xp || top3[2]?.score || 0)}</div>
            <div className="lb-podium-label">XP</div>
            <div className="lb-podium-pillar third-pillar" />
          </div>
        </section>
      )}

      {/* ═══ LOADING ═══ */}
      {isLoading && (
        <div className="lb-loading">
          <div className="lb-spinner" />
          <p>Loading rankings...</p>
        </div>
      )}

      {/* ═══ TABLE ═══ */}
      {!isLoading && leaderboard.length > 0 && (
        <section className="lb-table-wrap">
          <div className="lb-table-header">
            <span className="lb-th rank">Rank</span>
            <span className="lb-th player">Player</span>
            {selectedSubject ? (
              <>
                <span className="lb-th stat">Correct</span>
                <span className="lb-th stat">Avg Score</span>
                <span className="lb-th stat hide-mobile">Best</span>
              </>
            ) : (
              <>
                <span className="lb-th stat">XP</span>
                <span className="lb-th stat">Streak</span>
                <span className="lb-th stat hide-mobile">Quizzes</span>
              </>
            )}
          </div>

          <div className="lb-table-body">
            {(searchQuery ? leaderboard : rest.length > 0 ? rest : leaderboard).map((entry, idx) => {
              const rank = searchQuery
                ? rawData.indexOf(entry) + 1
                : (rest.length > 0 ? idx + 4 : idx + 1);
              const xp = entry.total_xp || entry.score || 0;
              const level = calculateLevel(xp);
              const color = getLevelColor(level);
              const title = getLevelTitle(level);
              const isMe = user && (entry.name === user.name || entry.username === user.name);
              const maxXP = rawData[0]?.total_xp || rawData[0]?.score || 1;
              const pct = Math.round((xp / maxXP) * 100);

              return (
                <div key={entry._id || idx} className={`lb-row ${isMe ? "me" : ""} ${rank <= 3 ? `top-${rank}` : ""}`}>
                  <div className="lb-cell rank">{getRankDisplay(rank)}</div>
                  <div className="lb-cell player">
                    <div className="lb-player-avatar" style={{ borderColor: color }}>
                      {(entry.name || entry.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="lb-player-info">
                      <span className="lb-player-name">
                        {entry.name || entry.username}
                        {isMe && <span className="lb-you-tag">YOU</span>}
                      </span>
                      <span className="lb-player-title" style={{ color }}>
                        {selectedSubject ? `${entry.questions_correct || 0}/${entry.questions_attempted || 0} correct` : title}
                      </span>
                    </div>
                  </div>
                  {selectedSubject ? (
                    <>
                      <div className="lb-cell stat">
                        <span className="lb-stat-main">{entry.questions_correct || 0}</span>
                      </div>
                      <div className="lb-cell stat">
                        <span className="lb-stat-main">{entry.average_score || 0}%</span>
                      </div>
                      <div className="lb-cell stat hide-mobile">
                        <span className="lb-stat-main">{entry.best_score || 0}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="lb-cell stat">
                        <div className="lb-xp-cell">
                          <span className="lb-stat-main">{formatXP(xp)}</span>
                          <div className="lb-xp-micro-bar">
                            <div className="lb-xp-micro-fill" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      </div>
                      <div className="lb-cell stat">
                        <span className="lb-stat-main">
                          {entry.current_streak || 0}
                          {entry.current_streak > 0 && <Flame size={12} className="lb-flame" />}
                        </span>
                      </div>
                      <div className="lb-cell stat hide-mobile">
                        <span className="lb-stat-main">{entry.total_quizzes_completed || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ EMPTY ═══ */}
      {!isLoading && leaderboard.length === 0 && (
        <div className="lb-empty">
          {searchQuery ? (
            <>
              <Search size={36} />
              <h3>No players match &quot;{searchQuery}&quot;</h3>
              <button className="lb-btn" onClick={() => setSearchQuery("")}>Clear search</button>
            </>
          ) : (
            <>
              <Trophy size={36} />
              <h3>No Rankings Yet</h3>
              <p>Be the first to answer questions and climb the leaderboard!</p>
            </>
          )}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const styles = `
/* ── Base ── */
.lb { min-height: calc(100vh - 64px); background: var(--bg-primary); padding-bottom: 100px; }

/* ═══ HERO ═══ */
.lb-hero {
  position: relative; overflow: hidden;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);
}
.lb-hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(249,115,22,0.04) 50%, transparent 100%);
}
.lb-hero-inner {
  position: relative; max-width: 900px; margin: 0 auto;
  padding: 28px 20px; display: flex; align-items: center;
  justify-content: space-between; gap: 20px; flex-wrap: wrap;
}
.lb-hero-left { display: flex; align-items: center; gap: 16px; }
.lb-trophy-wrap {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, #eab308, #f97316);
  display: flex; align-items: center; justify-content: center; color: white;
}
.lb-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: var(--text-primary); }
.lb-subtitle { margin: 2px 0 0; color: var(--text-tertiary); font-size: 0.85rem; }

/* My rank card */
.lb-my-rank {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; background: var(--bg-tertiary);
  border: 1px solid var(--border-color); border-radius: 12px;
}
.lb-my-rank-num {
  font-size: 1.3rem; font-weight: 800; color: var(--primary);
  min-width: 44px; text-align: center;
}
.lb-my-rank-info { display: flex; flex-direction: column; }
.lb-my-rank-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.lb-my-rank-meta { font-size: 0.72rem; color: var(--text-tertiary); }

/* ═══ CONTROLS ═══ */
.lb-controls {
  max-width: 900px; margin: 0 auto; padding: 16px 20px 0;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.lb-timeframe-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.lb-tf-tab {
  display: flex; align-items: center; gap: 5px; padding: 7px 14px;
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px;
  color: var(--text-tertiary); font-size: 0.8rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.lb-tf-tab:hover { border-color: var(--primary); color: var(--text-primary); }
.lb-tf-tab.active { background: var(--primary); border-color: var(--primary); color: white; }

.lb-search {
  display: flex; align-items: center; gap: 8px; padding: 7px 12px;
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px;
  min-width: 180px; color: var(--text-tertiary);
}
.lb-search input {
  border: none; background: none; outline: none; flex: 1;
  font-size: 0.82rem; color: var(--text-primary);
}
.lb-search input::placeholder { color: var(--text-tertiary); }
.lb-search-clear { background: none; border: none; cursor: pointer; color: var(--text-tertiary); display: flex; padding: 0; }

/* Subject picker */
.lb-subject-picker {
  max-width: 900px; margin: 8px auto 0; padding: 0 20px;
  display: flex; gap: 6px; flex-wrap: wrap;
}
.lb-subj-btn {
  padding: 6px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 500;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
}
.lb-subj-btn:hover { border-color: var(--primary); }
.lb-subj-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
.lb-subj-btn.clear { color: #ef4444; border-color: rgba(239,68,68,0.3); display: flex; align-items: center; gap: 4px; }

/* ═══ PODIUM ═══ */
.lb-podium {
  max-width: 900px; margin: 24px auto 0; padding: 0 20px;
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
  align-items: flex-end;
}
.lb-podium-card {
  position: relative; text-align: center;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 20px 14px 16px; overflow: hidden;
}
.lb-podium-card.first { border-color: rgba(234,179,8,0.3); order: 2; }
.lb-podium-card.second { order: 1; }
.lb-podium-card.third { order: 3; }

.lb-podium-medal {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 10px; color: white;
}
.lb-podium-medal.gold { background: linear-gradient(135deg, #eab308, #f59e0b); }
.lb-podium-medal.silver { background: linear-gradient(135deg, #94a3b8, #cbd5e1); }
.lb-podium-medal.bronze { background: linear-gradient(135deg, #d97706, #f59e0b); }

.lb-podium-avatar {
  width: 56px; height: 56px; border-radius: 16px;
  background: var(--bg-tertiary); border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 700; color: var(--text-primary);
  margin: 0 auto 8px;
}
.lb-podium-avatar.champion { width: 64px; height: 64px; font-size: 1.6rem; border-width: 3px; }

.lb-podium-name {
  margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lb-podium-title { display: block; font-size: 0.68rem; font-weight: 600; margin: 2px 0 8px; }
.lb-podium-xp { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); }
.lb-podium-xp.champion-xp { font-size: 1.7rem; color: #eab308; }
.lb-podium-label { font-size: 0.65rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; }

.lb-podium-pillar {
  position: absolute; bottom: 0; left: 0; right: 0;
  opacity: 0.06; border-radius: 0 0 16px 16px;
}
.lb-podium-pillar.first-pillar { height: 40%; background: linear-gradient(180deg, transparent, #eab308); }
.lb-podium-pillar.second-pillar { height: 30%; background: linear-gradient(180deg, transparent, #94a3b8); }
.lb-podium-pillar.third-pillar { height: 25%; background: linear-gradient(180deg, transparent, #d97706); }

/* ═══ TABLE ═══ */
.lb-table-wrap {
  max-width: 900px; margin: 20px auto 0; padding: 0 20px;
}
.lb-table-header {
  display: grid; grid-template-columns: 60px 1fr 90px 80px 80px;
  padding: 10px 16px; font-size: 0.7rem; font-weight: 600;
  color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px;
}
.lb-th.rank { text-align: center; }
.lb-th.stat { text-align: center; }

.lb-table-body {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; overflow: hidden;
}

.lb-row {
  display: grid; grid-template-columns: 60px 1fr 90px 80px 80px;
  padding: 12px 16px; align-items: center;
  border-bottom: 1px solid var(--border-color); transition: background 0.1s;
}
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: var(--bg-tertiary); }
.lb-row.me { background: rgba(99,102,241,0.06); border-left: 3px solid var(--primary); }
.lb-row.top-1 { background: rgba(234,179,8,0.04); }
.lb-row.top-2 { background: rgba(148,163,184,0.04); }
.lb-row.top-3 { background: rgba(217,119,6,0.04); }

.lb-cell.rank { text-align: center; }
.lb-cell.player { display: flex; align-items: center; gap: 10px; min-width: 0; }
.lb-cell.stat { text-align: center; }

/* Rank badges */
.lb-rank-badge {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; color: white;
}
.lb-rank-badge.gold { background: linear-gradient(135deg, #eab308, #f59e0b); }
.lb-rank-badge.silver { background: linear-gradient(135deg, #94a3b8, #cbd5e1); }
.lb-rank-badge.bronze { background: linear-gradient(135deg, #d97706, #f59e0b); }
.lb-rank-num { font-weight: 600; font-size: 0.9rem; color: var(--text-tertiary); text-align: center; }

/* Player cell */
.lb-player-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bg-tertiary); border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.85rem; color: var(--text-primary); flex-shrink: 0;
}
.lb-player-info { min-width: 0; }
.lb-player-name {
  display: flex; align-items: center; gap: 6px;
  font-weight: 600; font-size: 0.88rem; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lb-you-tag {
  font-size: 0.55rem; font-weight: 700; padding: 1px 5px;
  background: var(--primary); color: white; border-radius: 3px;
  text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;
}
.lb-player-title {
  display: block; font-size: 0.68rem; font-weight: 600;
}

/* Stat cells */
.lb-stat-main { font-weight: 600; font-size: 0.88rem; color: var(--text-primary); display: inline-flex; align-items: center; gap: 3px; }
.lb-flame { color: #f97316; }

.lb-xp-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.lb-xp-micro-bar { width: 48px; height: 3px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
.lb-xp-micro-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }

/* ═══ EMPTY / LOADING ═══ */
.lb-loading {
  text-align: center; padding: 60px 20px; color: var(--text-tertiary);
}
.lb-spinner {
  width: 36px; height: 36px; border: 3px solid var(--border-color);
  border-top-color: var(--primary); border-radius: 50%;
  animation: lb-spin 0.8s linear infinite; margin: 0 auto 12px;
}
@keyframes lb-spin { to { transform: rotate(360deg); } }

.lb-empty {
  text-align: center; padding: 60px 20px; color: var(--text-tertiary);
}
.lb-empty svg { opacity: 0.4; margin: 0 auto 12px; }
.lb-empty h3 { margin: 0 0 4px; color: var(--text-primary); font-size: 1.1rem; }
.lb-empty p { margin: 0; font-size: 0.85rem; }
.lb-btn {
  margin-top: 12px; padding: 8px 18px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-radius: 8px;
  cursor: pointer; color: var(--text-primary); font-size: 0.85rem;
}

/* ═══ RESPONSIVE ═══ */
.hide-mobile { }
@media (max-width: 700px) {
  .lb-podium { gap: 8px; }
  .lb-podium-card { padding: 14px 8px 12px; }
  .lb-podium-avatar { width: 44px; height: 44px; font-size: 1.1rem; border-radius: 12px; }
  .lb-podium-avatar.champion { width: 52px; height: 52px; }
  .lb-podium-xp { font-size: 1.1rem; }
  .lb-podium-xp.champion-xp { font-size: 1.3rem; }

  .lb-table-header { grid-template-columns: 44px 1fr 70px 60px; }
  .lb-row { grid-template-columns: 44px 1fr 70px 60px; padding: 10px 12px; }
  .hide-mobile { display: none; }
  .lb-controls { flex-direction: column; align-items: stretch; }
  .lb-timeframe-tabs { overflow-x: auto; }
}
@media (max-width: 480px) {
  .lb-hero-inner { padding: 20px 16px; }
  .lb-title { font-size: 1.3rem; }
  .lb-my-rank { display: none; }
  .lb-podium-name { font-size: 0.78rem; }
  .lb-player-avatar { width: 30px; height: 30px; font-size: 0.75rem; }
}
`;
