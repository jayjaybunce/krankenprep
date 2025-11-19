import React, { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { Check, Target, Video, ImagePlus, Bold, Italic, Highlighter, Trash2, Plus, Moon, Sun, ChevronDown, ChevronRight, Zap, Clock, MapPin, AlertTriangle, FileText, Edit2, Save, X, GripVertical, Settings, Gamepad2 } from 'lucide-react';

// Type Definitions
interface ContentBlock {
  type: 'text' | 'image' | 'video';
  value: string;
  caption?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  highlight?: boolean;
  color?: string;
}

interface Post {
  id: number;
  title: string;
  cardType: 'assignment' | 'warning' | 'cooldown' | 'positioning' | 'mechanic' | 'media' | 'general';
  content: ContentBlock[];
  linkedGameId?: number;
}

interface Phase {
  id: number;
  phaseNumber: number;
  name: string;
  isExpanded: boolean;
  isCurrent: boolean;
  hasNewNotes: boolean;
  posts: Post[];
}

interface Boss {
  id: number;
  name: string;
  status: 'killed' | 'progressing';
  phases: Phase[];
}

interface TimedEvent {
  id: number;
  time: number;
  type: 'spawn' | 'forcedMovement' | 'visualEffect';
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

interface Game {
  id: number;
  name: string;
  playerStart: { x: number; y: number };
  timedEvents: TimedEvent[];
}

interface GameEditorProps {
  game: Game;
  onClose: () => void;
  onAddEvent: (event: Omit<TimedEvent, 'id'>) => void;
  onRemoveEvent: (eventId: number) => void;
  darkMode: boolean;
}

interface MechanicGameProps {
  game: Game;
  onClose: () => void;
  darkMode: boolean;
}

const Home: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [currentGame, setCurrentGame] = useState<number | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [creatingGameForPost, setCreatingGameForPost] = useState<{ postId: number } | null>(null);
  const [newGameName, setNewGameName] = useState<string>('');
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  
  const [bosses, setBosses] = useState<Boss[]>([
    {
      id: 1,
      name: 'Gnarlroot',
      status: 'killed',
      phases: [
        {
          id: 1,
          phaseNumber: 1,
          name: 'Root Phase',
          isExpanded: true,
          isCurrent: false,
          hasNewNotes: false,
          posts: []
        }
      ]
    },
    {
      id: 2,
      name: 'Volcoross',
      status: 'progressing',
      phases: [
        {
          id: 3,
          phaseNumber: 3,
          name: 'First Overlaps',
          isExpanded: true,
          isCurrent: true,
          hasNewNotes: true,
          posts: [
            {
              id: 1,
              title: 'Mythic Mechanics',
              cardType: 'mechanic',
              content: [
                { type: 'text', value: 'There are 8 stars that spawn. Practice movement!', bold: false, color: '#ffffff' }
              ]
            }
          ]
        }
      ]
    }
  ]);

  useEffect(() => {
    if (!selectedBoss && bosses.length > 0) {
      setSelectedBoss(bosses[1]);
    }
  }, [bosses, selectedBoss]);

  const togglePhase = (phaseId: number): void => {
    if (!selectedBoss) return;
    const updatedBosses = bosses.map(boss => {
      if (boss.id === selectedBoss.id) {
        return {
          ...boss,
          phases: boss.phases.map(phase => 
            phase.id === phaseId ? { ...phase, isExpanded: !phase.isExpanded } : phase
          )
        };
      }
      return boss;
    });
    setBosses(updatedBosses);
    setSelectedBoss(updatedBosses.find(b => b.id === selectedBoss.id) || null);
  };

  const createGame = (gameName: string): number => {
    const newGame: Game = {
      id: Date.now(),
      name: gameName,
      playerStart: { x: 400, y: 300 },
      timedEvents: []
    };
    setGames([...games, newGame]);
    return newGame.id;
  };

  const handleCreateGame = (postId: number): void => {
    if (!newGameName.trim()) return;
    const gameId = createGame(newGameName.trim());
    
    const updatedBosses = bosses.map(boss => {
      if (boss.id === selectedBoss?.id) {
        return {
          ...boss,
          phases: boss.phases.map(phase => ({
            ...phase,
            posts: phase.posts.map(post => 
              post.id === postId ? { ...post, linkedGameId: gameId } : post
            )
          }))
        };
      }
      return boss;
    });
    
    setBosses(updatedBosses);
    setSelectedBoss(updatedBosses.find(b => b.id === selectedBoss?.id) || null);
    setCreatingGameForPost(null);
    setNewGameName('');
  };

  const addTimedEvent = (gameId: number, event: Omit<TimedEvent, 'id'>): void => {
    setGames(games.map(g => 
      g.id === gameId 
        ? { ...g, timedEvents: [...g.timedEvents, { ...event, id: Date.now() }] }
        : g
    ));
  };

  const removeTimedEvent = (gameId: number, eventId: number): void => {
    setGames(games.map(g => 
      g.id === gameId 
        ? { ...g, timedEvents: g.timedEvents.filter(e => e.id !== eventId) }
        : g
    ));
  };

  const getCardStyles = (cardType: Post['cardType']): string => {
    const styles: Record<Post['cardType'], string> = {
      assignment: 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10',
      warning: 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-500/10',
      cooldown: 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10',
      positioning: 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10',
      mechanic: 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-500/10',
      media: 'bg-neutral-900 border-neutral-800',
      general: 'bg-neutral-900/50 border-neutral-800'
    };
    return styles[cardType];
  };

  const getCardIcon = (cardType: Post['cardType']): ReactElement => {
    const icons: Record<Post['cardType'], ReactElement> = {
      assignment: <Target className="w-5 h-5 text-cyan-400" />,
      warning: <AlertTriangle className="w-5 h-5 text-red-400" />,
      cooldown: <Clock className="w-5 h-5 text-amber-400" />,
      positioning: <MapPin className="w-5 h-5 text-emerald-400" />,
      mechanic: <Zap className="w-5 h-5 text-purple-400" />,
      media: <Video className="w-5 h-5 text-neutral-400" />,
      general: <FileText className="w-5 h-5 text-neutral-400" />
    };
    return icons[cardType];
  };

  const getPhaseColor = (phaseNumber: number): string => {
    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500'];
    return colors[phaseNumber - 1] || colors[0];
  };

  if (!selectedBoss) {
    return <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">Loading...</div>;
  }

  if (currentGame) {
    const game = games.find(g => g.id === currentGame);
    if (!game) {
      setCurrentGame(null);
      return null;
    }
    return (
      <div className="flex h-screen bg-neutral-950">
        <MechanicGame 
          game={game}
          onClose={() => setCurrentGame(null)}
          darkMode={darkMode}
        />
      </div>
    );
  }

  if (editingGameId) {
    const game = games.find(g => g.id === editingGameId);
    if (!game) {
      setEditingGameId(null);
      return null;
    }
    return (
      <div className="flex h-screen bg-neutral-950">
        <GameEditor
          game={game}
          onClose={() => setEditingGameId(null)}
          onAddEvent={(event) => addTimedEvent(editingGameId, event)}
          onRemoveEvent={(eventId) => removeTimedEvent(editingGameId, eventId)}
          darkMode={darkMode}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950">
      <div className="w-72 bg-black border-r border-neutral-900 flex flex-col">
        <div className="p-5 border-b border-neutral-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Raid Prep</h1>
              <p className="text-xs text-neutral-500">Boss Strategies</p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition text-sm mb-2"
          >
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </button>

          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${isAdmin ? 'bg-cyan-600 text-white' : 'bg-neutral-900 text-neutral-300'} transition text-sm`}
          >
            <Settings className="w-4 h-4" />
            <span>{isAdmin ? 'Admin: ON' : 'Admin: OFF'}</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs uppercase text-neutral-500 font-semibold">Progression</h2>
            </div>
            {bosses.filter(b => b.status === 'progressing').map(boss => (
              <button
                key={boss.id}
                onClick={() => setSelectedBoss(boss)}
                className={`w-full text-left px-3 py-2.5 rounded-md mb-1 flex items-center gap-3 ${
                  selectedBoss.id === boss.id ? 'bg-neutral-900 text-white border-l-2 border-cyan-500' : 'text-neutral-400 hover:bg-neutral-900'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedBoss.id === boss.id ? 'bg-amber-500' : 'bg-neutral-700'}`}></div>
                <span className="text-sm font-medium">{boss.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">{selectedBoss.name}</h2>
          </div>

          {selectedBoss.phases?.map(phase => (
            <div key={phase.id} className="mb-4">
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800"
              >
                <div className={`w-8 h-8 ${getPhaseColor(phase.phaseNumber)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {phase.phaseNumber}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">{phase.name}</h3>
                  <p className="text-xs text-neutral-500">{phase.posts.length} notes</p>
                </div>
                {phase.isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
              </button>

              {phase.isExpanded && (
                <div className="mt-3 ml-11 space-y-3">
                  {phase.posts.map(post => (
                    <div key={post.id} className={`${getCardStyles(post.cardType)} border rounded-lg p-4`}>
                      <div className="flex items-center gap-2 mb-3">
                        {getCardIcon(post.cardType)}
                        <h4 className="font-semibold text-white">{post.title}</h4>
                      </div>

                      <div className="flex gap-2 mb-3">
                        <a
                          href="https://www.youtube.com/results?search_query=wow+mythic+boss+guide"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-md text-xs"
                        >
                          <Video className="w-3 h-3" />
                          Watch Example
                        </a>
                        {post.linkedGameId ? (
                          <>
                            <button
                              onClick={() => setCurrentGame(post.linkedGameId!)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-md text-xs"
                            >
                              <Gamepad2 className="w-3 h-3" />
                              Try It Yourself
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => setEditingGameId(post.linkedGameId!)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700 text-neutral-400 border border-neutral-600 rounded-md text-xs"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit Game
                              </button>
                            )}
                          </>
                        ) : isAdmin && (
                          <button
                            onClick={() => setCreatingGameForPost({ postId: post.id })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700 text-neutral-400 border border-neutral-600 rounded-md text-xs"
                          >
                            <Plus className="w-3 h-3" />
                            Create Game
                          </button>
                        )}
                      </div>

                      {creatingGameForPost?.postId === post.id && (
                        <div className="mb-3 p-3 bg-neutral-800 rounded-md border border-neutral-700">
                          <label className="block text-sm font-medium mb-2 text-neutral-300">Game Name</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newGameName}
                              onChange={(e) => setNewGameName(e.target.value)}
                              placeholder="e.g., Star Positioning"
                              className="flex-1 bg-neutral-700 text-white px-3 py-2 rounded-md text-sm"
                            />
                            <button
                              onClick={() => handleCreateGame(post.id)}
                              className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setCreatingGameForPost(null);
                                setNewGameName('');
                              }}
                              className="px-4 py-2 bg-neutral-700 text-white rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {post.content.map((block, idx) => (
                          <p key={idx} className="text-neutral-300">{block.value}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GameEditor: React.FC<GameEditorProps> = ({ game, onClose, onAddEvent, onRemoveEvent, darkMode }) => {
  const [eventType, setEventType] = useState<'spawn' | 'forcedMovement' | 'visualEffect'>('spawn');
  const [eventTime, setEventTime] = useState<number>(3);

  const addEvent = (): void => {
    if (eventType === 'spawn') {
      onAddEvent({ time: eventTime, type: 'spawn', x: 400, y: 300, radius: 50, color: '#ef4444' });
    }
    setEventTime(eventTime + 3);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-neutral-900 border-neutral-800 border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Game: {game.name}</h2>
            <p className="text-sm text-neutral-400">Add timed events</p>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-neutral-700 text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Add Event</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2 text-neutral-300">Time (seconds)</label>
                <input
                  type="number"
                  value={eventTime}
                  onChange={(e) => setEventTime(Number(e.target.value))}
                  className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md"
                />
              </div>
              <div className="col-span-2 flex items-end">
                <button
                  onClick={addEvent}
                  className="w-full bg-cyan-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Spawn Event
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Events ({game.timedEvents.length})</h3>
            {game.timedEvents.length === 0 ? (
              <div className="text-center py-12 text-neutral-600">
                <p className="text-sm">No events yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {game.timedEvents.map(event => (
                  <div key={event.id} className="p-4 bg-neutral-800 border-neutral-700 border rounded-lg flex items-center justify-between">
                    <span className="text-white">{event.time}s - Spawn at ({event.x}, {event.y})</span>
                    <button onClick={() => onRemoveEvent(event.id)} className="p-2 bg-red-600 text-white rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MechanicGame: React.FC<MechanicGameProps> = ({ game, onClose, darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(game.playerStart);
  const [gameTime, setGameTime] = useState<number>(0);
  const [spawnedObjects, setSpawnedObjects] = useState<Array<TimedEvent & { eventId: number }>>([]);
  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        keysPressed.current[e.key.toLowerCase()] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        keysPressed.current[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(t => t + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    game.timedEvents.forEach(event => {
      if (Math.abs(gameTime - event.time) < 0.05 && !spawnedObjects.find(o => o.eventId === event.id)) {
        if (event.type === 'spawn') {
          setSpawnedObjects(prev => [...prev, { ...event, eventId: event.id }]);
        }
      }
    });
  }, [gameTime, game.timedEvents, spawnedObjects]);

  useEffect(() => {
    const speed = 3;
    const gameLoop = (): void => {
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current['w']) newY -= speed;
        if (keysPressed.current['s']) newY += speed;
        if (keysPressed.current['a']) newX -= speed;
        if (keysPressed.current['d']) newX += speed;

        newX = Math.max(15, Math.min(785, newX));
        newY = Math.max(15, Math.min(585, newY));
        return { x: newX, y: newY };
      });
    };

    const animationId = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(animationId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    spawnedObjects.forEach(obj => {
      if (obj.x !== undefined && obj.y !== undefined && obj.radius !== undefined && obj.color) {
        ctx.fillStyle = obj.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Time: ${gameTime.toFixed(1)}s`, 10, 30);
  }, [playerPos, spawnedObjects, gameTime]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="p-4 border-b bg-neutral-900 border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{game.name}</h2>
          <p className="text-sm text-neutral-400">Use WASD to move</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-neutral-700 text-white rounded-md flex items-center gap-2">
          <X className="w-4 h-4" />
          Close
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <canvas ref={canvasRef} width={800} height={600} className="border-2 border-neutral-800 rounded-lg" />
      </div>
    </div>
  );
};

export default Home;