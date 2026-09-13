import React from 'react'
import { CurrentStageDto, StudentAnswerSubmissionDto } from '../../../services/testSession'
import { MultipleChoiceActivity } from './MultipleChoiceActivity'
import { ListeningChoiceActivity } from './ListeningChoiceActivity'
import { MissingLettersActivity } from './MissingLettersActivity'
import { PronunciationActivity } from './PronunciationActivity'

interface Props {
  stage: CurrentStageDto
  onComplete: (answers: StudentAnswerSubmissionDto[]) => void
}

export const StudentActivityRenderer: React.FC<Props> = ({ stage, onComplete }) => {
  const { activityType, questions } = stage

  switch (activityType) {
    case 'WORD_TO_MEANING':
    case 'MEANING_TO_WORD':
      return <MultipleChoiceActivity questions={questions} activityType={activityType} onComplete={onComplete} />
      
    case 'LISTEN_TO_WORD':
    case 'LISTEN_TO_MEANING':
      return <ListeningChoiceActivity questions={questions} activityType={activityType} onComplete={onComplete} />
      
    case 'MISSING_LETTERS':
    case 'MEANING_TO_TYPE_WORD':
    case 'LISTEN_TO_TYPE_WORD':
    case 'WORD_TO_TYPE_MEANING':
    case 'UNSCRAMBLE_WORD':
      // Using MissingLettersActivity as a generic text input activity
      return <MissingLettersActivity questions={questions} activityType={activityType} onComplete={onComplete} />
      
    case 'PRONUNCIATION':
      return <PronunciationActivity questions={questions} activityType={activityType} onComplete={onComplete} />
      
    case 'MATCH_WORD_MEANING':
      // Simplified: Fallback to Multiple Choice or generic for now
      return <MultipleChoiceActivity questions={questions} activityType={activityType} onComplete={onComplete} />
      
    default:
      return (
        <div className="p-8 text-center text-red-500">
          Loại hoạt động không được hỗ trợ: {activityType}
        </div>
      )
  }
}
