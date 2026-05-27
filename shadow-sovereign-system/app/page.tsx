"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  User, 
  Lock, 
  AlertTriangle, 
  UserCheck, 
  ZapOff, 
  Trash2, 
  Settings, 
  Activity, 
  Award, 
  Terminal, 
  Timer, 
  Plus, 
  Minus, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Dumbbell, 
  Compass, 
  RefreshCw,
  Clock,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// Synthesize cyber sound effects via Web Audio API (safe for Server-Side Rendering)
function playSystemSound(type: "click" | "upgrade" | "complete" | "alert" | "timer_click", muted: boolean) {
  if (muted || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    switch (type) {
      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        break;
      }
      case "upgrade": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc1.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        osc1.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.4); // C6
        
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.4); // G6
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.5);
        break;
      }
      case "complete": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      case "alert": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        break;
      }
      case "timer_click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.02);
        break;
      }
    }
  } catch (e) {
    console.warn("Audio Context init blocked or not supported:", e);
  }
}

// Custom security hashing protocol for storing passwords locally & in Supabase
function hashPassword(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "SJV_SECURE_" + Math.abs(hash).toString(16) + "_" + btoa(pwd.split("").reverse().join("")).substring(0, 10);
}

// Generate default statistics history
function generateDefaultHistory(st: any) {
  return [
    { name: "Sem 1", força: st.strength - 4, agilidade: st.agility - 3, inteligência: st.intelligence - 2, foco: st.focus - 1 },
    { name: "Sem 2", força: st.strength - 2, agilidade: st.agility - 2, inteligência: st.intelligence - 1, foco: st.focus },
    { name: "Atual", força: st.strength, agilidade: st.agility, inteligência: st.intelligence, foco: st.focus },
  ];
}

// Available dashboard visual themes
interface ThemeColors {
  primary: string;
  glow: string;
  accent: string;
  bgGlow: string;
  borderClass: string;
  tabActive: string;
  scanClass: string;
}

