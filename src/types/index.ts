export interface QuestionI {
  question: string;
  incorrect_answers: string[];
  correct_answer: string;
}

export interface TriviaApiResponseI {
  response_code: number;
  results: QuestionI[]
}

export interface CustomResponseI {
  message: string;
  choices: {
    all: string[];
    correct: string;
  }
}

export interface ParametersObj {
  difficulty: string | "Mix";
  type: string | "Mix";
  category: string | "Mix";
  amount: string;
}