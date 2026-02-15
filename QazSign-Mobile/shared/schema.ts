import { z } from "zod";

export const GestureCategory = z.enum([
  "all",
  "alphabet",
  "greetings",
  "numbers",
  "common_phrases",
  "family",
  "questions",
]);

export type GestureCategory = z.infer<typeof GestureCategory>;

export const GestureSchema = z.object({
  id: z.string(),
  word: z.string(),
  wordRu: z.string().optional(),
  description: z.string().optional(),
  descriptionRu: z.string().optional(),
  category: GestureCategory,
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
});

export type Gesture = z.infer<typeof GestureSchema>;

export const UserPreferencesSchema = z.object({
  displayName: z.string().default("User"),
  language: z.enum(["kazakh", "russian"]).default("kazakh"),
  highContrastMode: z.boolean().default(false),
  ttsEnabled: z.boolean().default(true),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const SavedGestureSchema = z.object({
  gestureId: z.string(),
  savedAt: z.string(),
});

export type SavedGesture = z.infer<typeof SavedGestureSchema>;

export const LearningProgressSchema = z.object({
  gesturesLearned: z.array(z.string()).default([]),
  quizzesTaken: z.number().default(0),
  correctAnswers: z.number().default(0),
  totalAnswers: z.number().default(0),
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  lastActivityDate: z.string().optional(),
});

export type LearningProgress = z.infer<typeof LearningProgressSchema>;

export const RecognitionHistoryItemSchema = z.object({
  id: z.string(),
  word: z.string(),
  confidence: z.number(),
  timestamp: z.string(),
});

export type RecognitionHistoryItem = z.infer<typeof RecognitionHistoryItemSchema>;

export const GESTURE_CATEGORIES: { id: GestureCategory; label: string; labelRu: string }[] = [
  { id: "all", label: "Барлығы", labelRu: "Все" },
  { id: "alphabet", label: "Әліпби", labelRu: "Алфавит" },
  { id: "greetings", label: "Сәлемдесу", labelRu: "Приветствия" },
  { id: "numbers", label: "Сандар", labelRu: "Числа" },
  { id: "common_phrases", label: "Жиі қолданылатын", labelRu: "Частые фразы" },
  { id: "family", label: "Отбасы", labelRu: "Семья" },
  { id: "questions", label: "Сұрақтар", labelRu: "Вопросы" },
];

export const SAMPLE_GESTURES: Gesture[] = [
  { 
    id: "1", 
    word: "сәлеметсіз бе", 
    wordRu: "Здравствуйте",
    description: "Ресми сәлемдесу белгісі", 
    descriptionRu: "Официальное приветствие",
    category: "greetings",
    difficulty: "easy",
    videoUrl: "https://example.com/videos/salemetsiz-be.mp4"
  },
  { 
    id: "2", 
    word: "сау болыңыз", 
    wordRu: "До свидания",
    description: "Қоштасу белгісі", 
    descriptionRu: "Прощание",
    category: "greetings",
    difficulty: "easy",
    videoUrl: "https://example.com/videos/sau-bolynyz.mp4"
  },
  { 
    id: "3", 
    word: "аты", 
    wordRu: "Имя",
    description: "Атыңызды айту", 
    descriptionRu: "Назвать своё имя",
    category: "family",
    difficulty: "easy",
    videoUrl: "https://example.com/videos/aty.mp4"
  },
  { 
    id: "4", 
    word: "тегі", 
    wordRu: "Фамилия",
    description: "Тегіңізді айту", 
    descriptionRu: "Назвать фамилию",
    category: "family",
    difficulty: "easy",
    videoUrl: "https://example.com/videos/tegi.mp4"
  },
  { 
    id: "5", 
    word: "әкесінің аты", 
    wordRu: "Отчество",
    description: "Әкесінің атын айту", 
    descriptionRu: "Назвать отчество",
    category: "family",
    difficulty: "medium",
    videoUrl: "https://example.com/videos/akesinin-aty.mp4"
  },
  { 
    id: "6", 
    word: "бір", 
    wordRu: "Один",
    description: "Бір саны", 
    descriptionRu: "Число один",
    category: "numbers",
    difficulty: "easy",
    videoUrl: "https://example.com/videos/bir.mp4"
  },
  { 
    id: "7", 
    word: "мектеп", 
    wordRu: "Школа",
    description: "Білім алу орны", 
    descriptionRu: "Место учёбы",
    category: "common_phrases",
    difficulty: "medium",
    videoUrl: "https://example.com/videos/mektep.mp4"
  },
  { 
    id: "8", 
    word: "Рақмет", 
    wordRu: "Спасибо",
    description: "Алғыс білдіру", 
    descriptionRu: "Выражение благодарности",
    category: "common_phrases",
    difficulty: "easy"
  },
  { 
    id: "9", 
    word: "Иә", 
    wordRu: "Да",
    description: "Келісім білдіру", 
    descriptionRu: "Согласие",
    category: "common_phrases",
    difficulty: "easy"
  },
  { 
    id: "10", 
    word: "Жоқ", 
    wordRu: "Нет",
    description: "Бас тарту", 
    descriptionRu: "Отказ",
    category: "common_phrases",
    difficulty: "easy"
  },
  { 
    id: "11", 
    word: "А", 
    wordRu: "А",
    description: "Қазақ әліпбиінің бірінші әрпі", 
    descriptionRu: "Первая буква казахского алфавита",
    category: "alphabet",
    difficulty: "easy"
  },
  { 
    id: "12", 
    word: "Ә", 
    wordRu: "Ә",
    description: "Қазақ әліпбиінің екінші әрпі", 
    descriptionRu: "Вторая буква казахского алфавита",
    category: "alphabet",
    difficulty: "easy"
  },
  { 
    id: "13", 
    word: "Б", 
    wordRu: "Б",
    description: "Қазақ әліпбиінің үшінші әрпі", 
    descriptionRu: "Третья буква казахского алфавита",
    category: "alphabet",
    difficulty: "easy"
  },
  { 
    id: "14", 
    word: "2", 
    wordRu: "Два",
    description: "Екі саны", 
    descriptionRu: "Число два",
    category: "numbers",
    difficulty: "easy"
  },
  { 
    id: "15", 
    word: "3", 
    wordRu: "Три",
    description: "Үш саны", 
    descriptionRu: "Число три",
    category: "numbers",
    difficulty: "easy"
  },
  { 
    id: "16", 
    word: "Кешіріңіз", 
    wordRu: "Извините",
    description: "Кешірім сұрау", 
    descriptionRu: "Просьба о прощении",
    category: "common_phrases",
    difficulty: "medium"
  },
  { 
    id: "17", 
    word: "Қалайсыз?", 
    wordRu: "Как дела?",
    description: "Хал-жағдай сұрау", 
    descriptionRu: "Вопрос о самочувствии",
    category: "questions",
    difficulty: "easy"
  },
  { 
    id: "18", 
    word: "Жақсы", 
    wordRu: "Хорошо",
    description: "Жақсы екенін білдіру", 
    descriptionRu: "Выражение положительного ответа",
    category: "common_phrases",
    difficulty: "easy"
  },
  { 
    id: "19", 
    word: "Қайырлы таң", 
    wordRu: "Доброе утро",
    description: "Таңғы сәлемдесу", 
    descriptionRu: "Утреннее приветствие",
    category: "greetings",
    difficulty: "easy"
  },
  { 
    id: "20", 
    word: "Қайырлы кеш", 
    wordRu: "Добрый вечер",
    description: "Кешкі сәлемдесу", 
    descriptionRu: "Вечернее приветствие",
    category: "greetings",
    difficulty: "easy"
  },
  { 
    id: "21", 
    word: "Ана", 
    wordRu: "Мама",
    description: "Отбасы мүшесі", 
    descriptionRu: "Член семьи",
    category: "family",
    difficulty: "easy"
  },
  { 
    id: "22", 
    word: "Әке", 
    wordRu: "Папа",
    description: "Отбасы мүшесі", 
    descriptionRu: "Член семьи",
    category: "family",
    difficulty: "easy"
  },
  { 
    id: "23", 
    word: "Не?", 
    wordRu: "Что?",
    description: "Сұрақ сөз", 
    descriptionRu: "Вопросительное слово",
    category: "questions",
    difficulty: "easy"
  },
  { 
    id: "24", 
    word: "Қайда?", 
    wordRu: "Где?",
    description: "Орын сұрау", 
    descriptionRu: "Вопрос о местоположении",
    category: "questions",
    difficulty: "easy"
  },
  { 
    id: "25", 
    word: "Қашан?", 
    wordRu: "Когда?",
    description: "Уақыт сұрау", 
    descriptionRu: "Вопрос о времени",
    category: "questions",
    difficulty: "medium"
  },
];

export const AI_RECOGNIZED_GESTURES = [
  "сәлеметсіз бе",
  "сау болыңыз", 
  "аты",
  "тегі",
  "әкесінің аты",
  "бір",
  "мектеп"
];