const themeColors: Record<string, ThemeColors> = {
  shadow: {
    primary: "#00d1ff",
    glow: "rgba(0, 209, 255, 0.25)",
    accent: "#a855f7",
    bgGlow: "from-blue-950/20 to-purple-950/10",
    borderClass: "border-[#00d1ff]/30",
    tabActive: "border-[#00d1ff] text-[#00d1ff] bg-[#00d1ff]/5",
    scanClass: "shadow-scan border-t-2 border-[#00d1ff]/20 animate-pulse",
  },
  crimson: {
    primary: "#ef4444",
    glow: "rgba(239, 68, 68, 0.25)",
    accent: "#f97316",
    bgGlow: "from-rose-950/20 to-amber-950/10",
    borderClass: "border-red-500/30",
    tabActive: "border-red-500 text-red-500 bg-red-500/5",
    scanClass: "shadow-scan border-t-2 border-red-500/20 animate-pulse",
  },
  amber: {
    primary: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.25)",
    accent: "#10b981",
    bgGlow: "from-amber-950/20 to-emerald-950/10",
    borderClass: "border-amber-500/30",
    tabActive: "border-amber-500 text-amber-500 bg-amber-500/5",
    scanClass: "shadow-scan border-t-2 border-amber-500/20 animate-pulse",
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "pomodoro" | "quests" | "milestones" | "ai-core" | "settings" >("dashboard");
  const [initLoaded, setInitLoaded] = useState(false);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authNickname, setAuthNickname] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Custom confirmation modal state for sandboxed iframe compatibility
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null>(null);

  // Sovereign stats
  const [username, setUsername] = useState("Sung Jin-Woo");
  const [playerRank, setPlayerRank] = useState<"S" | "A" | "B" | "C" | "D" | "E">("E");
  const [level, setLevel] = useState(24);
  const [exp, setExp] = useState(1250);
  const [nextLevelExp, setNextLevelExp] = useState(3000);
  const [availableStatPoints, setAvailableStatPoints] = useState(5);
  const [avatar, setAvatar] = useState("shadow_shadow_monarch");
  const [visualTheme, setVisualTheme] = useState("shadow");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const [stats, setStats] = useState({
    strength: 48,
    agility: 45,
    intelligence: 30,
    focus: 28,
    discipline: 35,
    creativity: 26
  });

  const [statsHistory, setStatsHistory] = useState<any[]>(generateDefaultHistory({
    strength: 48,
    agility: 45,
    intelligence: 30,
    focus: 28,
    discipline: 35,
    creativity: 26
  }));

  // Daily Solo Leveling Quests Schema
  const [quests, setQuests] = useState([
    { id: "quest_pushup", label: "Flexões de Braço", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "strength" },
    { id: "quest_situp", label: "Abdominais Diários", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "discipline" },
    { id: "quest_squat", label: "Agachamentos Sombrios", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "agility" },
    { id: "quest_run", label: "Corrida de Resistência", current: 0.0, target: 10, unit: "km", rewardExp: 800, rewardStat: "focus" }
  ]);

  // Legendary Milestones
  const [milestones, setMilestones] = useState([
    { id: "ms_double_dun", label: "Sobrevivente do Templo Duplo", desc: "Escapar com vida da masmorra oculta Rank D", unlocked: true },
    { id: "ms_rank_c", label: "Superação Neural Rank C", desc: "Atingir nível 40 no portal de treinamento", unlocked: false },
    { id: "ms_monarch", label: "Herdeiro do Monarca das Sombras", desc: "Liberar a classe de Necromancia Sombria", unlocked: false }
  ]);

  // Achievements State
  const [achievements, setAchievements] = useState([
    { id: "ach_1", title: "O Despertar", desc: "Concluir a primeira sessão do Portal Pomodoro", done: false },
    { id: "ach_2", title: "Treino de Ferro", desc: "Completar todas as tarefas de treinamento diário", done: false },
    { id: "ach_3", title: "Supremacia Sombria", desc: "Elevar qualquer estatística de combate acima de 80", done: false }
  ]);

  // Focus Pomodoro Engine
  const [pomoTime, setPomoTime] = useState(1500); // 25 minutes standard
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<"focus" | "break">("focus");
  const pomoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // System System Bot Chat AI Core console interface logic
  const [systemLogs, setSystemLogs] = useState<Array<{ sender: "system" | "hunter"; text: string; time: string }>>([
    { sender: "system", text: "CONEXÃO COM O SISTEMA ATIVA. Pronto para instrução neural.", time: "05:00:00" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Helper loader to apply loaded progress to React states
  const applyLoadedState = (s: any) => {
    if (s.username) setUsername(s.username);
    if (s.playerRank) setPlayerRank(s.playerRank);
    if (s.level) setLevel(s.level);
    if (s.exp) setExp(s.exp);
    if (s.nextLevelExp) setNextLevelExp(s.nextLevelExp);
    if (s.availableStatPoints !== undefined) setAvailableStatPoints(s.availableStatPoints);
    if (s.avatar) setAvatar(s.avatar);
    if (s.stats) setStats(s.stats);
    if (s.quests) setQuests(s.quests);
    if (s.milestones) setMilestones(s.milestones);
    if (s.achievements) setAchievements(s.achievements);
    if (s.visualTheme) setVisualTheme(s.visualTheme);
    if (s.animationsEnabled !== undefined) setAnimationsEnabled(s.animationsEnabled);
    if (s.isMuted !== undefined) setIsMuted(s.isMuted);
    if (s.statsHistory) {
      setStatsHistory(s.statsHistory);
    } else if (s.stats) {
      setStatsHistory(generateDefaultHistory(s.stats));
    }
  };

  // 1. Startup: Load logged-in users / fallback to local storage safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadState = async () => {
        try {
          const loggedUser = localStorage.getItem("shadow_sovereign_current_user");

          // Seed default offline cache records if none exist
          const usersStr = localStorage.getItem("shadow_sovereign_users");
          let users = usersStr ? JSON.parse(usersStr) : {};
          if (Object.keys(users).length === 0) {
            const defaultSave = {
              username: "Sung Jin-Woo",
              playerRank: "E",
              level: 24,
              exp: 1250,
              nextLevelExp: 3000,
              availableStatPoints: 5,
              stats: {
                strength: 48,
                agility: 45,
                intelligence: 30,
                focus: 28,
                discipline: 35,
                creativity: 26
              },
              visualTheme: "shadow",
              animationsEnabled: true,
              isMuted: false
            };
            users["Sung Jin-Woo"] = {
              username: "Sung Jin-Woo",
              passwordHash: "SJV_SECURE_35dcaf38_d29kYWhz", // hash corresponding to password 'shadow'
              saveState: defaultSave
            };
            localStorage.setItem("shadow_sovereign_users", JSON.stringify(users));
          }

          if (isSupabaseConfigured && supabase) {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user && user.email) {
                const { data, error } = await supabase
                  .from("hunters")
                  .select("save_state")
                  .eq("id", user.id)
                  .maybeSingle();

                let finalData = data;
                if (!finalData && !error) {
                  const { data: fallbackByEmail } = await supabase
                    .from("hunters")
                    .select("save_state")
                    .eq("email", user.email)
                    .maybeSingle();
                  finalData = fallbackByEmail;
                }

                if (finalData && finalData.save_state) {
                  applyLoadedState(finalData.save_state);
                  setCurrentUser(user.email);
                  localStorage.setItem("shadow_sovereign_current_user", user.email);
                  setInitLoaded(true);
                  return;
                }
              }
            } catch (authErr) {
              console.warn("Failed checking Supabase Auth session:", authErr);
            }
          }

          if (loggedUser) {
            if (isSupabaseConfigured && supabase) {
              let query = supabase.from("hunters").select("save_state");
              if (loggedUser.includes("@")) {
                query = query.eq("email", loggedUser);
              } else {
                query = query.eq("username", loggedUser);
              }
              const { data, error } = await query.maybeSingle();

              if (!error && data && data.save_state) {
                applyLoadedState(data.save_state);
                setCurrentUser(loggedUser);
                setInitLoaded(true);
                return;
              }
            }

            // Fallback Local Storage
            if (users[loggedUser] && users[loggedUser].saveState) {
              applyLoadedState(users[loggedUser].saveState);
              setCurrentUser(loggedUser);
              setInitLoaded(true);
              return;
            }
          }

          // Global backup fallback
          const globalSave = localStorage.getItem("shadow_sovereign_save");
          if (globalSave) {
            applyLoadedState(JSON.parse(globalSave));
          }
        } catch (err) {
          console.warn("Could not reload startup progress:", err);
        } finally {
          setInitLoaded(true);
        }
      };

      loadState();
    }
  }, []);

  // 2. State-Sync Auto Saver
  useEffect(() => {
    if (initLoaded && typeof window !== "undefined") {
      try {
        const saveState = {
          username,
          playerRank,
          level,
          exp,
          nextLevelExp,
          availableStatPoints,
          avatar,
          stats,
          statsHistory,
          quests,
          milestones,
          achievements,
          visualTheme,
          animationsEnabled,
          isMuted
        };

        // Standard local backup cache
        localStorage.setItem("shadow_sovereign_save", JSON.stringify(saveState));

        if (currentUser) {
          // Sync with Supabase in background
          if (isSupabaseConfigured && supabase) {
            let updateQuery = supabase.from("hunters").update({ save_state: saveState, updated_at: new Date().toISOString() });
            if (currentUser.includes("@")) {
              updateQuery = updateQuery.eq("email", currentUser);
            } else {
              updateQuery = updateQuery.eq("username", currentUser);
            }
            updateQuery.then(({ error }) => {
              if (error) {
                console.warn("Sincronização de progresso para a rede Supabase falhou:", error.message);
              }
            });
          }

          // Redundant Offline Database update
          const usersStr = localStorage.getItem("shadow_sovereign_users");
          const users = usersStr ? JSON.parse(usersStr) : {};
          if (users[currentUser]) {
            users[currentUser].saveState = saveState;
            localStorage.setItem("shadow_sovereign_users", JSON.stringify(users));
          }
        }
      } catch (err) {
        console.warn("Auto save error:", err);
      }
    }
  }, [
    currentUser,
    username,
    playerRank,
    level,
    exp,
    nextLevelExp,
    availableStatPoints,
    avatar,
    stats,
    statsHistory,
    quests,
    milestones,
    achievements,
    visualTheme,
    animationsEnabled,
    isMuted,
    initLoaded
  ]);

  // 3. Clear System Alert messages
  useEffect(() => {
    if (systemAlertMessage) {
      const timer = setTimeout(() => {
        setSystemAlertMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [systemAlertMessage]);

  // 4. Focus Pomodoro Interval Hook
  useEffect(() => {
    if (pomoActive) {
      pomoTimerRef.current = setInterval(() => {
        setPomoTime((prev) => {
          if (prev <= 1) {
            clearInterval(pomoTimerRef.current!);
            setPomoActive(false);
            handlePomoFinish();
            return 0;
          }
          if (prev % 60 === 0) {
            playSystemSound("timer_click", isMuted);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    }
    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoActive, pomoMode]);

  const handlePomoFinish = () => {
    playSystemSound("upgrade", isMuted);
    if (pomoMode === "focus") {
      // Focus complete rewards
      const expGain = 450;
      setSystemAlertMessage(`[Foco Concluído] Matriz neural sincronizada! Recebeu +${expGain} EXP.`);
      addExperience(expGain);
      
      // Update first achievement
      setAchievements((prev) =>
        prev.map((a) => (a.id === "ach_1" ? { ...a, done: true } : a))
      );
      
      setPomoMode("break");
      setPomoTime(300); // 5 mins break
    } else {
      setSystemAlertMessage(`[Fim de Intervalo] Modo Foco Sombrio reativado.`);
      setPomoMode("focus");
      setPomoTime(1500); // 25 mins focus
    }
  };

  // 5. XP and level state evolution logic
  const addExperience = (amount: number) => {
    setExp((prev) => {
      let totalXp = prev + amount;
      let currentLevel = level;
      let cap = nextLevelExp;
      let levelUpstream = false;

      while (totalXp >= cap) {
        totalXp -= cap;
        currentLevel += 1;
        cap = Math.floor(cap * 1.25);
        levelUpstream = true;
      }

      if (levelUpstream) {
        setLevel(currentLevel);
        setNextLevelExp(cap);
        setAvailableStatPoints((pts) => pts + 5);
        
        // Evolve Character Rank based on level automatically
        let newRank = playerRank;
        if (currentLevel >= 70) newRank = "S";
        else if (currentLevel >= 55) newRank = "A";
        else if (currentLevel >= 40) newRank = "B";
        else if (currentLevel >= 32) newRank = "C";
        else if (currentLevel >= 25) newRank = "D";

        if (newRank !== playerRank) {
          setPlayerRank(newRank);
          setSystemAlertMessage(`[EVOLUÇÃO] Novo Patamar alcançado! Rank ${newRank}`);
        } else {
          setSystemAlertMessage(`[LEVEL UP] Seu potencial neural aumentou para o Level ${currentLevel}!`);
        }
        playSystemSound("upgrade", isMuted);

        // Update Rank B/C milestones
        if (currentLevel >= 40) {
          setMilestones((p) =>
            p.map((m) => (m.id === "ms_rank_c" ? { ...m, unlocked: true } : m))
          );
        }
      } else {
        playSystemSound("complete", isMuted);
      }

      return totalXp;
    });
  };

  // 6. Handle Hunter login verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword) {
      setAuthError("E-mail e senha de acesso são obrigatórios.");
      playSystemSound("alert", isMuted);
      return;
    }

    const normalizedEmail = authEmail.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        setSystemAlertMessage("Validando credenciais de portador no Supabase Auth...");
        
        const { data: authData, error: authErrorResult } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: authPassword,
        });

        if (authErrorResult) {
          setAuthError(`Assinatura de Caçador inválida: ${authErrorResult.message}`);
          playSystemSound("alert", isMuted);
          return;
        }

        if (!authData.user) {
          setAuthError("Erro ao recuperar perfil do caçador.");
          playSystemSound("alert", isMuted);
          return;
        }

        setSystemAlertMessage("Baixando save correspondente do portal...");

        // Query by authenticated id (uuid) or fallback to email
        const { data: userRecord, error: fetchError } = await supabase
          .from("hunters")
          .select("*")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (fetchError) {
          console.warn("Could not fetch hunter profile by ID, trying email fallback:", fetchError.message);
        }

        let finalRecord = userRecord;
        if (!finalRecord) {
          const { data: fallbackRecord } = await supabase
            .from("hunters")
            .select("*")
            .eq("email", normalizedEmail)
            .maybeSingle();
          finalRecord = fallbackRecord;
        }

        // DB Success
        setCurrentUser(normalizedEmail);
        localStorage.setItem("shadow_sovereign_current_user", normalizedEmail);

        if (finalRecord && finalRecord.save_state) {
          applyLoadedState(finalRecord.save_state);
          setSystemAlertMessage(`Sincronização concluída! Caçador ${finalRecord.username} autenticado.`);
        } else {
          // Build default state if the sync fails or first-time
          const defaultSave = {
            username: authData.user.user_metadata?.username || normalizedEmail.split("@")[0],
            playerRank: "E",
            level: 1,
            exp: 0,
            nextLevelExp: 1000,
            availableStatPoints: 5,
            stats: {
              strength: 10,
              agility: 10,
              intelligence: 10,
              focus: 10,
              discipline: 10,
              creativity: 10
            },
            statsHistory: generateDefaultHistory({
              strength: 10,
              agility: 10,
              intelligence: 10,
              focus: 10,
              discipline: 10,
              creativity: 10
            }),
            quests: [
              { id: "quest_pushup", label: "Flexões de Braço", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "strength" },
              { id: "quest_situp", label: "Abdominais Diários", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "discipline" },
              { id: "quest_squat", label: "Agachamentos Sombrios", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "agility" },
              { id: "quest_run", label: "Corrida de Resistência", current: 0.0, target: 10, unit: "km", rewardExp: 800, rewardStat: "focus" }
            ],
            milestones: [
              { id: "ms_double_dun", label: "Sobrevivente do Templo Duplo", desc: "Escapar com vida da masmorra oculta Rank D", unlocked: true },
              { id: "ms_rank_c", label: "Superação Neural Rank C", desc: "Atingir nível 40 no portal de treinamento", unlocked: false },
              { id: "ms_monarch", label: "Herdeiro do Monarca das Sombras", desc: "Liberar a classe de Necromancia Sombria", unlocked: false }
            ],
            achievements: [
              { id: "ach_1", title: "O Despertar", desc: "Concluir a primeira sessão do Portal Pomodoro", done: false },
              { id: "ach_2", title: "Treino de Ferro", desc: "Completar todas as tarefas de treinamento diário", done: false },
              { id: "ach_3", title: "Supremacia Sombria", desc: "Elevar qualquer estatística de combate acima de 80", done: false }
            ],
            visualTheme: "shadow",
            animationsEnabled: true,
            isMuted: false
          };
          applyLoadedState(defaultSave);

          // Persist the state using upsert by user id
          await supabase.from("hunters").upsert({
            id: authData.user.id,
            email: normalizedEmail,
            username: authData.user.user_metadata?.username || normalizedEmail.split("@")[0],
            save_state: defaultSave,
            updated_at: new Date().toISOString()
          });

          setSystemAlertMessage(`Bem-vindo, Caçador ${authData.user.user_metadata?.username || normalizedEmail.split("@")[0]}!`);
        }

        playSystemSound("complete", isMuted);
        return;
      } catch (err: any) {
        console.warn("Supabase auth failed, applying local database fallback:", err);
        setSystemAlertMessage("Conexão direta com Supabase indisponível. Ativando cache local.");
      }
    }

    // React native memory fallback
    const usersStr = localStorage.getItem("shadow_sovereign_users");
    const users = usersStr ? JSON.parse(usersStr) : {};

    const userRecordLoc = users[normalizedEmail] || users[authEmail.trim()];
    if (!userRecordLoc) {
      setAuthError("Nenhum caçador correspondente registrado localmente.");
      playSystemSound("alert", isMuted);
      return;
    }

    const hashedPassword = hashPassword(authPassword);
    if (userRecordLoc.passwordHash !== hashedPassword && userRecordLoc.passwordHash !== authPassword) {
      setAuthError("Código de acesso incorreto.");
      playSystemSound("alert", isMuted);
      return;
    }

    setCurrentUser(userRecordLoc.email || userRecordLoc.username);
    localStorage.setItem("shadow_sovereign_current_user", userRecordLoc.email || userRecordLoc.username);

    if (userRecordLoc.saveState) {
      applyLoadedState(userRecordLoc.saveState);
    } else {
      setUsername(userRecordLoc.username || "Sung Jin-Woo");
    }

    setSystemAlertMessage(`Bem-vindo, Caçador ${userRecordLoc.username || normalizedEmail}! (Carregado do cache local)`);
    playSystemSound("complete", isMuted);
  };

  // Handle Hunter Registration (Sign Up)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword) {
      setAuthError("E-mail e senha correspondentes de Hunter são obrigatórios.");
      playSystemSound("alert", isMuted);
      return;
    }

    const normalizedEmail = authEmail.trim().toLowerCase();
    const normalizedUsername = authNickname.trim() || normalizedEmail.split("@")[0];

    const defaultSave = {
      username: normalizedUsername,
      playerRank: "E",
      level: 1,
      exp: 0,
      nextLevelExp: 1000,
      availableStatPoints: 5,
      stats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        focus: 10,
        discipline: 10,
        creativity: 10
      },
      statsHistory: generateDefaultHistory({
        strength: 10,
        agility: 10,
        intelligence: 10,
        focus: 10,
        discipline: 10,
        creativity: 10
      }),
      quests: [
        { id: "quest_pushup", label: "Flexões de Braço", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "strength" },
        { id: "quest_situp", label: "Abdominais Diários", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "discipline" },
        { id: "quest_squat", label: "Agachamentos Sombrios", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "agility" },
        { id: "quest_run", label: "Corrida de Resistência", current: 0.0, target: 10, unit: "km", rewardExp: 800, rewardStat: "focus" }
      ],
      milestones: [
        { id: "ms_double_dun", label: "Sobrevivente do Templo Duplo", desc: "Escapar com vida da masmorra oculta Rank D", unlocked: true },
        { id: "ms_rank_c", label: "Superação Neural Rank C", desc: "Atingir nível 40 no portal de treinamento", unlocked: false },
        { id: "ms_monarch", label: "Herdeiro do Monarca das Sombras", desc: "Liberar a classe de Necromancia Sombria", unlocked: false }
      ],
      achievements: [
        { id: "ach_1", title: "O Despertar", desc: "Concluir a primeira sessão do Portal Pomodoro", done: false },
        { id: "ach_2", title: "Treino de Ferro", desc: "Completar todas as tarefas de treinamento diário", done: false },
        { id: "ach_3", title: "Supremacia Sombria", desc: "Elevar qualquer estatística de combate acima de 80", done: false }
      ],
      visualTheme: "shadow",
      animationsEnabled: true,
      isMuted: false
    };

    if (isSupabaseConfigured && supabase) {
      try {
        setSystemAlertMessage("Criando credenciais de portador com Supabase Auth...");
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: authPassword,
          options: {
            data: {
              username: normalizedUsername
            }
          }
        });

        if (signUpError) {
          setAuthError(`Erro no cadastro do Supabase: ${signUpError.message}`);
          playSystemSound("alert", isMuted);
          return;
        }

        if (!authData.user) {
          setAuthError("Erro na criação de credenciais do Supabase.");
          playSystemSound("alert", isMuted);
          return;
        }

        // Row creation in `hunters` table is fully automated by the DB trigger "on_auth_user_created".
        // No manual inserts into hunters are executed here!
        setCurrentUser(normalizedEmail);
        localStorage.setItem("shadow_sovereign_current_user", normalizedEmail);
        applyLoadedState(defaultSave);

        setSystemAlertMessage(`Bem-vindo ao Sistema, ${normalizedUsername}! Conexão neural estabelecida.`);
        playSystemSound("complete", isMuted);
        return;
      } catch (err: any) {
        console.warn("Por favor, verifique sua conexão ou configuração do Supabase:", err);
        setSystemAlertMessage("Ocorreu um erro no servidor Supabase. Registrando no cache local.");
      }
    }

    // LocalStorage Fallback
    const usersStr = localStorage.getItem("shadow_sovereign_users");
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (users[normalizedEmail]) {
      setAuthError("Este e-mail de Caçador já está registrado localmente.");
      playSystemSound("alert", isMuted);
      return;
    }

    const hashedPassword = hashPassword(authPassword);
    users[normalizedEmail] = {
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash: hashedPassword,
      saveState: defaultSave
    };

    localStorage.setItem("shadow_sovereign_users", JSON.stringify(users));

    setCurrentUser(normalizedEmail);
    localStorage.setItem("shadow_sovereign_current_user", normalizedEmail);
    applyLoadedState(defaultSave);

    setSystemAlertMessage(`Cadastro concluído localmente! Caçador ${normalizedUsername} autenticado.`);
    playSystemSound("complete", isMuted);
  };

  // 7. Profile logout
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Desconectar Terminal Neural",
      description: "Deseja desconectar sua chave neural deste terminal de portador? Você precisará entrar novamente para sincronizar os dados.",
      confirmText: "Sim, Desconectar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        playSystemSound("alert", isMuted);
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.warn("Error signing out of Supabase session:", e);
          }
        }
        setCurrentUser(null);
        localStorage.removeItem("shadow_sovereign_current_user");
        setAuthEmail("");
        setAuthNickname("");
        setAuthPassword("");
        setAuthError(null);
        setConfirmModal(null);
      }
    });
  };

  // 8. Incremental stats allocator
  const handleUpgradeStat = (statName: keyof typeof stats) => {
    if (availableStatPoints > 0) {
      playSystemSound("click", isMuted);
      const newStats = {
        ...stats,
        [statName]: stats[statName] + 1
      };
      setStats(newStats);
      setAvailableStatPoints((prev) => prev - 1);

      // Refresh Stats History
      setStatsHistory((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (lastIdx >= 0) {
          copy[lastIdx] = {
            ...copy[lastIdx],
            força: statName === "strength" ? copy[lastIdx].força + 1 : copy[lastIdx].força,
            agilidade: statName === "agility" ? copy[lastIdx].agilidade + 1 : copy[lastIdx].agilidade,
            inteligência: statName === "intelligence" ? copy[lastIdx].inteligência + 1 : copy[lastIdx].inteligência,
            foco: statName === "focus" ? copy[lastIdx].foco + 1 : copy[lastIdx].foco,
          };
        }
        return copy;
      });

      // Supremacy achievement
      if (newStats[statName] >= 80) {
        setAchievements((prev) =>
          prev.map((a) => (a.id === "ach_3" ? { ...a, done: true } : a))
        );
      }
    }
  };

  // 9. Incremental stats reducer (refund)
  const handleDowngradeStat = (statName: keyof typeof stats) => {
    // Basic floor constraints (cannot refund past typical base characters)
    const baseFloor = 10;
    if (stats[statName] > baseFloor) {
      playSystemSound("alert", isMuted);
      setStats({
        ...stats,
        [statName]: stats[statName] - 1
      });
      setAvailableStatPoints((prev) => prev + 1);

      setStatsHistory((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (lastIdx >= 0) {
          copy[lastIdx] = {
            ...copy[lastIdx],
            força: statName === "strength" ? Math.max(baseFloor, copy[lastIdx].força - 1) : copy[lastIdx].força,
            agilidade: statName === "agility" ? Math.max(baseFloor, copy[lastIdx].agilidade - 1) : copy[lastIdx].agilidade,
            inteligência: statName === "intelligence" ? Math.max(baseFloor, copy[lastIdx].inteligência - 1) : copy[lastIdx].inteligência,
            foco: statName === "focus" ? Math.max(baseFloor, copy[lastIdx].foco - 1) : copy[lastIdx].foco,
          };
        }
        return copy;
      });
    }
  };

  // 10. Quest Completion Action
  const handleUpdateQuestProgress = (id: string, step: number) => {
    playSystemSound("click", isMuted);
    
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextVal = Math.min(q.target, q.current + step);
          if (nextVal >= q.target && q.current < q.target) {
            setTimeout(() => {
              addExperience(q.rewardExp);
              const rewardKey = q.rewardStat as keyof typeof stats;
              setStats((statObj) => ({
                ...statObj,
                [rewardKey]: statObj[rewardKey] + 1
              }));
              setSystemAlertMessage(`[Missão Diária Concluída] +${q.rewardExp} EXP e +1 em ${q.rewardStat.toUpperCase()}`);
              
              // Verify all completed for Treino de Ferro
              checkTreinoFerroAchievement();
            }, 50);
          }
          return { ...q, current: nextVal };
        }
        return q;
      })
    );
  };

  const checkTreinoFerroAchievement = () => {
    setQuests((currentQuests) => {
      const allDone = currentQuests.every((q) => q.current >= q.target);
      if (allDone) {
        setAchievements((ach) =>
          ach.map((a) => (a.id === "ach_2" ? { ...a, done: true } : a))
        );
      }
      return currentQuests;
    });
  };

  const handleResetQuestDay = () => {
    playSystemSound("alert", isMuted);
    setQuests((prev) => prev.map((q) => ({ ...q, current: 0 })));
    setSystemAlertMessage("Missões diárias reiniciadas para novo treinamento neural.");
  };

  // 11. AI Console message submission (calls local framework Gemini mock endpoint)
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");
    playSystemSound("click", isMuted);

    const currentTimeNow = new Date().toLocaleTimeString();
    setSystemLogs((prev) => [...prev, { sender: "hunter", text: userText, time: currentTimeNow }]);
    setIsGeneratingBrief(true);

    try {
      const customPrompt = `Você é o "Sistema" (antiga inteligência mímica mágica de Solo Leveling / Sovereign System). Responda com um briefing ríspido, em tom de máquina de combate cibernética futurista, focado na autossuperação do hunter. 
O hunter ativo se chama "${currentUser || "Sung Jin-Woo"}", nível ${level}, classe Rank ${playerRank}, estatísticas de Força: ${stats.strength}, Velocidade: ${stats.agility}, Inteligência: ${stats.intelligence}.
A mensagem do hunter é: "${userText}". Responda de forma concisa (máximo de 4 frases) em português.`;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt })
      });

      if (!response.ok) {
        throw new Error("Sistema offline");
      }

      const resData = await response.json();
      const botText = resData.text || "Comunicação corrompida. Tente recalibrar o fluxo de mana.";
      
      setSystemLogs((prev) => [
        ...prev,
        { sender: "system", text: botText, time: new Date().toLocaleTimeString() }
      ]);
      playSystemSound("complete", isMuted);
    } catch (err) {
      console.warn("Gemini API fault, initiating machine replica response:", err);
      // Fallback
      setSystemLogs((prev) => [
        ...prev,
        { 
          sender: "system", 
          text: "[REPLICA DE BACKUP AUTOMÁTICO]: Níveis de mana elevados com interferências cósmicas. Concentre-se nos seus objetivos e complete as missões diárias para ganhar poder e ascender.", 
          time: new Date().toLocaleTimeString() 
        }
      ]);
      playSystemSound("alert", isMuted);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  // 12. Full Wipe sovereign status
  const handleSovereignReset = () => {
    setConfirmModal({
      isOpen: true,
      title: "ALERTA DE AUTO-DESTRUIÇÃO",
      description: "CUIDADO: ESTA AÇÃO IRÁ APAGAR TODA A SESSÃO DO CAÇADOR DO BANCO DE DADOS E DO CACHE LOCAL! Esta operação é irreversível. Deseja mesmo prosseguir?",
      confirmText: "DESTRUIR SESSÃO",
      cancelText: "ABORTAR OPERAÇÃO",
      onConfirm: () => {
        playSystemSound("alert", isMuted);
        localStorage.removeItem("shadow_sovereign_save");

        if (currentUser) {
          if (isSupabaseConfigured && supabase) {
            supabase
              .from("hunters")
              .delete()
              .eq("username", currentUser)
              .then(({ error }) => {
                if (error) console.warn("Erro ao limpar dados no Supabase:", error.message);
              });
          }
          
          try {
            const usersStr = localStorage.getItem("shadow_sovereign_users");
            if (usersStr) {
              const users = JSON.parse(usersStr);
              delete users[currentUser];
              localStorage.setItem("shadow_sovereign_users", JSON.stringify(users));
            }
          } catch (e) {
            console.warn("Erro ao sincronizar destruição local:", e);
          }
          setCurrentUser(null);
          localStorage.removeItem("shadow_sovereign_current_user");
        }

        // Reset application memory back to standard template Sung Jin-Woo Rank E Lvl 24
        setUsername("Sung Jin-Woo");
        setPlayerRank("E");
        setLevel(24);
        setExp(1250);
        setNextLevelExp(3000);
        setAvailableStatPoints(5);
        setAvatar("shadow_shadow_monarch");
        setVisualTheme("shadow");
        setAnimationsEnabled(true);
        setIsMuted(false);
        
        setStats({
          strength: 48,
          agility: 45,
          intelligence: 30,
          focus: 28,
          discipline: 35,
          creativity: 26
        });

        setStatsHistory(generateDefaultHistory({
          strength: 48,
          agility: 45,
          intelligence: 30,
          focus: 28,
          discipline: 35,
          creativity: 26
        }));

        setQuests([
          { id: "quest_pushup", label: "Flexões de Braço", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "strength" },
          { id: "quest_situp", label: "Abdominais Diários", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "discipline" },
          { id: "quest_squat", label: "Agachamentos Sombrios", current: 0, target: 100, unit: "reps", rewardExp: 400, rewardStat: "agility" },
          { id: "quest_run", label: "Corrida de Resistência", current: 0.0, target: 10, unit: "km", rewardExp: 800, rewardStat: "focus" }
        ]);

        setMilestones([
          { id: "ms_double_dun", label: "Sobrevivente do Templo Duplo", desc: "Escapar com vida da masmorra oculta Rank D", unlocked: true },
          { id: "ms_rank_c", label: "Superação Neural Rank C", desc: "Atingir nível 40 no portal de treinamento", unlocked: false },
          { id: "ms_monarch", label: "Herdeiro do Monarca das Sombras", desc: "Liberar a classe de Necromancia Sombria", unlocked: false }
        ]);

        setAchievements([
          { id: "ach_1", title: "O Despertar", desc: "Concluir a primeira sessão do Portal Pomodoro", done: false },
          { id: "ach_2", title: "Treino de Ferro", desc: "Completar todas as tarefas de treinamento diário", done: false },
          { id: "ach_3", title: "Supremacia Sombria", desc: "Elevar qualquer estatística de combate acima de 80", done: false }
        ]);

        setSystemAlertMessage("Sessão eliminada com sucesso. Conexão neural retornada para as configurações básicas de Sung Jin-Woo.");
        setActiveTab("dashboard");
        setConfirmModal(null);
      }
    });
  };

  const currColor = (visualTheme && themeColors[visualTheme]) || themeColors.shadow;

  // 13. Screen Layout routing logic
  if (initLoaded && !currentUser) {
    return (
      <div className="relative min-h-screen text-[#e0e1f2] md:pb-32 pb-24 font-body-md overflow-x-hidden flex items-center justify-center p-4">
        {/* Background scanlines overlay */}
        {animationsEnabled && <div className={currColor.scanClass}></div>}
        
        <div className="w-full max-w-sm glass-panel p-8 rounded-2xl relative border border-[#00d1ff]/40 bg-slate-950/95 shadow-[0_0_40px_rgba(0,209,255,0.25)] space-y-6">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00d1ff]/5 to-transparent pointer-events-none rounded-2xl"></div>
          
          <div className="text-center space-y-2">
            <span className="text-[10px] text-[#00d1ff] tracking-[0.25em] font-mono font-bold uppercase animate-pulse">
              [CONEXÃO DO PORTAL SECRETO]
            </span>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white">
              Sovereign Gate
            </h1>
            <p className="text-slate-400 text-xs">
              Sincronize sua assinatura de mana com a de um Caçador cadastrado.
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-slate-900/60 border border-slate-800 rounded text-[10px] font-mono tracking-wider w-fit mx-auto uppercase">
            {isSupabaseConfigured ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-400 font-bold">Rede Neural Online</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-500">Cache Local Offline</span>
              </>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-label-caps uppercase flex items-center gap-1.5">
                <Mail className="font-bold w-3.5 h-3.5 text-[#00d1ff]" />
                E-mail de Caçador (Email)
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Insira seu e-mail registrado"
                required
                className="w-full bg-slate-950/80 border border-slate-900 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00d1ff]/50 text-sm font-semibold tracking-wide"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-label-caps uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00d1ff]" />
                Assinatura de Segurança (Senha)
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Insira sua senha de acesso"
                required
                className="w-full bg-slate-950/80 border border-slate-900 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00d1ff]/50 text-sm font-sans tracking-wide"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#14d1ff] text-slate-950 font-label-caps font-bold tracking-widest text-xs rounded hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(0,209,255,0.3)] uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 fill-slate-950" />
              Sincronizar Assinatura Neural
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active terminal screen layout (Once user has logged-in successfully)
  return (
    <div className="relative min-h-screen text-[#e0e1f2] md:pb-32 pb-24 font-body-md overflow-x-hidden">
      
      {/* Background Cyber scan-line animations */}
      {animationsEnabled && <div className={currColor.scanClass}></div>}

      {/* Persistent global layout alerts */}
      <AnimatePresence>
        {systemAlertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 bg-slate-950/95 border border-[#00d1ff] rounded-xl text-[#00d1ff] font-mono text-xs flex items-center gap-3 shadow-[0_0_25px_rgba(0,209,255,0.3)] max-w-md w-[90vw]"
          >
            <Sparkles className="w-5 h-5 shrink-0 animate-spin" />
            <span className="font-semibold uppercase tracking-wide">{systemAlertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core Layout Dashboard Header */}
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-950 to-slate-900 border border-[#00d1ff]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,209,255,0.15)] relative">
              <Shield className="w-5 h-5 text-[#00d1ff] animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-[#00d1ff] font-bold tracking-[0.2em] bg-[#00d1ff]/10 px-1.5 py-0.5 rounded border border-[#00d1ff]/20">
                  SYSTEM ACTIVE
                </span>
              </div>
              <h1 className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
                Sovereign Gate
              </h1>
            </div>
          </div>

          {/* Player stats brief banner summary widget */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* HP */}
            <div className="text-right">
              <div className="text-[9px] text-rose-400 font-mono font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                <span>HP ACTIVE</span>
                <span>(100%)</span>
              </div>
              <div className="h-1.5 w-24 bg-slate-900 rounded-full mt-1 border border-rose-500/10 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: "100%" }}></div>
              </div>
            </div>

            {/* MP */}
            <div className="text-right">
              <div className="text-[9px] text-blue-400 font-mono font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                <span>MP CAPACITY</span>
                <span>(100%)</span>
              </div>
              <div className="h-1.5 w-24 bg-slate-900 rounded-full mt-1 border border-blue-500/10 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "100%" }}></div>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="text-right">
              <div className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                <span>EXP PROGRESS</span>
                <span>{Math.round((exp / nextLevelExp) * 100)}%</span>
              </div>
              <div className="h-1.5 w-32 bg-slate-900 rounded-full mt-1 border border-emerald-500/10 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500" 
                  style={{ width: `${(exp / nextLevelExp) * 100}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Quick theme state controllers */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                playSystemSound("click", !isMuted);
              }}
              className="p-2 text-slate-400 hover:text-white rounded bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00d1ff]" />}
            </button>
            
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="font-mono text-xs font-bold text-[#00d1ff] uppercase">LVL {level}</span>
              <span className="w-6 h-6 rounded-full bg-slate-950 font-display text-xs font-black text-white flex items-center justify-center border border-[#00d1ff]/40">
                {playerRank}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Dashboard Subheader Details */}
      <div className="bg-slate-950/40 border-b border-slate-900/60 py-4 px-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950 border border-[#00d1ff]/30 flex items-center justify-center text-white text-base">
              👑
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-2">
                {username} 
                <span className="text-[9px] text-[#00d1ff] font-mono tracking-wider font-normal bg-[#00d1ff]/5 px-2 py-0.5 rounded border border-[#00d1ff]/10">
                  MONARCA DAS SOMBRAS
                </span>
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Terminal ID do Portador ativo: <span className="font-mono text-[#00d1ff]">{currentUser}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            
            <button
              onClick={() => {
                setActiveTab("dashboard");
                playSystemSound("click", isMuted);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? currColor.tabActive + " " + currColor.borderClass
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              👑 Dashboard
            </button>

            <button
              onClick={() => {
                setActiveTab("pomodoro");
                playSystemSound("click", isMuted);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                activeTab === "pomodoro"
                  ? currColor.tabActive + " " + currColor.borderClass
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏳ Portal Pomodoro
            </button>

            <button
              onClick={() => {
                setActiveTab("quests");
                playSystemSound("click", isMuted);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                activeTab === "quests"
                  ? currColor.tabActive + " " + currColor.borderClass
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🎯 Missões Diárias
            </button>

            <button
              onClick={() => {
                setActiveTab("milestones");
                playSystemSound("click", isMuted);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                activeTab === "milestones"
                  ? currColor.tabActive + " " + currColor.borderClass
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🏆 Conquistas
            </button>

            <button
              onClick={() => {
                setActiveTab("ai-core");
                playSystemSound("click", isMuted);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                activeTab === "ai-core"
                  ? currColor.tabActive + " " + currColor.borderClass
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              💬 Chat Sistema
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                playSystemSound("click", isMuted);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                activeTab === "settings"
                  ? currColor.tabActive + " " + currColor.borderClass
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚙️ Ajustes
            </button>

          </div>
        </div>
      </div>

      {/* Primary tab views routing logic */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            
            {/* 1. DASHBOARD VIEW TAB */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visualizer card (Player parameters and stat reallocation dials) */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <span className="font-display font-black text-sm uppercase tracking-wider text-slate-100">
                        PONTOS DISPONÍVEIS
                      </span>
                      <span className="px-2.5 py-1 bg-[#00d1ff]/10 text-[#00d1ff] font-mono text-xs font-extrabold rounded-md animate-pulse">
                        {availableStatPoints} PTS
                      </span>
                    </div>

                    <div className="space-y-4 mt-6">
                      
                      {/* FORÇA */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase font-mono font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#ef4444] rounded-full"></span>
                            FORÇA (STR)
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Dano físico e impacto corporal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDowngradeStat("strength")}
                            className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            disabled={stats.strength <= 10}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold w-8 text-center text-white">{stats.strength}</span>
                          <button
                            onClick={() => handleUpgradeStat("strength")}
                            className="w-7 h-7 flex items-center justify-center bg-[#00d1ff] hover:brightness-110 text-slate-950 rounded cursor-pointer disabled:opacity-30"
                            disabled={availableStatPoints <= 0}
                          >
                            <Plus className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>

                      {/* AGILIDADE */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase font-mono font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#40ff00] rounded-full"></span>
                            AGILIDADE (AGI)
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Velocidade de esquiva e reflexo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDowngradeStat("agility")}
                            className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            disabled={stats.agility <= 10}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold w-8 text-center text-white">{stats.agility}</span>
                          <button
                            onClick={() => handleUpgradeStat("agility")}
                            className="w-7 h-7 flex items-center justify-center bg-[#00d1ff] hover:brightness-110 text-slate-950 rounded cursor-pointer disabled:opacity-30"
                            disabled={availableStatPoints <= 0}
                          >
                            <Plus className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>

                      {/* INTELIGÊNCIA */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase font-mono font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#008dff] rounded-full"></span>
                            INTELIGÊNCIA (INT)
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Capacidade e reservas de mana</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDowngradeStat("intelligence")}
                            className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            disabled={stats.intelligence <= 10}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold w-8 text-center text-white">{stats.intelligence}</span>
                          <button
                            onClick={() => handleUpgradeStat("intelligence")}
                            className="w-7 h-7 flex items-center justify-center bg-[#00d1ff] hover:brightness-110 text-slate-950 rounded cursor-pointer disabled:opacity-30"
                            disabled={availableStatPoints <= 0}
                          >
                            <Plus className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>

                      {/* DISCIPLINA */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase font-mono font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#e1ff00] rounded-full"></span>
                            DISCIPLINA (DISC)
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Consistência de metas e hábitos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDowngradeStat("discipline")}
                            className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            disabled={stats.discipline <= 10}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold w-8 text-center text-white">{stats.discipline}</span>
                          <button
                            onClick={() => handleUpgradeStat("discipline")}
                            className="w-7 h-7 flex items-center justify-center bg-[#00d1ff] hover:brightness-110 text-slate-950 rounded cursor-pointer disabled:opacity-30"
                            disabled={availableStatPoints <= 0}
                          >
                            <Plus className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>

                      {/* FOCO */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase font-mono font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></span>
                            FOCO (FOC)
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Tempo mantido em portal ativo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDowngradeStat("focus")}
                            className="w-7 h-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            disabled={stats.focus <= 10}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold w-8 text-center text-white">{stats.focus}</span>
                          <button
                            onClick={() => handleUpgradeStat("focus")}
                            className="w-7 h-7 flex items-center justify-center bg-[#00d1ff] hover:brightness-110 text-slate-950 rounded cursor-pointer disabled:opacity-30"
                            disabled={availableStatPoints <= 0}
                          >
                            <Plus className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3 mt-6 text-[10px] font-mono leading-relaxed text-[#00d1ff]">
                    🔥 DICA RELEVANTE: Conclua as missões diárias de flexões, agachamentos e corrida ou use o cronômetro Pomodoro de concentração para ganhar grandes bônus semanais de EXP e Estatísticas.
                  </div>
                </div>

                {/* Training summary graphs / radar grid parameters representation */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Stats Overview */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-900/60">
                    <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#00d1ff]" />
                      Análise de Progressão do Caçador
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      
                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Mana Total</span>
                        <span className="text-xl font-bold font-mono text-white block mt-1">{stats.intelligence * 22} MP</span>
                        <span className="text-[9px] text-[#00d1ff] font-mono block mt-1">+1.4x de acréscimo</span>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Multiplicador Físico</span>
                        <span className="text-xl font-bold font-mono text-white block mt-1">x{(stats.strength * 0.15).toFixed(2)}</span>
                        <span className="text-[9px] text-rose-400 font-mono block mt-1">+0.05 por ponto STR</span>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Taxa de Esquiva</span>
                        <span className="text-xl font-bold font-mono text-white block mt-1">{(stats.agility * 0.4 + 10).toFixed(1)}%</span>
                        <span className="text-[9px] text-emerald-400 font-mono block mt-1">+0.4% por ponto AGI</span>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Foco no Portal</span>
                        <span className="text-xl font-bold font-mono text-white block mt-1">{(stats.focus * 1.5).toFixed(0)} min</span>
                        <span className="text-[9px] text-purple-400 font-mono block mt-1">Eficiência de treino ativa</span>
                      </div>

                    </div>

                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 uppercase">Capacidade Biológica Global (Limitação)</span>
                        <span className="text-[#00d1ff] font-bold">Patamar {level * 5} / {level * 10}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.5)]" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Quick training checklist overlay */}
                  <div className="glass-panel p-6 rounded-2xl border border-[#00d1ff]/15">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-[#00d1ff]" />
                        Metas Diárias Rápidas (Ações Rápidas)
                      </h4>
                      <button
                        onClick={handleResetQuestDay}
                        className="text-[10px] text-slate-500 hover:text-white font-mono uppercase cursor-pointer"
                      >
                        Reiniciar Hoje
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {quests.map((q) => (
                        <div key={q.id} className="bg-slate-950/30 border border-slate-900 rounded-lg p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-300">{q.label}</span>
                            <span className="font-mono text-[#00d1ff]">
                              {q.current} / {q.target} {q.unit}
                            </span>
                          </div>
                          
                          <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              className="h-full bg-[#00d1ff]" 
                              style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] text-slate-500 font-mono uppercase">Recompensa: +1 STR / +{q.rewardExp} EXP</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdateQuestProgress(q.id, q.id === "quest_run" ? 1.0 : 10)}
                                className="px-2 py-0.5 bg-[#00d1ff]/10 hover:bg-[#00d1ff]/20 text-[#00d1ff] font-mono text-[9px] border border-[#00d1ff]/20 rounded transition-all cursor-pointer"
                                disabled={q.current >= q.target}
                              >
                                {q.id === "quest_run" ? "+1 Kilometer" : "+10 Repeats"}
                              </button>
                              <button
                                onClick={() => handleUpdateQuestProgress(q.id, q.id === "quest_run" ? 5.0 : 50)}
                                className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-mono text-[9px] border border-purple-500/20 rounded transition-all cursor-pointer"
                                disabled={q.current >= q.target}
                              >
                                {q.id === "quest_run" ? "+5 Kilometers" : "+50 Repeats"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 2. PORTAL POMODORO FOCUS TAB */}
            {activeTab === "pomodoro" && (
              <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl border border-[#00d1ff]/30 bg-slate-950/80 text-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#00d1ff]/5 to-transparent pointer-events-none"></div>
                
                <span className="text-[10px] text-[#00d1ff] tracking-[0.3em] font-mono font-bold uppercase block animate-pulse">
                  {pomoMode === "focus" ? "[SESSÃO DE CONCENTRAÇÃO SOMBRIA]" : "[INTERVALO DE COORDENAÇÃO]"}
                </span>

                {/* Animated timer circle display */}
                <div className="relative w-56 h-56 mx-auto my-8 flex items-center justify-center rounded-full border-2 border-slate-950 bg-slate-950 shadow-[0_0_35px_rgba(0,209,255,0.15)]">
                  {pomoActive && (
                    <div className="absolute inset-0 rounded-full border border-[#00d1ff]/25 animate-ping opacity-60"></div>
                  )}
                  
                  <div className="z-10 space-y-1">
                    <div className="text-4xl font-mono font-black text-white tracking-widest">
                      {Math.floor(pomoTime / 60).toString().padStart(2, "0")}:
                      {(pomoTime % 60).toString().padStart(2, "0")}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-[#00d1ff]" />
                      Tempo Restante
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPomoActive(!pomoActive);
                        playSystemSound("click", isMuted);
                      }}
                      className={`w-full py-3 rounded font-mono text-xs uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        pomoActive 
                          ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                          : "bg-[#00d1ff] text-slate-950 hover:bg-[#1fd6ff] shadow-[0_0_20px_rgba(0,209,255,0.35)]"
                      }`}
                    >
                      {pomoActive ? (
                        <>
                          <Pause className="w-4 h-4 fill-slate-950" /> Pausar Portal
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-slate-950" /> Abrir Portal
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setPomoActive(false);
                        setPomoTime(pomoMode === "focus" ? 1500 : 300);
                        playSystemSound("click", isMuted);
                      }}
                      className="px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-3 border-t border-slate-900 pt-5">
                    <button
                      onClick={() => {
                        setPomoActive(false);
                        setPomoMode("focus");
                        setPomoTime(1500); // 25m
                        playSystemSound("click", isMuted);
                      }}
                      className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider ${
                        pomoMode === "focus" 
                          ? "bg-[#00d1ff]/10 text-[#00d1ff] border border-[#00d1ff]/30" 
                          : "text-slate-400 border border-transparent hover:text-slate-300"
                      }`}
                    >
                      Foco (25 Minutos)
                    </button>
                    
                    <button
                      onClick={() => {
                        setPomoActive(false);
                        setPomoMode("break");
                        setPomoTime(300); // 5m
                        playSystemSound("click", isMuted);
                      }}
                      className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider ${
                        pomoMode === "break" 
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" 
                          : "text-slate-400 border border-transparent hover:text-slate-300"
                      }`}
                    >
                      Desanso Rápido
                    </button>
                  </div>

                </div>

                <p className="text-[10px] text-slate-500 font-mono mt-6 leading-relaxed uppercase">
                  O SISTEMA RECOMPENSA SUA DEDICAÇÃO EXTREMA COM GRANDES MASSAS DE EXP <br />
                  Foco Completo: +450 EXP • Intervalo Concluído: Sem penalidades
                </p>
              </div>
            )}

            {/* 3. QUESTS DETAIL VIEW TAB */}
            {activeTab === "quests" && (
              <div className="space-y-6">
                
                <div className="glass-panel p-6 rounded-2xl border border-slate-900/60 max-w-4xl mx-auto space-y-6">
                  
                  <div className="border-b border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-white">
                        Treinamento Autoral do Monarca
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Estes são as obrigações diárias de fortalecimento. A não conclusão resulta em masmorras de punição automática.
                      </p>
                    </div>
                    <button
                      onClick={handleResetQuestDay}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono uppercase font-bold rounded border border-slate-800 transition-all cursor-pointer"
                    >
                      Zerar Todas as Missões
                    </button>
                  </div>

                  <div className="space-y-4">
                    {quests.map((q) => {
                      const completed = q.current >= q.target;
                      return (
                        <div 
                          key={q.id} 
                          className={`border rounded-xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                            completed 
                              ? "bg-emerald-950/15 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                              : "bg-slate-950/20 border-slate-900"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-100">{q.label}</h4>
                              {completed && (
                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  CONCLUÍDA
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 text-xs">
                              Série de exercício rítmica para ampliação do atributo de <span className="text-[#00d1ff] font-mono font-semibold uppercase">{q.rewardStat}</span>.
                            </p>
                          </div>

                          <div className="flex items-center gap-6">
                            
                            <div className="w-full md:w-36 text-right space-y-1.5">
                              <div className="text-xs font-semibold font-mono text-slate-300">
                                {q.current} / {q.target} {q.unit}
                              </div>
                              <div className="h-2 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${completed ? "bg-emerald-500" : "bg-[#00d1ff]"}`}
                                  style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleUpdateQuestProgress(q.id, q.id === "quest_run" ? 1.0 : 10)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-xs font-mono uppercase text-slate-300 disabled:opacity-45 cursor-pointer"
                                disabled={completed}
                              >
                                {q.id === "quest_run" ? "+1 Km" : "+10"}
                              </button>
                              <button
                                onClick={() => handleUpdateQuestProgress(q.id, q.id === "quest_run" ? 5.0 : 50)}
                                className="px-3 py-1.5 bg-[#00d1ff]/10 hover:bg-[#00d1ff]/20 text-[#00d1ff] font-mono text-xs uppercase rounded border border-[#00d1ff]/20 disabled:opacity-45 cursor-pointer"
                                disabled={completed}
                              >
                                {q.id === "quest_run" ? "+5 Km" : "+50"}
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            )}

            {/* 4. MILESTONES / HISTORIC ACHIEVEMENTS TAB */}
            {activeTab === "milestones" && (
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Visual Rank levels milestones */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-900/60 space-y-4">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#00d1ff]" />
                    Evoluções de Rank no Sistema
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="bg-slate-950/40 border border-[#ef4444]/20 rounded-xl p-5 text-center relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-[8px] bg-red-500/10 border border-red-500/20 text-red-500 rounded px-1.5 font-mono">
                        LEVEL 70+
                      </div>
                      <span className="text-3xl block mt-2">🛡️</span>
                      <h4 className="font-display font-black text-white text-sm uppercase mt-2">Rank S - Soberano</h4>
                      <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                        Chave suprema de autoridade neural. Nenhuma restrição cibernética.
                      </p>
                    </div>

                    <div className="bg-slate-950/40 border border-[#00d1ff]/20 rounded-xl p-5 text-center relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-[8px] bg-[#00d1ff]/10 border border-[#00d1ff]/20 text-[#00d1ff] rounded px-1.5 font-mono">
                        LEVEL 40+
                      </div>
                      <span className="text-3xl block mt-2">⚔️</span>
                      <h4 className="font-display font-black text-white text-sm uppercase mt-2">Rank B - Veterano</h4>
                      <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                        Assinatura de combate tático avançada. Acesso liberado ao portal Gemini de comandos.
                      </p>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 text-center relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-[8px] bg-slate-800 border border-slate-700 text-slate-500 rounded px-1.5 font-mono">
                        LEVEL 1+
                      </div>
                      <span className="text-3xl block mt-2">💪</span>
                      <h4 className="font-display font-black text-white text-sm uppercase mt-2">Rank E - Iniciante</h4>
                      <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                        Pontapé inicial básico de Sung Jin-Woo antes do despertar mecânico.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Achievement system */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-900/60 space-y-4">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-200">
                    Sincronização de Conquistas
                  </h3>

                  <div className="space-y-3">
                    {achievements.map((ach) => (
                      <div 
                        key={ach.id} 
                        className={`p-4 rounded-lg flex items-center justify-between border ${
                          ach.done 
                            ? "bg-purple-950/15 border-purple-500/20 text-[#00d1ff]" 
                            : "bg-slate-950/20 border-slate-900 text-slate-400"
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase">{ach.title}</h4>
                          <p className="text-slate-500 text-xs mt-1">{ach.desc}</p>
                        </div>
                        <span className="font-mono text-xs">
                          {ach.done ? "✨ DESBLOQUEADA" : "🔒 CONTRAPARTIDA BLOQUEADA"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 5. AI NEURAL SYSTEM CONSOLE TAB */}
            {activeTab === "ai-core" && (
              <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl border border-[#00d1ff]/20 flex flex-col h-[550px] justify-between relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-10 bg-slate-950/70 border-b border-slate-900 flex items-center justify-between px-4">
                  <span className="font-mono text-[10px] text-[#00d1ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Core Neural do Sistema Sombrio
                  </span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                </div>

                {/* Console output log stream */}
                <div className="flex-1 overflow-y-auto mt-6 mb-4 space-y-4 p-2 font-mono scrollbar-none text-xs">
                  {systemLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-lg border leading-relaxed ${
                        log.sender === "system" 
                          ? "bg-slate-950/60 border-[#00d1ff]/10 text-emerald-400" 
                          : "bg-[#00d1ff]/5 border-[#00d1ff]/15 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5 mb-1.5 text-[10px] text-slate-500">
                        <span className="uppercase font-bold">
                          {log.sender === "system" ? "🤖 SYSTEM AI CORE" : `👤 HUNTER: ${currentUser}`}
                        </span>
                        <span>{log.time}</span>
                      </div>
                      <p>{log.text}</p>
                    </div>
                  ))}

                  {isGeneratingBrief && (
                    <div className="p-3 bg-slate-950/60 border border-[#00d1ff]/10 text-teal-400 rounded-lg animate-pulse">
                      ⏳ SISTEMA: Sincronizando mana neural e compilando resposta do Monarca...
                    </div>
                  )}
                </div>

                {/* Console message input line */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Envie uma diretriz para o Sistema do Monarca (ex: 'Me dê conselhos de treino')"
                    disabled={isGeneratingBrief}
                    className="w-full bg-slate-950 border border-slate-900 rounded p-3 text-white focus:outline-none focus:border-[#00d1ff]/50 font-mono text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingBrief}
                    className="px-6 py-3 bg-[#00d1ff] hover:brightness-110 disabled:opacity-45 text-slate-950 font-label-caps font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
                  >
                    Transmitir
                  </button>
                </form>

              </div>
            )}

            {/* 6. SETTINGS VIEW TAB */}
            {activeTab === "settings" && (
              <div className="max-w-3xl mx-auto space-y-6">
                
                <section className="glass-panel p-6 rounded-2xl border border-slate-900/60 space-y-6">
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white border-b border-slate-900 pb-3">
                    Preferências do Painel Secret
                  </h3>

                  <div className="space-y-5">
                    
                    {/* Theme color option */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">Aparência Visual & Cor de Mana</h4>
                        <p className="text-slate-500 text-xs mt-1">Sintonizar a cor de emissão de mana que decora o sistema.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setVisualTheme("shadow");
                            playSystemSound("click", isMuted);
                          }}
                          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                            visualTheme === "shadow" ? "border-[#00d1ff] bg-[#00d1ff]/10 text-[#00d1ff]" : "border-slate-800 text-slate-400"
                          }`}
                        >
                          Sombra Violeta
                        </button>
                        
                        <button
                          onClick={() => {
                            setVisualTheme("crimson");
                            playSystemSound("click", isMuted);
                          }}
                          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                            visualTheme === "crimson" ? "border-red-500 bg-red-500/10 text-red-500" : "border-slate-800 text-slate-400"
                          }`}
                        >
                          Sangue Carmesim
                        </button>

                        <button
                          onClick={() => {
                            setVisualTheme("amber");
                            playSystemSound("click", isMuted);
                          }}
                          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                            visualTheme === "amber" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-slate-800 text-slate-400"
                          }`}
                        >
                          Escudo Âmbar
                        </button>
                      </div>
                    </div>

                    {/* Enable system scanlines overlay interface */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-900 pt-5">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">Animações de Interface</h4>
                        <p className="text-slate-500 text-xs mt-1">Efeitos visuais dinâmicos e varredura de scanline holográfica.</p>
                      </div>
                      <button
                        onClick={() => {
                          setAnimationsEnabled(!animationsEnabled);
                          playSystemSound("click", isMuted);
                        }}
                        className={`px-4 py-2 font-mono text-xs font-bold uppercase rounded border transition-all cursor-pointer ${
                          animationsEnabled ? "bg-[#00d1ff]/10 text-[#00d1ff] border-[#00d1ff]/30" : "border-slate-800 text-slate-400"
                        }`}
                      >
                        {animationsEnabled ? "Filtros Ativados" : "Filtros Desativados"}
                      </button>
                    </div>

                  </div>
                </section>

                <section className="glass-panel p-6 rounded-2xl border border-slate-900/60 space-y-4">
                  <h3 className="font-display font-extrabold text-sm uppercase text-[#00d1ff] tracking-wider border-b border-slate-900 pb-3 flex items-center justify-between">
                    <span>Identificador do Portador Sincronizado</span>
                    <span className="text-[9px] text-emerald-400 font-mono tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      CONECTADO
                    </span>
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#00d1ff]" />
                        Hunter Logado: <span className="text-[#00d1ff] font-mono font-black">{currentUser}</span>
                      </h4>
                      <p className="text-slate-500 text-xs mt-1">
                        Seu perfil neural está sincronizado com segurança ao banco de dados Supabase e cache local.
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-red-400 font-mono text-xs font-bold uppercase rounded transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ZapOff className="w-4 h-4 text-red-500" /> Desconectar Perfil
                    </button>
                  </div>
                </section>

                {/* Reset terminal option */}
                <section className="glass-panel p-6 rounded-2xl border border-red-500/20 space-y-4 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-red-400 uppercase">Reinicialização Total do Terminology</h4>
                      <p className="text-slate-500 text-xs mt-1">Este procedimento zera todas as métricas locais e remotas da sua conta.</p>
                    </div>
                    <button
                      onClick={handleSovereignReset}
                      className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 hover:border-red-500/60 font-mono text-xs font-extrabold uppercase rounded transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mx-auto sm:mx-0"
                    >
                      <Trash2 className="w-4 h-4" /> AUTO-DESTRUIR SESSÃO
                    </button>
                  </div>
                </section>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                <h3 className="font-display font-black text-white text-sm uppercase tracking-wider">
                  {confirmModal.title}
                </h3>
              </div>
              <p className="text-slate-400 text-xs font-sans leading-relaxed">
                {confirmModal.description}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="w-1/2 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                  }}
                  className="w-1/2 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 hover:border-red-500/60 rounded-lg text-xs font-mono font-bold uppercase shadow-[0_0_15px_rgba(239,68,68,0.1)] cursor-pointer transition-all"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
