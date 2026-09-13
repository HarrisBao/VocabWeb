import { api } from './api'

export interface StudentQuestionOptionDto {
  vocabularyItemId: number
  text: string
}

export interface StudentQuestionDto {
  id: string
  questionIndex: number
  prompt: string
  targetWord?: string
  targetMeaning?: string
  options?: StudentQuestionOptionDto[]
  audioBehavior?: string
}

export interface CurrentStageDto {
  stageIndex: number
  totalStages: number
  activityType: string
  activityTypeLabel: string
  questions: StudentQuestionDto[]
}

export interface StudentAnswerSubmissionDto {
  questionId: string
  targetVocabularyItemId: number
  answerValue: string
  technicalFailure: boolean
}

export interface SubmitStageRequestDto {
  answers: StudentAnswerSubmissionDto[]
}

export interface ActivityResultDto {
  activityType: string
  activityTypeLabel: string
  correctCount: number
  incorrectCount: number
  invalidCount: number
  totalValidQuestions: number
  accuracy: number
  isLastActivity: boolean
}

export interface TestFinalResultDto {
  score: number
  correctCount: number
  totalQuestions: number
  totalAttempted: number
  durationSeconds: number
}

// Ensure the ticket is passed if the api client doesn't inject it globally, or we can use custom headers.
// Since api.ts probably handles auth, we'll pass X-Access-Ticket in headers.

const getHeaders = () => {
  const ticket = localStorage.getItem('guest_access_ticket')
  return ticket ? { 'X-Access-Ticket': ticket } : {}
}

export const TestSessionApi = {
  getCurrentStage: (attemptId: number) => {
    return api.get<CurrentStageDto>(`/learn/attempts/${attemptId}/current-stage`, {
      headers: getHeaders()
    })
  },
  completeStage: (attemptId: number, stageIndex: number, data: SubmitStageRequestDto) => {
    return api.post<ActivityResultDto>(`/learn/attempts/${attemptId}/stages/${stageIndex}/complete`, data, {
      headers: getHeaders()
    })
  },
  submitTest: (attemptId: number) => {
    return api.post<TestFinalResultDto>(`/learn/attempts/${attemptId}/submit`, {}, {
      headers: getHeaders()
    })
  }
}
