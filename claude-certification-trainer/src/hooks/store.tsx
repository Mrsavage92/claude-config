import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Attempt,
  LabProgress,
  LessonProgress,
  MockExamResult,
  MockExamSession,
  PersistedState,
  Question,
  QuestionMeta,
  ReviewGrade,
  Settings,
  ThemeMode,
  SessionType,
  AnswerConfidence,
} from '@/schemas';
import { loadState, saveState } from '@/services/storage/storage';
import { makeDefaultState } from '@/services/storage/defaults';
import { isAnswerCorrect } from '@/services/scoring';
import { applyGrade, scheduleFromAttempt } from '@/services/review';
import { makeId } from '@/utils/format';

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

type Action =
  | { type: 'record-attempt'; attempt: Attempt; question: Question }
  | { type: 'patch-lesson'; lessonId: string; patch: Partial<LessonProgress> }
  | { type: 'patch-question-meta'; questionId: string; patch: Partial<QuestionMeta> }
  | { type: 'patch-lab'; labId: string; patch: Partial<LabProgress> }
  | { type: 'grade-review'; questionId: string; grade: ReviewGrade; now: number }
  | { type: 'add-manual-review'; question: Question; now: number }
  | { type: 'remove-review'; questionId: string }
  | { type: 'start-mock'; session: MockExamSession }
  | { type: 'patch-mock'; patch: Partial<MockExamSession> }
  | { type: 'finish-mock'; result: MockExamResult }
  | { type: 'abandon-mock' }
  | { type: 'update-settings'; patch: Partial<Settings> }
  | { type: 'set-theme'; mode: ThemeMode }
  | { type: 'replace-state'; state: PersistedState }
  | { type: 'reset' };

const emptyLessonProgress = (): LessonProgress => ({
  completed: false,
  bookmarked: false,
  understanding: 'new',
  note: '',
  updatedAt: Date.now(),
});

const emptyLabProgress = (): LabProgress => ({
  completedStepIndices: [],
  completed: false,
  note: '',
  updatedAt: Date.now(),
});

const emptyQuestionMeta = (): QuestionMeta => ({
  bookmarked: false,
  note: '',
  markedForReview: false,
  updatedAt: Date.now(),
});

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'record-attempt': {
      const attempts = [...state.attempts, action.attempt];
      const existing = state.reviewItems[action.attempt.questionId];
      const nextReview = scheduleFromAttempt(existing, action.question, action.attempt, action.attempt.at);
      const reviewItems = { ...state.reviewItems };
      if (nextReview) reviewItems[action.attempt.questionId] = nextReview;
      return { ...state, attempts, reviewItems };
    }
    case 'patch-lesson': {
      const prev = state.lessonProgress[action.lessonId] ?? emptyLessonProgress();
      return {
        ...state,
        lessonProgress: {
          ...state.lessonProgress,
          [action.lessonId]: { ...prev, ...action.patch, updatedAt: Date.now() },
        },
      };
    }
    case 'patch-question-meta': {
      const prev = state.questionMeta[action.questionId] ?? emptyQuestionMeta();
      const next = { ...prev, ...action.patch, updatedAt: Date.now() };
      return { ...state, questionMeta: { ...state.questionMeta, [action.questionId]: next } };
    }
    case 'patch-lab': {
      const prev = state.labProgress[action.labId] ?? emptyLabProgress();
      return {
        ...state,
        labProgress: {
          ...state.labProgress,
          [action.labId]: { ...prev, ...action.patch, updatedAt: Date.now() },
        },
      };
    }
    case 'grade-review': {
      const item = state.reviewItems[action.questionId];
      if (!item) return state;
      const updated = applyGrade(item, action.grade, action.now);
      return { ...state, reviewItems: { ...state.reviewItems, [action.questionId]: updated } };
    }
    case 'add-manual-review': {
      const q = action.question;
      const existing = state.reviewItems[q.id];
      if (existing) return state;
      return {
        ...state,
        reviewItems: {
          ...state.reviewItems,
          [q.id]: {
            questionId: q.id,
            certificationId: q.certificationId,
            domainId: q.domainId,
            reason: 'manual',
            intervalDays: 0,
            dueAt: action.now,
            reps: 0,
            lapses: 0,
            lastGrade: null,
            priority: 20,
            createdAt: action.now,
            updatedAt: action.now,
          },
        },
      };
    }
    case 'remove-review': {
      const reviewItems = { ...state.reviewItems };
      delete reviewItems[action.questionId];
      return { ...state, reviewItems };
    }
    case 'start-mock':
      return { ...state, activeMockSession: action.session };
    case 'patch-mock':
      if (!state.activeMockSession) return state;
      return { ...state, activeMockSession: { ...state.activeMockSession, ...action.patch } };
    case 'finish-mock':
      return {
        ...state,
        activeMockSession: null,
        mockResults: [...state.mockResults, action.result],
      };
    case 'abandon-mock':
      return { ...state, activeMockSession: null };
    case 'update-settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'set-theme':
      return { ...state, theme: { mode: action.mode } };
    case 'replace-state':
      return action.state;
    case 'reset':
      return makeDefaultState();
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export interface RecordAttemptInput {
  question: Question;
  selectedAnswerIds: string[];
  confidence: AnswerConfidence | null;
  responseTimeMs: number;
  timedOut: boolean;
  sessionType: SessionType;
}

