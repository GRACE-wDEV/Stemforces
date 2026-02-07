import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Swords, 
  Users, 
  Lock, 
  Globe, 
  Copy, 
  Check,
  Clock,
  Zap,
  Trophy,
  ArrowLeft,
  Play,
  RefreshCw,
  Shield,
  SkipForward,
  Snowflake,
  Star,
  Target,
  TrendingUp,
  ChevronRight,
  Flame
} from "lucide-react";
import { generateBattleQuestions } from "../api/ai";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import { useAuthStore } from "../stores/authStore";

const BATTLE_MODES = [
  { id: 'quick', name: 'Quick Battle', questions: 5, time: 30, icon: '⚡' },
  { id: 'standard', name: 'Standard', questions: 10, time: 45, icon: '⚔️' },
  { id: 'marathon', name: 'Marathon', questions: 20, time: 60, icon: '🏃' },
];

const SUBJECTS = [
  { id: 'Math', name: 'Math', icon: '📐' },
  { id: 'Physics', name: 'Physics', icon: '⚛️' },
  { id: 'Chemistry', name: 'Chemistry', icon: '🧪' },
  { id: 'Biology', name: 'Biology', icon: '🧬' },
  { id: 'Mixed', name: 'Mixed', icon: '🎲' },
];

const BOT_PRESETS = [
  { name: 'StudyBot', avatar: '📚', difficulty: 'easy', accuracy: 0.35, speedRange: [0.6, 0.85] },
  { name: 'QuizBot', avatar: '🤖', difficulty: 'medium', accuracy: 0.55, speedRange: [0.4, 0.7] },
  { name: 'BrainBot', avatar: '🧠', difficulty: 'medium', accuracy: 0.65, speedRange: [0.3, 0.65] },
  { name: 'ScienceNerd', avatar: '🔬', difficulty: 'hard', accuracy: 0.75, speedRange: [0.25, 0.5] },
  { name: 'MathWiz', avatar: '🧙', difficulty: 'hard', accuracy: 0.82, speedRange: [0.2, 0.45] },
  { name: 'GeniusAI', avatar: '👾', difficulty: 'expert', accuracy: 0.92, speedRange: [0.15, 0.35] },
];

