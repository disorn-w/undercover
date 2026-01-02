import { create } from "zustand";
import wordsData from "../data/words.json";
import type { GamePhase, GameSettings, Player, Role, WordPair } from "../types";
import { VALID_AVATARS } from "./useUserStore";

interface GameState {
    // State
    phase: GamePhase;
    players: Player[];
    settings: GameSettings;
    currentWordPair: WordPair | null;
    currentPlayerIndex: number; // สำหรับช่วง Reveal
    winner: Role | null; // ทีมที่ชนะ
    mrWhiteGuessing: boolean; // สถานะ Mr. White กำลังทายคำ
    startingPlayerId: string | null;
    turnDirection: "CLOCKWISE" | "COUNTER_CLOCKWISE" | null;
    lastEliminatedPlayerId: string | null;

    // Actions
    enterSetup: () => void;
    goHome: () => void;
    addPlayer: (name: string) => void;
    removePlayer: (id: string) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    startGame: () => void;
    nextReveal: () => void; // ไปยังผู้เล่นคนถัดไปในช่วง Reveal
    startDiscussion: () => void;
    startNextRound: () => void; // เริ่มรอบถัดไป (จาก Round Summary -> Discuss)
    eliminatePlayer: (playerId: string) => void;
    makeMrWhiteGuess: (isCorrect: boolean) => void;
    checkWinCondition: (currentPlayers: Player[]) => void;
    resetGame: () => void;
}

// ฟังก์ชันสุ่ม Emoji ที่ไม่ซ้ำ
const getRandomAvatar = (existingPlayers: Player[]): string => {
    const used = new Set(existingPlayers.map((p) => p.avatar));
    const available = VALID_AVATARS.filter((a) => !used.has(a));
    if (available.length === 0) return VALID_AVATARS[0]; // Fallback
    return available[Math.floor(Math.random() * available.length)];
};

