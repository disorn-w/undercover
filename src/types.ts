export type Role = "CIVILIAN" | "UNDERCOVER" | "MR_WHITE";

export type GamePhase = "HOME" | "SETUP" | "REVEAL" | "DISCUSS" | "VOTE" | "ROUND_SUMMARY" | "RESULT";

export interface Player {
    id: string;
    name: string;
    avatar: string; // Emoji char
    role: Role | null;
    word: string | null;
    isAlive: boolean;
    votes: number; // Number of votes received in current round
}

export interface GameSettings {
    undercoverCount: number;
    includeMrWhite: boolean;
    selectedCategoryId: string; // "ALL" or specific Category Name
}

// [CivilianWord, UndercoverWord]
export type WordPair = string[];

export interface WordCategory {
    name: string;
    pairs: WordPair[];
}

export interface WordsData {
    categories: WordCategory[];
}