export interface StoreValue {
  state: PersistedState;
  recovered: boolean;
  recoveryReason?: string;
  dismissRecovery: () => void;
  recordAttempt: (input: RecordAttemptInput) => Attempt;
  patchLesson: (lessonId: string, patch: Partial<LessonProgress>) => void;
  patchQuestionMeta: (questionId: string, patch: Partial<QuestionMeta>) => void;
  patchLab: (labId: string, patch: Partial<LabProgress>) => void;
  gradeReview: (questionId: string, grade: ReviewGrade) => void;
  addManualReview: (question: Question) => void;
  removeReview: (questionId: string) => void;
  startMock: (session: MockExamSession) => void;
  patchMock: (patch: Partial<MockExamSession>) => void;
  finishMock: (result: MockExamResult) => void;
  abandonMock: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (mode: ThemeMode) => void;
  replaceState: (state: PersistedState) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadState());
  const [state, dispatch] = useReducer(reducer, initial.current.state);
  const [recovered, setRecovered] = useState(initial.current.recovered);
  const recoveryReason = initial.current.reason;

  // Persist on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const recordAttempt = useCallback((input: RecordAttemptInput): Attempt => {
    const correct = isAnswerCorrect(input.question, input.selectedAnswerIds);
    const attempt: Attempt = {
      id: makeId('att'),
      questionId: input.question.id,
      certificationId: input.question.certificationId,
      domainId: input.question.domainId,
      taskStatementId: input.question.taskStatementId,
      sessionType: input.sessionType,
      provenance: input.question.provenance,
      selectedAnswerIds: input.selectedAnswerIds,
      correct,
      confidence: input.confidence,
      responseTimeMs: input.responseTimeMs,
      timedOut: input.timedOut,
      at: Date.now(),
    };
    dispatch({ type: 'record-attempt', attempt, question: input.question });
    return attempt;
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      recovered,
      recoveryReason,
      dismissRecovery: () => setRecovered(false),
      recordAttempt,
      patchLesson: (lessonId, patch) => dispatch({ type: 'patch-lesson', lessonId, patch }),
      patchQuestionMeta: (questionId, patch) => dispatch({ type: 'patch-question-meta', questionId, patch }),
      patchLab: (labId, patch) => dispatch({ type: 'patch-lab', labId, patch }),
      gradeReview: (questionId, grade) => dispatch({ type: 'grade-review', questionId, grade, now: Date.now() }),
      addManualReview: (question) => dispatch({ type: 'add-manual-review', question, now: Date.now() }),
      removeReview: (questionId) => dispatch({ type: 'remove-review', questionId }),
      startMock: (session) => dispatch({ type: 'start-mock', session }),
      patchMock: (patch) => dispatch({ type: 'patch-mock', patch }),
      finishMock: (result) => dispatch({ type: 'finish-mock', result }),
      abandonMock: () => dispatch({ type: 'abandon-mock' }),
      updateSettings: (patch) => dispatch({ type: 'update-settings', patch }),
      setTheme: (mode) => dispatch({ type: 'set-theme', mode }),
      replaceState: (s) => dispatch({ type: 'replace-state', state: s }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state, recovered, recoveryReason, recordAttempt],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

/** Expose the reducer for unit tests. */
export { reducer as _storeReducer };
