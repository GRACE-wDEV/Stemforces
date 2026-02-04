import { useState, useEffect, useRef } from "react";
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
  RefreshCw
} from "lucide-react";
import { generateBattleQuestions } from "../api/ai";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import { useAuthStore } from "../stores/authStore";

const BATTLE_MODES = [
  { id: 'quick', name: 'Quick Battle', questions: 5, time: 60, icon: '⚡' },
  { id: 'standard', name: 'Standard', questions: 10, time: 90, icon: '⚔️' },
  { id: 'marathon', name: 'Marathon', questions: 20, time: 60, icon: '🏃' },
];

const SUBJECTS = [
  { id: 'Math', name: 'Math', icon: '📐' },
  { id: 'Physics', name: 'Physics', icon: '⚛️' },
  { id: 'Chemistry', name: 'Chemistry', icon: '🧪' },
  { id: 'Biology', name: 'Biology', icon: '🧬' },
  { id: 'Mixed', name: 'Mixed', icon: '🎲' },
];

// Generate a random room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function BattlePage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Stage: menu, create-room, join-room, lobby, countdown, battle, results
  const [stage, setStage] = useState('menu');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Battle config
  const [selectedMode, setSelectedMode] = useState(BATTLE_MODES[1]);
  const [selectedSubject, setSelectedSubject] = useState('Mixed');
  const [questionCount, setQuestionCount] = useState(10);
  
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
  
  const timerRef = useRef(null);

  // Handle room code from URL
  useEffect(() => {
    const code = searchParams.get('room');
    if (code) {
      setJoinCode(code.toUpperCase());
      setStage('join-room');
    }
  }, [searchParams]);

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
    
    // Simulate opponent joining after delay (in real app, this would be WebSocket)
    if (!isPrivate) {
      setTimeout(() => {
        addBotOpponent();
      }, 2000 + Math.random() * 3000);
    }
  };

  // Join existing room
  const joinRoom = () => {
    if (joinCode.length !== 6) return;
    
    // Simulate joining (in real app, this would validate via API)
    setRoomCode(joinCode.toUpperCase());
    setIsHost(false);
    setPlayers([
      {
        id: 'host',
        name: 'Room Host',
        avatar: '👑',
        isHost: true,
        score: 0,
        ready: true
      },
      {
        id: user?._id || 'player',
        name: user?.name || 'You',
        avatar: '👤',
        isHost: false,
        score: 0,
        ready: true
      }
    ]);
    setStage('lobby');
  };

  // Add bot opponent (for demo/single player)
  const addBotOpponent = () => {
    const bots = [
      { name: 'QuizBot', avatar: '🤖' },
      { name: 'BrainBot', avatar: '🧠' },
      { name: 'ScienceNerd', avatar: '🔬' },
      { name: 'MathWiz', avatar: '🧙' },
    ];
    const bot = bots[Math.floor(Math.random() * bots.length)];
    
    setPlayers(prev => [
      ...prev,
      {
        id: 'bot',
        name: bot.name,
        avatar: bot.avatar,
        isBot: true,
        score: 0,
        ready: true
      }
    ]);
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
    
    // Generate questions
    try {
      const subject = selectedSubject === 'Mixed' ? 
        SUBJECTS[Math.floor(Math.random() * 4)].id : selectedSubject;
      
      const response = await generateBattleQuestions(subject, 'medium', questionCount);
      
      if (response.success && response.data?.questions && Array.isArray(response.data.questions)) {
        const parsed = parseQuestions(response.data.questions);
        setQuestions(parsed.length > 0 ? parsed : getSampleQuestions());
      } else {
        console.warn('AI questions unavailable, using sample questions');
        setQuestions(getSampleQuestions());
      }
    } catch (error) {
      console.error('Battle question generation error:', error);
      setQuestions(getSampleQuestions());
    }
    
    // Countdown
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
    if (!Array.isArray(aiQuestions)) return getSampleQuestions();
    
    return aiQuestions.map((q, idx) => {
      // Handle different question formats from AI
      const questionText = q.question || q.text || q.question_text || `Question ${idx + 1}`;
      const options = q.options || q.choices?.map(c => c.text) || ['Option A', 'Option B', 'Option C', 'Option D'];
      const correctIndex = q.correct ?? q.correctIndex ?? q.correctAnswer ?? 0;
      
      return {
        id: idx + 1,
        text: questionText,
        options: Array.isArray(options) ? options : ['A', 'B', 'C', 'D'],
        correct: typeof correctIndex === 'number' ? correctIndex : 0
      };
    });
  };

  const getSampleQuestions = () => [
    { id: 1, text: "What is $\\sqrt{144}$?", options: ["10", "12", "14", "16"], correct: 1 },
    { id: 2, text: "If $F = ma$, what force accelerates 5kg at $2 m/s^2$?", options: ["5 N", "10 N", "15 N", "20 N"], correct: 1 },
    { id: 3, text: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correct: 1 },
    { id: 4, text: "Solve: $2x + 5 = 15$", options: ["x = 3", "x = 5", "x = 7", "x = 10"], correct: 1 },
    { id: 5, text: "What is $7 \\times 8$?", options: ["54", "56", "58", "64"], correct: 1 },
  ].slice(0, questionCount);

  const beginBattle = () => {
    setStage('battle');
    setCurrentQuestion(0);
    setTimeLeft(selectedMode.time);
    setScores(Object.fromEntries(players.map(p => [p.id, 0])));
    startTimer();
  };

  const startTimer = () => {
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
  };

  const handleTimeout = () => {
    if (!showResult) {
      processAnswer(-1); // No answer
    }
  };

  const handleAnswer = (optionIdx) => {
    if (selectedAnswer !== null || showResult) return;
    setSelectedAnswer(optionIdx);
    processAnswer(optionIdx);
  };

  const processAnswer = (optionIdx) => {
    clearInterval(timerRef.current);
    
    const question = questions[currentQuestion];
    const isCorrect = optionIdx === question.correct;
    const timeBonus = Math.floor((timeLeft / selectedMode.time) * 50);
    const points = isCorrect ? 100 + timeBonus : 0;
    
    // Update my score
    const myId = user?._id || (isHost ? 'host' : 'player');
    setScores(prev => ({
      ...prev,
      [myId]: (prev[myId] || 0) + points
    }));
    
    // Simulate bot answers
    players.forEach(p => {
      if (p.isBot) {
        const botCorrect = Math.random() < 0.65;
        const botPoints = botCorrect ? 100 + Math.floor(Math.random() * 40) : 0;
        setScores(prev => ({
          ...prev,
          [p.id]: (prev[p.id] || 0) + botPoints
        }));
      }
    });
    
    setShowResult(true);
    
    // Move to next question
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
    }, 2000);
  };

  const endBattle = () => {
    clearInterval(timerRef.current);
    setStage('results');
  };

  const resetGame = () => {
    setStage('menu');
    setRoomCode('');
    setJoinCode('');
    setPlayers([]);
    setQuestions([]);
    setCurrentQuestion(0);
    setScores({});
    setSelectedAnswer(null);
    setShowResult(false);
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
            <Swords size={48} />
            <h1>Battle Arena</h1>
            <p>Challenge friends or random opponents!</p>
          </div>

          <div className="menu-options">
            <button className="menu-btn create" onClick={() => setStage('create-room')}>
              <div className="btn-icon"><Users size={24} /></div>
              <div className="btn-content">
                <span className="btn-title">Create Room</span>
                <span className="btn-desc">Invite friends with a code</span>
              </div>
            </button>

            <button className="menu-btn join" onClick={() => setStage('join-room')}>
              <div className="btn-icon"><Play size={24} /></div>
              <div className="btn-content">
                <span className="btn-title">Join Room</span>
                <span className="btn-desc">Enter a room code</span>
              </div>
            </button>

            <button className="menu-btn quick" onClick={() => { setIsPrivate(false); createRoom(); }}>
              <div className="btn-icon"><Zap size={24} /></div>
              <div className="btn-content">
                <span className="btn-title">Quick Match</span>
                <span className="btn-desc">Battle a random opponent</span>
              </div>
            </button>
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
            <label>Number of Questions: {questionCount}</label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="range-labels">
              <span>5</span>
              <span>30</span>
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
          
          {/* Room Code Display */}
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

          {/* Players */}
          <div className="players-list">
            <h3>Players ({players.length})</h3>
            {players.map(player => (
              <div key={player.id} className="player-card">
                <span className="player-avatar">{player.avatar}</span>
                <span className="player-name">
                  {player.name}
                  {player.isHost && <span className="host-badge">Host</span>}
                  {player.isBot && <span className="bot-badge">Bot</span>}
                </span>
                <span className="ready-status">✓ Ready</span>
              </div>
            ))}
            
            <div className="player-card waiting">
              <span className="player-avatar">➕</span>
              <span className="player-name">Waiting for more players...</span>
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          {/* Battle Settings Summary */}
          <div className="settings-summary">
            <span>{SUBJECTS.find(s => s.id === selectedSubject)?.icon} {selectedSubject}</span>
            <span>•</span>
            <span>{questionCount} Questions</span>
            <span>•</span>
            <span>{selectedMode.time}s per Q</span>
          </div>

          {/* Actions */}
          <div className="lobby-actions">
            {isHost && (
              <button className="btn-secondary" onClick={addBotOpponent}>
                + Add Bot
              </button>
            )}
            {isHost && players.length >= 2 && (
              <button className="btn-start" onClick={startBattle}>
                <Play size={20} /> Start Battle ({players.length} players)
              </button>
            )}
            {isHost && players.length < 2 && (
              <p className="min-players-note">Minimum 2 players required to start</p>
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
          <h2>Get Ready!</h2>
          <div className="countdown-number">{countdown}</div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Battle
  if (stage === 'battle') {
    const question = questions[currentQuestion];
    const myId = user?._id || (isHost ? 'host' : 'player');
    
    return (
      <div className="battle-page">
        <div className="battle-container">
          {/* Header */}
          <div className="battle-header">
            <div className="progress-info">
              <span>Question {currentQuestion + 1}/{questions.length}</span>
            </div>
            <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
              <Clock size={18} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="scoreboard">
            {players.map(player => (
              <div key={player.id} className={`score-card ${player.id === myId ? 'me' : ''}`}>
                <span className="avatar">{player.avatar}</span>
                <span className="name">{player.id === myId ? 'You' : player.name}</span>
                <span className="score">{scores[player.id] || 0}</span>
              </div>
            ))}
          </div>

          {/* Question */}
          <div className="question-box">
            <LaTeXRenderer content={question?.text || ''} />
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
                  <LaTeXRenderer content={option} />
                </button>
              );
            })}
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // Results
  if (stage === 'results') {
    const sortedPlayers = [...players].sort((a, b) => 
      (scores[b.id] || 0) - (scores[a.id] || 0)
    );
    const myId = user?._id || (isHost ? 'host' : 'player');
    const winner = sortedPlayers[0];
    const isWinner = winner?.id === myId;

    return (
      <div className="battle-page">
        <div className="results-container">
          <div className="results-header">
            <Trophy size={64} className={isWinner ? 'gold' : 'silver'} />
            <h1>{isWinner ? 'Victory!' : 'Defeat'}</h1>
            <p>{isWinner ? 'Congratulations! You won the battle!' : 'Better luck next time!'}</p>
          </div>

          <div className="final-scores">
            {sortedPlayers.map((player, idx) => (
              <div key={player.id} className={`result-card ${idx === 0 ? 'winner' : ''}`}>
                <span className="rank">#{idx + 1}</span>
                <span className="avatar">{player.avatar}</span>
                <span className="name">{player.id === myId ? 'You' : player.name}</span>
                <span className="final-score">{scores[player.id] || 0} pts</span>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button className="btn-rematch" onClick={() => { resetGame(); createRoom(); }}>
              <RefreshCw size={18} /> Rematch
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
    text-align: center;
    padding: 48px;
    background: var(--bg-secondary);
    border-radius: 20px;
    border: 1px solid var(--border-color);
  }

  .login-prompt svg { color: var(--text-tertiary); margin-bottom: 16px; }
  .login-prompt h2 { margin: 0 0 8px; }
  .login-prompt p { color: var(--text-secondary); margin-bottom: 24px; }

  .menu-container { max-width: 500px; width: 100%; }
  .menu-header { text-align: center; margin-bottom: 40px; }
  .menu-header svg { color: #ef4444; margin-bottom: 16px; }
  .menu-header h1 { margin: 0 0 8px; font-size: 2rem; }
  .menu-header p { color: var(--text-secondary); margin: 0; }
  .menu-options { display: flex; flex-direction: column; gap: 16px; }

  .menu-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .menu-btn:hover { transform: translateX(4px); }
  .menu-btn.create:hover { border-color: #10b981; }
  .menu-btn.join:hover { border-color: #6366f1; }
  .menu-btn.quick:hover { border-color: #f59e0b; }

  .btn-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .menu-btn.create .btn-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  .menu-btn.join .btn-icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  .menu-btn.quick .btn-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  .btn-content { flex: 1; }
  .btn-title { display: block; font-weight: 600; font-size: 1.1rem; }
  .btn-desc { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }

  .setup-container, .join-container {
    max-width: 500px;
    width: 100%;
    background: var(--bg-secondary);
    border-radius: 20px;
    padding: 32px;
    border: 1px solid var(--border-color);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 24px;
    color: var(--text-primary);
  }

  .setup-container h2, .join-container h2 { margin: 0 0 24px; text-align: center; }

  .option-group { margin-bottom: 24px; }
  .option-group label { display: block; font-weight: 600; margin-bottom: 12px; }
  .option-group small { display: block; font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px; }
  .toggle-group { display: flex; gap: 12px; }

  .toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); color: var(--primary); }

  .subject-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; }

  .subject-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .subject-btn:hover { border-color: var(--primary); }
  .subject-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }

  .mode-grid { display: flex; flex-direction: column; gap: 10px; }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
  }

  .mode-btn:hover { border-color: var(--primary); }
  .mode-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
  .mode-icon { font-size: 1.5rem; }
  .mode-name { font-weight: 600; flex: 1; }
  .mode-info { font-size: 0.8rem; color: var(--text-tertiary); }

  .range-slider { width: 100%; height: 8px; border-radius: 4px; background: var(--bg-tertiary); appearance: none; }
  .range-slider::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--primary); cursor: pointer; }
  .range-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-tertiary); margin-top: 4px; }

  .btn-create-room, .btn-join {
    width: 100%;
    padding: 16px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 16px;
  }

  .btn-create-room:hover, .btn-join:hover { opacity: 0.9; }
  .btn-join:disabled { opacity: 0.5; cursor: not-allowed; }

  .join-container { text-align: center; }
  .join-container p { color: var(--text-secondary); margin-bottom: 24px; }
  .code-input-group { margin-bottom: 16px; }

  .code-input {
    width: 100%;
    max-width: 200px;
    padding: 20px;
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5em;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
  }

  .code-input:focus { outline: none; border-color: var(--primary); }

  .lobby-container { max-width: 500px; width: 100%; text-align: center; }
  .lobby-container h2 { margin-bottom: 24px; }

  .room-code-display {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .code-label { display: block; font-size: 0.8rem; color: var(--text-tertiary); margin-bottom: 8px; }
  .code-box { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .code { font-size: 2.5rem; font-weight: 700; letter-spacing: 0.3em; color: var(--primary); }

  .copy-btn {
    padding: 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-primary);
  }

  .room-code-display small { display: block; margin-top: 12px; font-size: 0.8rem; color: var(--text-tertiary); }

  .players-list {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
    max-height: 300px;
    overflow-y: auto;
  }

  .players-list h3 { margin: 0 0 16px; font-size: 0.9rem; color: var(--text-secondary); }

  .player-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border-radius: 10px;
    margin-bottom: 8px;
  }

  .player-card.waiting { opacity: 0.6; }
  .player-avatar { font-size: 1.5rem; }
  .player-name { flex: 1; text-align: left; font-weight: 500; }
  .host-badge, .bot-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
  .host-badge { background: #fef3c7; color: #d97706; }
  .bot-badge { background: #e0e7ff; color: #4f46e5; }
  .ready-status { color: #10b981; font-size: 0.9rem; }
  .min-players-note { font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px; text-align: center; }

  .loading-dots { display: flex; gap: 4px; }
  .loading-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--text-tertiary); animation: bounce 1.4s infinite ease-in-out; }
  .loading-dots span:nth-child(1) { animation-delay: 0s; }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

  .settings-summary { display: flex; justify-content: center; gap: 12px; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; }
  .lobby-actions { display: flex; flex-direction: column; gap: 12px; }

  .btn-start {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-secondary { padding: 14px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; color: var(--text-primary); }
  .btn-leave { padding: 12px; background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 10px; cursor: pointer; }

  .countdown-display { text-align: center; }
  .countdown-display h2 { margin-bottom: 24px; font-size: 1.5rem; }
  .countdown-number { font-size: 8rem; font-weight: 700; color: var(--primary); animation: pulse 1s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

  .battle-container { max-width: 700px; width: 100%; }
  .battle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .progress-info { font-size: 0.9rem; color: var(--text-secondary); }
  .timer { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--bg-secondary); border-radius: 30px; font-weight: 600; font-size: 1.2rem; }
  .timer.warning { color: #ef4444; background: #fee2e2; }

  .scoreboard { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; justify-content: center; }
  .score-card { flex: 0 1 120px; display: flex; flex-direction: column; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 12px; border: 2px solid var(--border-color); }
  .score-card.me { border-color: var(--primary); }
  .score-card .avatar { font-size: 1.3rem; margin-bottom: 2px; }
  .score-card .name { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .score-card .score { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

  .question-box { background: var(--bg-secondary); border-radius: 16px; padding: 32px; margin-bottom: 24px; font-size: 1.2rem; text-align: center; border: 1px solid var(--border-color); }
  .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .option-btn:hover:not(:disabled) { border-color: var(--primary); }
  .option-btn.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
  .option-btn.correct { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
  .option-btn.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
  .option-letter { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 6px; font-weight: 600; font-size: 0.85rem; }

  .results-container { max-width: 500px; width: 100%; text-align: center; }
  .results-header { margin-bottom: 32px; }
  .results-header svg.gold { color: #f59e0b; }
  .results-header svg.silver { color: #9ca3af; }
  .results-header h1 { font-size: 2.5rem; margin: 16px 0 8px; }
  .results-header p { color: var(--text-secondary); }

  .final-scores { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; max-height: 300px; overflow-y: auto; }
  .result-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); flex-shrink: 0; }
  .result-card.winner { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
  .result-card .rank { font-weight: 700; color: var(--text-tertiary); min-width: 24px; }
  .result-card.winner .rank { color: #f59e0b; }
  .result-card .avatar { font-size: 1.5rem; }
  .result-card .name { flex: 1; text-align: left; font-weight: 500; }
  .result-card .final-score { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

  .results-actions { display: flex; flex-direction: column; gap: 12px; }
  .btn-rematch { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; }
  .btn-primary { padding: 14px 28px; background: var(--primary); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }

  @media (max-width: 600px) { .battle-page { padding-bottom: 100px; } .options-grid { grid-template-columns: 1fr; } .scoreboard { flex-direction: column; } }
`;
