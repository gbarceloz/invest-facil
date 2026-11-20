export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  mfaEnabled: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  order: number;
  modules: ModuleSummary[];
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  estimatedMin: number;
  order: number;
  moduleId: string;
}

export interface ModuleDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  lessons: LessonSummary[];
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  readingMinutes: number;
  publishedAt: string;
  categorySlug: string | null;
  categoryName: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  contentMd: string;
  sourceName: string | null;
  sourceUrl: string | null;
}

export interface LessonDetail {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  estimatedMin: number;
  order: number;
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  categorySlug: string;
  categoryName: string;
  relatedArticles: ArticleSummary[];
}

export interface VideoInfo {
  lessonId: string;
  url: string;
  mime: string;
  durationSeconds: number | null;
  source: "SUPABASE" | "EXTERNAL" | "DEMO";
}

export interface QuizQuestion {
  id: string;
  position: number;
  question: string;
  options: string[];
}

export interface Quiz {
  lessonId: string;
  lessonTitle: string;
  questionCount: number;
  questions: QuizQuestion[];
}

export interface QuizQuestionResult {
  questionId: string;
  correct: boolean;
  selectedIndex: number;
  correctIndex: number;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  xpAwarded: number;
  totalXp: number;
  level: string;
  results: QuizQuestionResult[];
}

export interface Level {
  number: number;
  name: string;
  minXp: number;
  nextLevelXp: number | null;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface GamificationSummary {
  xp: number;
  level: Level;
  xpToNextLevel: number;
  progressPercent: number;
  currentStreak: number;
  bestStreak: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  achievements: Achievement[];
}

export interface XpEntry {
  amount: number;
  reason: string;
  lessonId: string | null;
  createdAt: string;
}

export interface CategoryProgress {
  id: string;
  slug: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  percent: number;
}

export interface RecentActivity {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  completedAt: string;
}

export interface NextLesson {
  id: string;
  slug: string;
  title: string;
  moduleTitle: string | null;
  categoryName: string | null;
  estimatedMin: number;
}

export interface ProgressSummary {
  totalLessons: number;
  completedLessons: number;
  percent: number;
  quizAverage: number;
  quizAttempts: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
  level: string;
  nextLesson: NextLesson | null;
  completedLessonIds: string[];
  categories: CategoryProgress[];
  recent: RecentActivity[];
}

export interface LessonStatus {
  completed: boolean;
  bestQuizPercent: number;
  attempts: number;
}

export interface CompleteLessonResponse {
  alreadyCompleted: boolean;
  xpAwarded: number;
  totalXp: number;
  level: string;
  currentStreak: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  priceBrl: number;
  change24hPercent: number;
  volume24hBrl: number;
}

export interface MarketResponse {
  assets: MarketAsset[];
  status: "FRESH" | "UNAVAILABLE";
  updatedAt: string;
  disclaimer: string;
}

export interface ScenarioInput {
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  annualRate: number;
  inflationRate: number;
}

export interface ScenarioPoint {
  month: number;
  contributed: number;
  balance: number;
  realBalance: number;
}

export interface ScenarioResult {
  finalAmount: number;
  investedAmount: number;
  interestAmount: number;
  realFinalAmount: number;
  monthlyRate: number;
  series: ScenarioPoint[];
  disclaimer: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  scenario: ScenarioInput;
  finalAmount: number;
  investedAmount: number;
  createdAt: string;
}

export interface SessionInfo {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export interface LoginResponse {
  accessToken: string | null;
  expiresIn: number | null;
  user: User;
  mfaRequired: boolean;
  challengeToken: string | null;
  refreshToken: string | null;
  message: string | null;
}

export interface RegisterResponse {
  message: string;
  devVerificationToken: string | null;
}

export interface SearchResults {
  lessons: LessonSummary[];
  articles: ArticleSummary[];
}

export interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string> | null;
}
