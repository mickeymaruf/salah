export interface AnswerStatement {
  sql: string;
  args: ('date' | 'prayer' | 'completedAt')[];
}

export const ANSWER_STATEMENTS: { prayed: AnswerStatement[]; missed: AnswerStatement[] };