const DIFFICULTY_LABELS = {
  easy: { label: 'Easy', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard: { label: 'Hard', color: '#ef4444' },
  expert: { label: 'Expert', color: '#8b5cf6' },
};

const POWER_UPS = {
  skip: { icon: '⏭️', name: 'Skip', desc: 'Skip this question (no points lost)', lucideIcon: SkipForward },
  doublePoints: { icon: '✨', name: '2x Points', desc: 'Double points for this question', lucideIcon: Star },
  freezeTimer: { icon: '❄️', name: 'Freeze', desc: 'Freeze the timer for 10 seconds', lucideIcon: Snowflake },
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function BattlePage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Stage management
  const [stage, setStage] = useState('menu');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Battle config
  const [selectedMode, setSelectedMode] = useState(BATTLE_MODES[1]);
  const [selectedSubject, setSelectedSubject] = useState('Mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [botDifficulty, setBotDifficulty] = useState('medium');
  
  // Players
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  
  // Battle state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [scores, setScores] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // Enhanced features
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [powerUps, setPowerUps] = useState({ skip: 1, doublePoints: 1, freezeTimer: 1 });
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [timerFrozen, setTimerFrozen] = useState(false);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [floatingPoints, setFloatingPoints] = useState(null);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [botAnswersMap, setBotAnswersMap] = useState({});
  
  const timerRef = useRef(null);
  const freezeRef = useRef(null);

  // Handle room code from URL
  useEffect(() => {
    const code = searchParams.get('room');
    if (code) {
      setJoinCode(code.toUpperCase());
      setStage('join-room');
    }
  }, [searchParams]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (freezeRef.current) clearInterval(freezeRef.current);
    };
  }, []);

  // Create a new room
  const createRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setPlayers([{
      id: user?._id || 'host',
      name: user?.name || 'Host',
      avatar: '👤',
      isHost: true,
      score: 0,
      ready: true
    }]);
    setStage('lobby');
    
    if (!isPrivate) {
      setTimeout(() => addBotOpponent(), 1500 + Math.random() * 2000);
    }
  };

  // Join existing room
  const joinRoom = () => {
    if (joinCode.length !== 6) return;
    setRoomCode(joinCode.toUpperCase());
    setIsHost(false);
    setPlayers([
      { id: 'host', name: 'Room Host', avatar: '👑', isHost: true, score: 0, ready: true },
      { id: user?._id || 'player', name: user?.name || 'You', avatar: '👤', isHost: false, score: 0, ready: true }
    ]);
    setStage('lobby');
  };

  // Add bot opponent with difficulty
  const addBotOpponent = (customDifficulty) => {
    const diff = customDifficulty || botDifficulty;
    const availableBots = BOT_PRESETS.filter(b => b.difficulty === diff);
    const filteredBots = availableBots.length > 0 ? availableBots : BOT_PRESETS;
    const bot = filteredBots[Math.floor(Math.random() * filteredBots.length)];
    
    setPlayers(prev => {
      if (prev.length >= 4) return prev;
      return [...prev, {
        id: `bot-${Date.now()}`,
        name: bot.name,
        avatar: bot.avatar,
        isBot: true,
        botConfig: { accuracy: bot.accuracy, speedRange: bot.speedRange, difficulty: bot.difficulty },
        score: 0,
        ready: true
      }];
    });
  };

  const removeBot = (botId) => {
    setPlayers(prev => prev.filter(p => p.id !== botId));
  };

  // Copy room code
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start the battle
  const startBattle = async () => {
    setStage('countdown');
    setIsLoadingQuestions(true);
    
    try {
      const subject = selectedSubject === 'Mixed' ? 
        SUBJECTS[Math.floor(Math.random() * 4)].id : selectedSubject;
      
      const response = await generateBattleQuestions(subject, 'medium', questionCount);
      
      if (response.success && response.data?.questions && Array.isArray(response.data.questions)) {
        const parsed = parseQuestions(response.data.questions);
        setQuestions(parsed.length >= 3 ? parsed : getSampleQuestions());
      } else {
        setQuestions(getSampleQuestions());
      }
    } catch (error) {
      console.error('Battle question generation error:', error);
      setQuestions(getSampleQuestions());
    }
    
    setIsLoadingQuestions(false);
    
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownInterval);
        beginBattle();
      }
    }, 1000);
  };

  const parseQuestions = (aiQuestions) => {
    if (!Array.isArray(aiQuestions)) return [];
    return aiQuestions.map((q, idx) => {
      const questionText = q.question || q.text || q.question_text || `Question ${idx + 1}`;
      const options = q.options || q.choices?.map(c => c.text) || ['Option A', 'Option B', 'Option C', 'Option D'];
      const correctIndex = q.correctAnswer ?? q.correct ?? q.correctIndex ?? 0;
      return {
        id: idx + 1,
        text: questionText,
        options: Array.isArray(options) ? options : ['A', 'B', 'C', 'D'],
        correct: typeof correctIndex === 'number' ? correctIndex : 0,
        explanation: q.explanation || '',
        topic: q.topic || '',
      };
    });
  };

  const getSampleQuestions = () => {
    const all = [
      { id: 1, text: "What is $\\sqrt{144}$?", options: ["10", "12", "14", "16"], correct: 1, explanation: "√144 = 12" },
      { id: 2, text: "If $F = ma$, what force accelerates 5kg at $2 m/s^2$?", options: ["5 N", "10 N", "15 N", "20 N"], correct: 1, explanation: "F = 5×2 = 10 N" },
      { id: 3, text: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correct: 1, explanation: "Carbon has 6 protons" },
      { id: 4, text: "Solve: $2x + 5 = 15$", options: ["x = 3", "x = 5", "x = 7", "x = 10"], correct: 1, explanation: "2x = 10, x = 5" },
      { id: 5, text: "What is $7 \\times 8$?", options: ["54", "56", "58", "64"], correct: 1, explanation: "7 × 8 = 56" },
      { id: 6, text: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"], correct: 1, explanation: "Mitochondria produces ATP" },
      { id: 7, text: "What is $\\frac{d}{dx}(x^2)$?", options: ["x", "2x", "x^2", "2"], correct: 1, explanation: "Power rule: nx^(n-1) = 2x" },
      { id: 8, text: "What element has the symbol 'Fe'?", options: ["Fluorine", "Iron", "Fermium", "Francium"], correct: 1, explanation: "Fe = Iron (Ferrum in Latin)" },
      { id: 9, text: "What is the speed of light (approx)?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: 1, explanation: "c ≈ 3×10⁸ m/s" },
      { id: 10, text: "What is $\\log_{10}(1000)$?", options: ["2", "3", "4", "10"], correct: 1, explanation: "10³ = 1000, so log₁₀(1000) = 3" },
    ];
    return all.slice(0, questionCount);
  };

  const beginBattle = () => {
    setStage('battle');
    setCurrentQuestion(0);
    setTimeLeft(selectedMode.time);
    setScores(Object.fromEntries(players.map(p => [p.id, 0])));
    setStreak(0);
    setMaxStreak(0);
    setComboMultiplier(1);
    setPowerUps({ skip: 1, doublePoints: 1, freezeTimer: 1 });
    setActivePowerUp(null);
    setAnswerHistory([]);
    setBotAnswersMap({});
    startTimer();
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleTimeout = () => {
    if (!showResult) {
      processAnswer(-1);
    }
  };

  // Power-up usage
  const usePowerUp = (type) => {
    if (powerUps[type] <= 0 || showResult) return;
    
    if (type === 'skip') {
      setPowerUps(prev => ({ ...prev, skip: prev.skip - 1 }));
      setAnswerHistory(prev => [...prev, {
        questionIndex: currentQuestion, answer: -1, correct: false, points: 0,
        timeUsed: selectedMode.time - timeLeft, skipped: true
      }]);
      if (currentQuestion >= questions.length - 1) {
        endBattle();
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(selectedMode.time);
        setTimerFrozen(false);
        setActivePowerUp(null);
        startTimer();
      }
      return;
    }
    
    if (type === 'doublePoints') {
      setPowerUps(prev => ({ ...prev, doublePoints: prev.doublePoints - 1 }));
      setActivePowerUp('doublePoints');
      return;
    }
    
    if (type === 'freezeTimer') {
      setPowerUps(prev => ({ ...prev, freezeTimer: prev.freezeTimer - 1 }));
      setTimerFrozen(true);
      setFreezeTimeLeft(10);
      setActivePowerUp('freezeTimer');
      if (timerRef.current) clearInterval(timerRef.current);
      let freezeLeft = 10;
      freezeRef.current = setInterval(() => {
        freezeLeft--;
        setFreezeTimeLeft(freezeLeft);
        if (freezeLeft <= 0) {
          clearInterval(freezeRef.current);
          setTimerFrozen(false);
          setActivePowerUp(prev => prev === 'freezeTimer' ? null : prev);
          startTimer();
        }
      }, 1000);
      return;
    }
  };

  const handleAnswer = (optionIdx) => {
    if (selectedAnswer !== null || showResult) return;
    setSelectedAnswer(optionIdx);
    processAnswer(optionIdx);
  };

  const processAnswer = (optionIdx) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (freezeRef.current) clearInterval(freezeRef.current);
    setTimerFrozen(false);
    
    const question = questions[currentQuestion];
    const isCorrect = optionIdx === question.correct;
    const timeUsed = selectedMode.time - timeLeft;
    const timeBonus = Math.floor((timeLeft / selectedMode.time) * 50);
    
    // Streak & combo
    let newStreak = isCorrect ? streak + 1 : 0;
    let newCombo = 1;
    if (newStreak >= 7) newCombo = 3;
    else if (newStreak >= 5) newCombo = 2.5;
    else if (newStreak >= 3) newCombo = 2;
    else if (newStreak >= 2) newCombo = 1.5;
    
    let points = isCorrect ? Math.round((100 + timeBonus) * newCombo) : 0;
    if (activePowerUp === 'doublePoints' && isCorrect) points *= 2;
    
    setStreak(newStreak);
    setMaxStreak(prev => Math.max(prev, newStreak));
    setComboMultiplier(newCombo);
    
    if (points > 0) {
      setFloatingPoints(`+${points}${newCombo > 1 ? ` (${newCombo}x!)` : ''}`);
      setTimeout(() => setFloatingPoints(null), 1500);
    } else if (optionIdx !== -1) {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
    
    const myId = user?._id || (isHost ? 'host' : 'player');
    setScores(prev => ({ ...prev, [myId]: (prev[myId] || 0) + points }));
    
    // Simulate bot answers with difficulty-based behavior
    const currentBotAnswers = {};
    players.forEach(p => {
      if (p.isBot && p.botConfig) {
        const { accuracy, speedRange } = p.botConfig;
        const botCorrect = Math.random() < accuracy;
        const botTimeRatio = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
        const botTimeBonus = Math.floor(botTimeRatio * 50);
        const botPoints = botCorrect ? 100 + botTimeBonus : 0;
        currentBotAnswers[p.id] = { correct: botCorrect, points: botPoints };
        setScores(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + botPoints }));
      }
    });
    setBotAnswersMap(prev => ({ ...prev, [currentQuestion]: currentBotAnswers }));
    
    setAnswerHistory(prev => [...prev, {
      questionIndex: currentQuestion, answer: optionIdx, correct: isCorrect, points,
      timeUsed, combo: newCombo, streak: newStreak, skipped: false
    }]);
    
    setShowResult(true);
    setActivePowerUp(prev => prev === 'doublePoints' ? null : prev);
    
    setTimeout(() => {
      if (currentQuestion >= questions.length - 1) {
        endBattle();
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(selectedMode.time);
        startTimer();
      }
    }, 2200);
  };

  const endBattle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (freezeRef.current) clearInterval(freezeRef.current);
    setStage('results');
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (freezeRef.current) clearInterval(freezeRef.current);
    setStage('menu');
    setRoomCode('');
    setJoinCode('');
    setPlayers([]);
    setQuestions([]);
    setCurrentQuestion(0);
    setScores({});
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    setMaxStreak(0);
    setComboMultiplier(1);
    setPowerUps({ skip: 1, doublePoints: 1, freezeTimer: 1 });
    setActivePowerUp(null);
    setTimerFrozen(false);
    setAnswerHistory([]);
    setBotAnswersMap({});
    setFloatingPoints(null);
    setIsLoadingQuestions(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Login required
  if (!isAuthenticated) {
    return (
      <div className="battle-page centered">
        <div className="login-prompt">
          <Swords size={64} />
          <h2>Login Required</h2>
          <p>Sign in to battle other students!</p>
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Login to Battle
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Main Menu
  if (stage === 'menu') {
    return (
      <div className="battle-page">
        <div className="menu-container">
          <div className="menu-header">
            <div className="menu-icon-wrap">
              <Swords size={48} />
            </div>
            <h1>Battle Arena</h1>
            <p>Challenge opponents in real-time quiz battles!</p>
          </div>

          <div className="menu-options">
            <button className="menu-btn create" onClick={() => setStage('create-room')}>
              <div className="btn-icon"><Users size={24} /></div>
              <div className="btn-content">
                <span className="btn-title">Create Room</span>
                <span className="btn-desc">Set up a battle & invite friends</span>
              </div>
              <ChevronRight size={20} className="btn-arrow" />
            </button>

            <button className="menu-btn join" onClick={() => setStage('join-room')}>
              <div className="btn-icon"><Play size={24} /></div>
              <div className="btn-content">
                <span className="btn-title">Join Room</span>
                <span className="btn-desc">Enter a room code to join</span>
              </div>
              <ChevronRight size={20} className="btn-arrow" />
            </button>

            <button className="menu-btn quick" onClick={() => { setIsPrivate(false); createRoom(); }}>
              <div className="btn-icon"><Zap size={24} /></div>
              <div className="btn-content">
                <span className="btn-title">Quick Match</span>
                <span className="btn-desc">Instant battle against a bot</span>
              </div>
              <ChevronRight size={20} className="btn-arrow" />
            </button>
          </div>

          <div className="menu-stats">
            <div className="stat-chip"><Flame size={14} /> Streak Combos</div>
            <div className="stat-chip"><Star size={14} /> Power-Ups</div>
            <div className="stat-chip"><Target size={14} /> AI Questions</div>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Create Room
  if (stage === 'create-room') {
    return (
      <div className="battle-page">
        <div className="setup-container">
          <button className="back-btn" onClick={() => setStage('menu')}>
            <ArrowLeft size={20} /> Back
          </button>

          <h2>Create Battle Room</h2>

          {/* Privacy Toggle */}
          <div className="option-group">
            <label>Room Type</label>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${isPrivate ? 'active' : ''}`}
                onClick={() => setIsPrivate(true)}
              >
                <Lock size={18} /> Private
              </button>
              <button 
                className={`toggle-btn ${!isPrivate ? 'active' : ''}`}
                onClick={() => setIsPrivate(false)}
              >
                <Globe size={18} /> Public
              </button>
            </div>
            <small>{isPrivate ? 'Only people with the code can join' : 'Anyone can join this room'}</small>
          </div>

          {/* Subject Selection */}
          <div className="option-group">
            <label>Subject</label>
            <div className="subject-grid">
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  className={`subject-btn ${selectedSubject === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="option-group">
            <label>Battle Mode</label>
            <div className="mode-grid">
              {BATTLE_MODES.map(m => (
                <button
                  key={m.id}
                  className={`mode-btn ${selectedMode.id === m.id ? 'active' : ''}`}
                  onClick={() => { setSelectedMode(m); setQuestionCount(m.questions); }}
                >
                  <span className="mode-icon">{m.icon}</span>
                  <span className="mode-name">{m.name}</span>
                  <span className="mode-info">{m.questions} Qs • {m.time}s each</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="option-group">
            <label>Questions: {questionCount}</label>
            <input
              type="range" min="5" max="20" step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="range-labels"><span>5</span><span>20</span></div>
          </div>

          {/* Bot Difficulty */}
          <div className="option-group">
            <label>Bot Difficulty</label>
            <div className="difficulty-grid">
              {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  className={`diff-btn ${botDifficulty === key ? 'active' : ''}`}
                  onClick={() => setBotDifficulty(key)}
                  style={{ '--diff-color': val.color }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-create-room" onClick={createRoom}>
            Create Room
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Join Room
  if (stage === 'join-room') {
    return (
      <div className="battle-page">
        <div className="join-container">
          <button className="back-btn" onClick={() => setStage('menu')}>
            <ArrowLeft size={20} /> Back
          </button>

          <h2>Join Battle Room</h2>
          <p>Enter the 6-character room code</p>

          <div className="code-input-group">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="XXXXXX"
              maxLength={6}
              className="code-input"
              autoFocus
            />
          </div>

          <button 
            className="btn-join" 
            onClick={joinRoom}
            disabled={joinCode.length !== 6}
          >
            Join Room
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Lobby - Waiting for players
  if (stage === 'lobby') {
    return (
      <div className="battle-page">
        <div className="lobby-container">
          <h2>Battle Lobby</h2>
          
          <div className="room-code-display">
            <span className="code-label">Room Code</span>
            <div className="code-box">
              <span className="code">{roomCode}</span>
              <button className="copy-btn" onClick={copyCode}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <small>Share this code with friends to join</small>
          </div>

          <div className="players-list">
            <h3>Players ({players.length}/4)</h3>
            {players.map(player => (
              <div key={player.id} className="player-card">
                <span className="player-avatar">{player.avatar}</span>
                <span className="player-name">
                  {player.name}
                  {player.isHost && <span className="host-badge">Host</span>}
                  {player.isBot && (
                    <span className="bot-badge" style={{ background: `${DIFFICULTY_LABELS[player.botConfig?.difficulty]?.color}20`, color: DIFFICULTY_LABELS[player.botConfig?.difficulty]?.color }}>
                      {DIFFICULTY_LABELS[player.botConfig?.difficulty]?.label || 'Bot'}
                    </span>
                  )}
                </span>
                <span className="ready-status">✓ Ready</span>
                {player.isBot && isHost && (
                  <button className="remove-bot-btn" onClick={() => removeBot(player.id)} title="Remove bot">✕</button>
                )}
              </div>
            ))}
            
            {players.length < 4 && (
              <div className="player-card waiting">
                <span className="player-avatar">➕</span>
                <span className="player-name">Waiting for players...</span>
                <div className="loading-dots"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>

          <div className="settings-summary">
            <span>{SUBJECTS.find(s => s.id === selectedSubject)?.icon} {selectedSubject}</span>
            <span>•</span>
            <span>{questionCount} Questions</span>
            <span>•</span>
            <span>{selectedMode.time}s per Q</span>
          </div>

          <div className="lobby-actions">
            {isHost && players.length < 4 && (
              <button className="btn-secondary" onClick={() => addBotOpponent(botDifficulty)}>
                + Add Bot ({DIFFICULTY_LABELS[botDifficulty]?.label})
              </button>
            )}
            {isHost && players.length >= 2 && (
              <button className="btn-start" onClick={startBattle}>
                <Play size={20} /> Start Battle ({players.length} players)
              </button>
            )}
            {isHost && players.length < 2 && (
              <p className="min-players-note">Add at least 1 bot or wait for a player</p>
            )}
            <button className="btn-leave" onClick={resetGame}>
              Leave Room
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Countdown
  if (stage === 'countdown') {
    return (
      <div className="battle-page centered">
        <div className="countdown-display">
          {isLoadingQuestions ? (
            <>
              <div className="loading-spinner" />
              <h2>Generating AI Questions...</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Preparing your battle</p>
            </>
          ) : (
            <>
              <h2>Get Ready!</h2>
              <div className="countdown-number">{countdown}</div>
              <div className="countdown-features">
                <span>⚡ Streak Combos</span>
                <span>✨ Power-Ups</span>
                <span>🎯 Time Bonuses</span>
              </div>
            </>
          )}
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Battle
  if (stage === 'battle') {
    const question = questions[currentQuestion];
    const myId = user?._id || (isHost ? 'host' : 'player');
    const progressPercent = ((currentQuestion) / questions.length) * 100;
    const timerPercent = (timeLeft / selectedMode.time) * 100;
    
    return (
      <div className="battle-page">
        <div className="battle-container">
          {/* Progress Bar */}
          <div className="battle-progress-bar">
            <div className="battle-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Header */}
          <div className="battle-header">
            <div className="progress-info">
              <span>Q {currentQuestion + 1}/{questions.length}</span>
            </div>
            
            {streak >= 2 && (
              <div className="streak-badge">
                <Flame size={16} />
                <span>{streak} Streak</span>
                {comboMultiplier > 1 && <span className="combo-text">{comboMultiplier}x</span>}
              </div>
            )}
            
            <div className={`timer ${timeLeft <= 10 ? 'warning' : ''} ${timerFrozen ? 'frozen' : ''}`}>
              {timerFrozen ? <Snowflake size={18} /> : <Clock size={18} />}
              <span>{timerFrozen ? `❄️ ${freezeTimeLeft}s` : `${timeLeft}s`}</span>
              <div className="timer-bar">
                <div className="timer-bar-fill" style={{ width: `${timerPercent}%`, background: timeLeft <= 10 ? '#ef4444' : timerFrozen ? '#60a5fa' : '#10b981' }} />
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="scoreboard">
            {[...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((player, idx) => (
              <div key={player.id} className={`score-card ${player.id === myId ? 'me' : ''} ${idx === 0 ? 'leading' : ''}`}>
                {idx === 0 && <span className="lead-crown">👑</span>}
                <span className="avatar">{player.avatar}</span>
                <span className="name">{player.id === myId ? 'You' : player.name}</span>
                <span className="score">{scores[player.id] || 0}</span>
              </div>
            ))}
          </div>

          {/* Power-ups */}
          <div className="powerups-bar">
            {Object.entries(POWER_UPS).map(([key, pu]) => {
              const IconComp = pu.lucideIcon;
              const remaining = powerUps[key];
              return (
                <button
                  key={key}
                  className={`powerup-btn ${remaining <= 0 ? 'used' : ''} ${activePowerUp === key ? 'active' : ''}`}
                  onClick={() => usePowerUp(key)}
                  disabled={remaining <= 0 || showResult}
                  title={`${pu.name}: ${pu.desc}`}
                >
                  <IconComp size={16} />
                  <span className="pu-name">{pu.name}</span>
                  {remaining > 0 && <span className="pu-count">{remaining}</span>}
                </button>
              );
            })}
          </div>

          {/* Question */}
          <div className={`question-box ${shakeWrong ? 'shake' : ''}`}>
            <LaTeXRenderer content={question?.text || ''} />
            {floatingPoints && (
              <div className="floating-points">{floatingPoints}</div>
            )}
          </div>

          {/* Options */}
          <div className="options-grid">
            {question?.options.map((option, idx) => {
              let optionClass = 'option-btn';
              if (showResult) {
                if (idx === question.correct) optionClass += ' correct';
                else if (idx === selectedAnswer && idx !== question.correct) optionClass += ' wrong';
              } else if (selectedAnswer === idx) {
                optionClass += ' selected';
              }
              
              return (
                <button
                  key={idx}
                  className={optionClass}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text"><LaTeXRenderer content={option} /></span>
                  {showResult && idx === question.correct && <Check size={18} className="option-icon correct-icon" />}
                  {showResult && idx === selectedAnswer && idx !== question.correct && <span className="option-icon wrong-icon">✕</span>}
                </button>
              );
            })}
          </div>

          {showResult && question?.explanation && (
            <div className="explanation-flash">
              <strong>{selectedAnswer === question.correct ? '✓ Correct!' : '✕ Wrong!'}</strong>
              {' '}{question.explanation}
            </div>
          )}
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Results
  if (stage === 'results') {
    const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    const myId = user?._id || (isHost ? 'host' : 'player');
    const winner = sortedPlayers[0];
    const isWinner = winner?.id === myId;
    const myCorrect = answerHistory.filter(a => a.correct).length;
    const myAccuracy = answerHistory.length > 0 ? Math.round((myCorrect / answerHistory.length) * 100) : 0;
    const avgTime = answerHistory.length > 0 ? (answerHistory.reduce((s, a) => s + a.timeUsed, 0) / answerHistory.length).toFixed(1) : 0;
    const totalPoints = scores[myId] || 0;

    return (
      <div className="battle-page">
        <div className="results-container">
          <div className={`results-header ${isWinner ? 'victory' : 'defeat'}`}>
            <Trophy size={64} className={isWinner ? 'gold' : 'silver'} />
            <h1>{isWinner ? '🎉 Victory!' : 'Good Fight!'}</h1>
            <p>{isWinner ? 'You dominated the battle!' : `${winner?.name || 'Opponent'} won this round`}</p>
          </div>

          <div className="my-stats-grid">
            <div className="my-stat">
              <Target size={20} />
              <span className="my-stat-value">{myAccuracy}%</span>
              <span className="my-stat-label">Accuracy</span>
            </div>
            <div className="my-stat">
              <Flame size={20} />
              <span className="my-stat-value">{maxStreak}</span>
              <span className="my-stat-label">Best Streak</span>
            </div>
            <div className="my-stat">
              <Clock size={20} />
              <span className="my-stat-value">{avgTime}s</span>
              <span className="my-stat-label">Avg. Time</span>
            </div>
            <div className="my-stat">
              <TrendingUp size={20} />
              <span className="my-stat-value">{totalPoints}</span>
              <span className="my-stat-label">Total Pts</span>
            </div>
          </div>

          <div className="final-scores">
            <h3>Final Rankings</h3>
            {sortedPlayers.map((player, idx) => (
              <div key={player.id} className={`result-card ${idx === 0 ? 'winner' : ''} ${player.id === myId ? 'is-me' : ''}`}>
                <span className="rank">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <span className="avatar">{player.avatar}</span>
                <span className="name">
                  {player.id === myId ? 'You' : player.name}
                  {player.isBot && <span className="bot-tag">BOT</span>}
                </span>
                <span className="final-score">{scores[player.id] || 0} pts</span>
              </div>
            ))}
          </div>

          <details className="question-breakdown">
            <summary>Question-by-Question Breakdown</summary>
            <div className="breakdown-list">
              {answerHistory.map((entry, idx) => (
                <div key={idx} className={`breakdown-item ${entry.skipped ? 'skipped' : entry.correct ? 'correct' : 'wrong'}`}>
                  <span className="bq-num">Q{idx + 1}</span>
                  <span className="bq-status">
                    {entry.skipped ? '⏭️ Skipped' : entry.correct ? '✓ Correct' : '✕ Wrong'}
                  </span>
                  <span className="bq-points">{entry.points > 0 ? `+${entry.points}` : '0'} pts</span>
                  <span className="bq-time">{entry.timeUsed.toFixed(0)}s</span>
                  {entry.combo > 1 && <span className="bq-combo">{entry.combo}x</span>}
                </div>
              ))}
            </div>
          </details>

          <div className="results-actions">
            <button className="btn-rematch" onClick={() => { resetGame(); setTimeout(() => { setStage('create-room'); }, 50); }}>
              <RefreshCw size={18} /> New Battle
            </button>
            <button className="btn-secondary" onClick={resetGame}>
              Back to Menu
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return null;
}

const styles = `
  .battle-page {
    min-height: calc(100vh - 70px);
    padding: 24px;
    display: flex;
    justify-content: center;
  }
  .battle-page.centered { align-items: center; }

  .login-prompt {
    text-align: center; padding: 48px;
    background: var(--bg-secondary); border-radius: 20px; border: 1px solid var(--border-color);
  }
  .login-prompt svg { color: var(--text-tertiary); margin-bottom: 16px; }
  .login-prompt h2 { margin: 0 0 8px; }
  .login-prompt p { color: var(--text-secondary); margin-bottom: 24px; }

  .menu-container { max-width: 500px; width: 100%; }
  .menu-header { text-align: center; margin-bottom: 40px; }
  .menu-icon-wrap { display: inline-flex; padding: 16px; background: linear-gradient(135deg, #ef4444, #f97316); border-radius: 20px; margin-bottom: 16px; }
  .menu-icon-wrap svg { color: white; }
  .menu-header h1 { margin: 0 0 8px; font-size: 2rem; }
  .menu-header p { color: var(--text-secondary); margin: 0; }
  .menu-options { display: flex; flex-direction: column; gap: 12px; }

  .menu-btn {
    display: flex; align-items: center; gap: 16px; padding: 20px 24px;
    background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 16px;
    cursor: pointer; transition: all 0.2s; text-align: left; color: var(--text-primary);
  }
  .menu-btn:hover { transform: translateX(4px); }
  .menu-btn.create:hover { border-color: #10b981; }
  .menu-btn.join:hover { border-color: #6366f1; }
  .menu-btn.quick:hover { border-color: #f59e0b; }
  .btn-arrow { color: var(--text-tertiary); transition: transform 0.2s; }
  .menu-btn:hover .btn-arrow { transform: translateX(4px); }

  .btn-icon {
    width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;
  }
  .menu-btn.create .btn-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  .menu-btn.join .btn-icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  .menu-btn.quick .btn-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  .btn-content { flex: 1; }
  .btn-title { display: block; font-weight: 600; font-size: 1.1rem; }
  .btn-desc { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }

  .menu-stats { display: flex; justify-content: center; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
  .stat-chip {
    display: flex; align-items: center; gap: 6px; padding: 6px 14px;
    background: var(--bg-secondary); border-radius: 20px; font-size: 0.8rem; color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .setup-container, .join-container {
    max-width: 520px; width: 100%; background: var(--bg-secondary); border-radius: 20px; padding: 32px;
    border: 1px solid var(--border-color);
  }
  .back-btn {
    display: flex; align-items: center; gap: 8px; padding: 8px 16px;
    background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px;
    cursor: pointer; margin-bottom: 24px; color: var(--text-primary);
  }
  .setup-container h2, .join-container h2 { margin: 0 0 24px; text-align: center; }

  .option-group { margin-bottom: 24px; }
  .option-group label { display: block; font-weight: 600; margin-bottom: 12px; }
  .option-group small { display: block; font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px; }
  .toggle-group { display: flex; gap: 12px; }
  .toggle-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px;
    background: var(--bg-tertiary); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s;
    color: var(--text-primary);
  }
  .toggle-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); color: var(--primary); }

  .subject-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; }
  .subject-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px;
    background: var(--bg-tertiary); border: 2px solid var(--border-color); border-radius: 10px;
    cursor: pointer; transition: all 0.2s; font-size: 0.9rem; color: var(--text-primary);
  }
  .subject-btn:hover { border-color: var(--primary); }
  .subject-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }

  .mode-grid { display: flex; flex-direction: column; gap: 10px; }
  .mode-btn {
    display: flex; align-items: center; gap: 12px; padding: 14px 16px;
    background: var(--bg-tertiary); border: 2px solid var(--border-color); border-radius: 10px;
    cursor: pointer; text-align: left; color: var(--text-primary);
  }
  .mode-btn:hover { border-color: var(--primary); }
  .mode-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
  .mode-icon { font-size: 1.5rem; }
  .mode-name { font-weight: 600; flex: 1; }
  .mode-info { font-size: 0.8rem; color: var(--text-tertiary); }

  .difficulty-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .diff-btn {
    padding: 10px; border: 2px solid var(--border-color); border-radius: 8px;
    background: var(--bg-tertiary); cursor: pointer; font-weight: 600; font-size: 0.85rem;
    color: var(--text-primary); transition: all 0.2s;
  }
  .diff-btn:hover { border-color: var(--diff-color); }
  .diff-btn.active { border-color: var(--diff-color); background: color-mix(in srgb, var(--diff-color) 10%, transparent); color: var(--diff-color); }

  .range-slider { width: 100%; height: 8px; border-radius: 4px; background: var(--bg-tertiary); appearance: none; }
  .range-slider::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--primary); cursor: pointer; }
  .range-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-tertiary); margin-top: 4px; }

  .btn-create-room, .btn-join {
    width: 100%; padding: 16px; background: var(--primary); color: white; border: none;
    border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 16px;
  }
  .btn-create-room:hover, .btn-join:hover { opacity: 0.9; }
  .btn-join:disabled { opacity: 0.5; cursor: not-allowed; }

  .join-container { text-align: center; }
  .join-container p { color: var(--text-secondary); margin-bottom: 24px; }
  .code-input-group { margin-bottom: 16px; }
  .code-input {
    width: 100%; max-width: 220px; padding: 20px; font-size: 2rem; font-weight: 700;
    text-align: center; letter-spacing: 0.5em; background: var(--bg-tertiary);
    border: 2px solid var(--border-color); border-radius: 12px; color: var(--text-primary);
  }
  .code-input:focus { outline: none; border-color: var(--primary); }

  .lobby-container { max-width: 500px; width: 100%; text-align: center; }
  .lobby-container h2 { margin-bottom: 24px; }

  .room-code-display {
    background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px;
    padding: 24px; margin-bottom: 24px;
  }
  .code-label { display: block; font-size: 0.8rem; color: var(--text-tertiary); margin-bottom: 8px; }
  .code-box { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .code { font-size: 2.5rem; font-weight: 700; letter-spacing: 0.3em; color: var(--primary); }
  .copy-btn {
    padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color);
    border-radius: 8px; cursor: pointer; color: var(--text-primary);
  }
  .room-code-display small { display: block; margin-top: 12px; font-size: 0.8rem; color: var(--text-tertiary); }

  .players-list {
    background: var(--bg-secondary); border-radius: 16px; padding: 20px; margin-bottom: 20px;
    border: 1px solid var(--border-color); max-height: 300px; overflow-y: auto;
  }
  .players-list h3 { margin: 0 0 16px; font-size: 0.9rem; color: var(--text-secondary); }
  .player-card {
    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
    background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 8px;
  }
  .player-card.waiting { opacity: 0.6; }
  .player-avatar { font-size: 1.5rem; }
  .player-name { flex: 1; text-align: left; font-weight: 500; }
  .host-badge, .bot-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
  .host-badge { background: #fef3c7; color: #d97706; }
  .bot-badge { background: #e0e7ff; color: #4f46e5; }
  .ready-status { color: #10b981; font-size: 0.9rem; }
  .remove-bot-btn {
    width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-color);
    background: var(--bg-secondary); cursor: pointer; color: #ef4444; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center;
  }
  .remove-bot-btn:hover { background: #fee2e2; }
  .min-players-note { font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px; text-align: center; }

  .loading-dots { display: flex; gap: 4px; }
  .loading-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--text-tertiary); animation: bounce 1.4s infinite ease-in-out; }
  .loading-dots span:nth-child(1) { animation-delay: 0s; }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

  .settings-summary { display: flex; justify-content: center; gap: 12px; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; flex-wrap: wrap; }
  .lobby-actions { display: flex; flex-direction: column; gap: 12px; }

  .btn-start {
    display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px;
    background: #10b981; color: white; border: none; border-radius: 12px;
    font-size: 1rem; font-weight: 600; cursor: pointer;
  }
  .btn-secondary {
    padding: 14px; background: var(--bg-tertiary); border: 1px solid var(--border-color);
    border-radius: 10px; cursor: pointer; color: var(--text-primary);
  }
  .btn-leave {
    padding: 12px; background: transparent; border: 1px solid #ef4444; color: #ef4444;
    border-radius: 10px; cursor: pointer;
  }

  .countdown-display { text-align: center; }
  .countdown-display h2 { margin-bottom: 24px; font-size: 1.5rem; }
  .countdown-number { font-size: 8rem; font-weight: 700; color: var(--primary); animation: pulse 1s ease-in-out infinite; }
  .countdown-features { display: flex; gap: 16px; margin-top: 24px; justify-content: center; flex-wrap: wrap; }
  .countdown-features span { padding: 6px 14px; background: var(--bg-secondary); border-radius: 20px; font-size: 0.85rem; color: var(--text-secondary); }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

  .loading-spinner {
    width: 48px; height: 48px; border: 4px solid var(--border-color); border-top-color: var(--primary);
    border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .battle-container { max-width: 700px; width: 100%; }

  .battle-progress-bar {
    height: 4px; background: var(--bg-tertiary); border-radius: 2px; margin-bottom: 16px; overflow: hidden;
  }
  .battle-progress-fill {
    height: 100%; background: linear-gradient(90deg, var(--primary), #10b981); border-radius: 2px;
    transition: width 0.3s ease;
  }

  .battle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
  .progress-info { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; }

  .streak-badge {
    display: flex; align-items: center; gap: 6px; padding: 6px 14px;
    background: linear-gradient(135deg, #f59e0b, #ef4444); color: white;
    border-radius: 20px; font-size: 0.85rem; font-weight: 600; animation: glow 1s ease-in-out infinite alternate;
  }
  .combo-text { background: rgba(255,255,255,0.3); padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; }
  @keyframes glow { from { box-shadow: 0 0 5px rgba(245, 158, 11, 0.3); } to { box-shadow: 0 0 15px rgba(245, 158, 11, 0.6); } }

  .timer {
    display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--bg-secondary);
    border-radius: 12px; font-weight: 600; font-size: 1.1rem; flex-direction: column; min-width: 100px;
  }
  .timer > span { display: flex; align-items: center; gap: 6px; }
  .timer.warning { color: #ef4444; }
  .timer.frozen { color: #60a5fa; background: rgba(96, 165, 250, 0.1); }
  .timer-bar { width: 100%; height: 4px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
  .timer-bar-fill { height: 100%; border-radius: 2px; transition: width 1s linear; }

  .scoreboard { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
  .score-card {
    flex: 0 1 110px; display: flex; flex-direction: column; align-items: center; padding: 10px;
    background: var(--bg-secondary); border-radius: 12px; border: 2px solid var(--border-color);
    position: relative; transition: all 0.3s;
  }
  .score-card.me { border-color: var(--primary); }
  .score-card.leading { border-color: #f59e0b; }
  .lead-crown { position: absolute; top: -10px; font-size: 0.9rem; }
  .score-card .avatar { font-size: 1.2rem; }
  .score-card .name { font-size: 0.7rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .score-card .score { font-size: 1.1rem; font-weight: 700; color: var(--primary); }

  .powerups-bar { display: flex; gap: 8px; margin-bottom: 16px; justify-content: center; flex-wrap: wrap; }
  .powerup-btn {
    display: flex; align-items: center; gap: 6px; padding: 8px 14px;
    background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px;
    cursor: pointer; font-size: 0.8rem; color: var(--text-primary); transition: all 0.2s; position: relative;
  }
  .powerup-btn:hover:not(:disabled) { border-color: var(--primary); transform: translateY(-1px); }
  .powerup-btn.active { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
  .powerup-btn.used { opacity: 0.4; cursor: not-allowed; }
  .pu-name { font-weight: 500; }
  .pu-count {
    position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%;
    background: var(--primary); color: white; font-size: 0.65rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  .question-box {
    background: var(--bg-secondary); border-radius: 16px; padding: 28px; margin-bottom: 20px;
    font-size: 1.15rem; text-align: center; border: 1px solid var(--border-color); position: relative;
    min-height: 80px; display: flex; align-items: center; justify-content: center;
  }
  .question-box.shake { animation: shake 0.5s ease-in-out; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }

  .floating-points {
    position: absolute; top: -20px; right: 20px; font-size: 1.5rem; font-weight: 700;
    color: #10b981; animation: floatUp 1.5s ease-out forwards; pointer-events: none;
  }
  @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-40px); } }

  .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .option-btn {
    display: flex; align-items: center; gap: 12px; padding: 16px 18px;
    background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 12px;
    cursor: pointer; transition: all 0.2s; text-align: left; color: var(--text-primary); position: relative;
  }
  .option-btn:hover:not(:disabled) { border-color: var(--primary); transform: translateY(-1px); }
  .option-btn.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
  .option-btn.correct { border-color: #10b981; background: rgba(16, 185, 129, 0.15); animation: correctPop 0.3s ease; }
  .option-btn.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
  @keyframes correctPop { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

  .option-letter {
    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary); border-radius: 6px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0;
  }
  .option-text { flex: 1; }
  .option-icon { margin-left: auto; flex-shrink: 0; }
  .correct-icon { color: #10b981; }
  .wrong-icon { color: #ef4444; font-size: 1.1rem; font-weight: 700; }

  .explanation-flash {
    margin-top: 12px; padding: 12px 16px; background: var(--bg-secondary); border-radius: 10px;
    font-size: 0.85rem; color: var(--text-secondary); border: 1px solid var(--border-color);
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .results-container { max-width: 550px; width: 100%; text-align: center; }
  .results-header { margin-bottom: 24px; }
  .results-header svg.gold { color: #f59e0b; }
  .results-header svg.silver { color: #9ca3af; }
  .results-header h1 { font-size: 2.2rem; margin: 16px 0 8px; }
  .results-header p { color: var(--text-secondary); }

  .my-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
  .my-stat {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px;
    background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color);
  }
  .my-stat svg { color: var(--primary); }
  .my-stat-value { font-size: 1.3rem; font-weight: 700; }
  .my-stat-label { font-size: 0.7rem; color: var(--text-tertiary); }

  .final-scores { margin-bottom: 24px; }
  .final-scores h3 { margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary); }
  .result-card {
    display: flex; align-items: center; gap: 12px; padding: 14px 18px;
    background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color);
    margin-bottom: 8px;
  }
  .result-card.winner { border-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }
  .result-card.is-me { border-left: 3px solid var(--primary); }
  .result-card .rank { font-weight: 700; min-width: 28px; font-size: 1.1rem; }
  .result-card .avatar { font-size: 1.3rem; }
  .result-card .name { flex: 1; text-align: left; font-weight: 500; }
  .bot-tag { font-size: 0.6rem; padding: 1px 5px; background: var(--bg-tertiary); border-radius: 3px; margin-left: 6px; color: var(--text-tertiary); }
  .result-card .final-score { font-size: 1.15rem; font-weight: 700; color: var(--primary); }

  .question-breakdown { margin-bottom: 24px; text-align: left; }
  .question-breakdown summary {
    padding: 12px 16px; background: var(--bg-secondary); border-radius: 10px; cursor: pointer;
    font-weight: 600; font-size: 0.9rem; border: 1px solid var(--border-color); list-style: none;
    display: flex; align-items: center; gap: 8px;
  }
  .question-breakdown summary::before { content: '📊'; }
  .question-breakdown[open] summary { border-radius: 10px 10px 0 0; }
  .breakdown-list {
    background: var(--bg-secondary); border: 1px solid var(--border-color); border-top: none;
    border-radius: 0 0 10px 10px; max-height: 300px; overflow-y: auto;
  }
  .breakdown-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px;
    border-bottom: 1px solid var(--border-color); font-size: 0.85rem;
  }
  .breakdown-item:last-child { border-bottom: none; }
  .breakdown-item.correct { background: rgba(16, 185, 129, 0.05); }
  .breakdown-item.wrong { background: rgba(239, 68, 68, 0.05); }
  .breakdown-item.skipped { background: rgba(156, 163, 175, 0.05); }
  .bq-num { font-weight: 700; min-width: 28px; color: var(--text-secondary); }
  .bq-status { flex: 1; }
  .breakdown-item.correct .bq-status { color: #10b981; }
  .breakdown-item.wrong .bq-status { color: #ef4444; }
  .breakdown-item.skipped .bq-status { color: #9ca3af; }
  .bq-points { font-weight: 600; min-width: 50px; text-align: right; }
  .bq-time { color: var(--text-tertiary); min-width: 30px; text-align: right; }
  .bq-combo { padding: 1px 6px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }

  .results-actions { display: flex; flex-direction: column; gap: 12px; }
  .btn-rematch {
    display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px;
    background: var(--primary); color: white; border: none; border-radius: 12px;
    font-size: 1rem; font-weight: 600; cursor: pointer;
  }
  .btn-primary {
    padding: 14px 28px; background: var(--primary); color: white; border: none; border-radius: 10px;
    font-weight: 600; cursor: pointer;
  }

  @media (max-width: 600px) {
    .battle-page { padding: 16px; padding-bottom: 100px; }
    .options-grid { grid-template-columns: 1fr; }
    .scoreboard { gap: 6px; }
    .score-card { flex: 0 1 80px; padding: 8px; }
    .my-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .difficulty-grid { grid-template-columns: repeat(2, 1fr); }
    .powerups-bar { gap: 4px; }
    .powerup-btn { padding: 6px 10px; font-size: 0.75rem; }
  }
`;