export const useGameStore = create<GameState>((set, get) => ({
    phase: "HOME",
    players: [],
    settings: {
        undercoverCount: 1,
        includeMrWhite: false,
        selectedCategoryId: "ALL",
    },
    currentWordPair: null,
    currentPlayerIndex: 0,
    winner: null,

    mrWhiteGuessing: false,
    startingPlayerId: null,
    turnDirection: null,
    lastEliminatedPlayerId: null,

    enterSetup: () => set({ phase: "SETUP" }),
    goHome: () => set({ phase: "HOME" }),

    // เพิ่มผู้เล่นใหม่ พร้อมสุ่ม Avatar
    addPlayer: (name) => {
        const players = get().players;
        if (players.length >= 20) return; // Limit
        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name: name || `Player ${players.length + 1}`,
            avatar: getRandomAvatar(players),
            role: null,
            word: null,
            isAlive: true,
            votes: 0,
        };
        set({ players: [...players, newPlayer] });
    },

    // ลบผู้เล่น (เฉพาะช่วง Setup)
    removePlayer: (id) => {
        set((state) => ({ players: state.players.filter((p) => p.id !== id) }));
    },

    // ปรับการตั้งค่าเกม
    updateSettings: (newSettings) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }));
    },

    // เริ่มเกม: สุ่มคำ, สุ่มบทบาท
    startGame: () => {
        const { players, settings } = get();
        if (players.length < 3) return; // ต้องมีอย่างน้อย 3 คน

        // 1. สุ่มคำศัพท์
        const allCategories = wordsData.categories;
        let targetCategories = allCategories;

        if (settings.selectedCategoryId !== "ALL") {
            const found = allCategories.find((c) => c.name === settings.selectedCategoryId);
            if (found) {
                targetCategories = [found];
            }
        }

        const randomCat = targetCategories[Math.floor(Math.random() * targetCategories.length)];
        const randomPair = randomCat.pairs[Math.floor(Math.random() * randomCat.pairs.length)];
        // randomPair[0] = Civilian, [1] = Undercover (หรือสลับกันได้ แต่ในที่นี้กำหนดตามลำดับ)

        // 2. คำนวณจำนวนบทบาท
        const total = players.length;
        let ucCount = settings.undercoverCount;
        let mrWhiteCount = settings.includeMrWhite ? 1 : 0;

        // Sanity Check
        if (ucCount + mrWhiteCount >= total) {
            ucCount = 1; // Reset if invalid
            mrWhiteCount = 0;
        }
        const civCount = total - ucCount - mrWhiteCount;

        // 3. สร้าง Array บทบาท
        const roles: Role[] = [
            ...Array(civCount).fill("CIVILIAN"),
            ...Array(ucCount).fill("UNDERCOVER"),
            ...Array(mrWhiteCount).fill("MR_WHITE"),
        ];

        // Shuffle Roles
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        // 4. Assign ให้ผู้เล่น
        const newPlayers = players.map((p, idx) => {
            const role = roles[idx];
            let word = "";
            if (role === "CIVILIAN") word = randomPair[0];
            else if (role === "UNDERCOVER") word = randomPair[1];
            else word = "^^"; // Mr. White ไม่รู้คำ

            return {
                ...p,
                role,
                word,
                isAlive: true,
                votes: 0,
            };
        });

        // 5. Randomize Turn Order (แยกออกมาเพื่อความชัดเจน)
        const startingPlayer = newPlayers[Math.floor(Math.random() * newPlayers.length)];
        const direction = Math.random() > 0.5 ? "CLOCKWISE" : "COUNTER_CLOCKWISE";

        set({
            players: newPlayers,
            currentWordPair: randomPair,
            phase: "REVEAL",
            currentPlayerIndex: 0,
            winner: null,
            mrWhiteGuessing: false,
            startingPlayerId: startingPlayer.id,
            turnDirection: direction,
        });
    },

    // เปลี่ยนคนดูคำช่วง Reveal
    nextReveal: () => {
        const { currentPlayerIndex, players } = get();
        if (currentPlayerIndex + 1 < players.length) {
            set({ currentPlayerIndex: currentPlayerIndex + 1 });
        } else {
            // ครบทุกคนแล้ว ไปช่วง Discuss
            set({ phase: "DISCUSS" });
        }
    },

    // เริ่มช่วง Discus (อาจใช้จับเวลาภายนอก)
    startDiscussion: () => {
        set({ phase: "VOTE" });
    },

    // โหวตไล่ออก Check Win Condition
    eliminatePlayer: (playerId) => {
        const { players } = get();
        const eliminatedPlayer = players.find((p) => p.id === playerId);
        if (!eliminatedPlayer) return;

        // Mr. White Check
        if (eliminatedPlayer.role === "MR_WHITE") {
            set({ mrWhiteGuessing: true, phase: "RESULT" }); // พัก Win Check ไว้ก่อน ให้ทาย
            // หมายเหตุ: Logic จริง อาจจะให้ pop-up ทายก่อน แล้วค่อยตัดสิน
            // แต่ flow นี้ให้เข้าไปหน้า Result หรือ Modal ทาย
            return;
        }

        // อัปเดตสถานะตาย
        const updatedPlayers = players.map((p) => (p.id === playerId ? { ...p, isAlive: false } : p));

        set({ players: updatedPlayers, lastEliminatedPlayerId: playerId });

        // ตรวจสอบผลแพ้ชนะทันที
        get().checkWinCondition(updatedPlayers);
    },

    checkWinCondition: (currentPlayers: Player[]) => {
        const civAlive = currentPlayers.filter((p) => p.role === "CIVILIAN" && p.isAlive).length;
        const ucAlive = currentPlayers.filter((p) => p.role === "UNDERCOVER" && p.isAlive).length;
        const mrWhiteAlive = currentPlayers.filter((p) => p.role === "MR_WHITE" && p.isAlive).length;
        const badGuysAlive = ucAlive + mrWhiteAlive;

        // 1. Bad Guys Win: ถ้าจำนวนคนร้าย >= คนดี
        if (badGuysAlive >= civAlive) {
            set({ phase: "RESULT", winner: "UNDERCOVER" });
            return;
        }

        // 2. Civilian Win: ถ้าคนร้ายตายหมด
        if (badGuysAlive === 0) {
            set({ phase: "RESULT", winner: "CIVILIAN" });
            return;
        }

        // 3. เกมดำเนินต่อ -> ไปหน้า Round Summary เพื่อเฉลยคนตาย
        // จำไว้ว่า eliminatedPlayer ถูก set isAlive=false ไปแล้วใน eliminatePlayer
        // เราแค่ต้องเก็บ ID เพื่อไปโชว์
        // หมายเหตุ: eliminatePlayer เป็นคนเรียก checkWinCondition โดยส่ง updatedPlayers มา
        // แต่ lastEliminatedPlayerId ต้องถูก set ใน eliminatePlayer ก่อนเรียก checkWinCondition?
        // หรือ set ที่นี่? -> ทำใน eliminatePlayer ง่ายกว่า

        set({ phase: "ROUND_SUMMARY" });
    },

    startNextRound: () => {
        set({ phase: "DISCUSS" });
    },

    // Mr. White ทายคำ
    makeMrWhiteGuess: (isCorrect) => {
        if (isCorrect) {
            set({ phase: "RESULT", winner: "MR_WHITE" });
        } else {
            // ทายผิด -> ตายสนิท -> เช็คเงื่อนไขชนะใหม่
            const { players } = get();
            // (ผู้เล่น Mr White ตายไปแล้วจากการ eliminate ก่อนหน้านี้ หรือกำลังจะตาย)
            // ใน logic eliminatePlayer เรายังไม่ได้ set isAlive=false ถ้าเป็น Mr White เพื่อรอทาย?
            // ต้องแก้ logic eliminatePlayer เล็กน้อย
            // แก้: ให้ set isAlive=false ไปเลยก็ได้ แต่ flag mrWhiteGuessing ไว้
            // แล้วถ้าทายถูก -> overwrite winner.
            // ถ้าทายผิด -> checkWinCondition ปกติ (ซึ่ง Mr White ตายแล้ว = badGuys ลดลง)

            const updatedPlayers = players.map((p) => (p.role === "MR_WHITE" ? { ...p, isAlive: false } : p));
            set({ players: updatedPlayers, mrWhiteGuessing: false });
            get().checkWinCondition(updatedPlayers);
        }
    },

    resetGame: () => {
        set({
            phase: "SETUP",
            currentWordPair: null,
            currentPlayerIndex: 0,
            winner: null,
            mrWhiteGuessing: false,
            startingPlayerId: null,
            turnDirection: null,
            lastEliminatedPlayerId: null,
            // players เก็บไว้ (Reset role/status)
            players: get().players.map((p) => ({
                ...p,
                role: null,
                word: null,
                isAlive: true,
                votes: 0,
            })),
        });
    },
}));
