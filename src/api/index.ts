import { CONSTANTS } from "src/constants/index.js";
import {
  CustomResponseI,
  ParametersObj,
  QuestionI,
  TriviaApiResponseI
} from "src/types/index.js";
import axios from 'axios';
import { shuffler } from "src/utils/index.js";

export async function fetchQuestions(paramaters: ParametersObj) {
  try {
    const endpoint = `${CONSTANTS.baseAPI}api.php`;

    const { data }: { data: TriviaApiResponseI } =
      await axios.get(
        endpoint, {
        params: paramaters
      });

    let response: CustomResponseI[] | string = [];
    if (data.response_code === 0) {
      data.results.forEach((question: QuestionI) =>
        typeof response !== "string" &&
        response.push({
          message: question.question,
          choices: {
            all: shuffler([
              ...question.incorrect_answers,
              question.correct_answer
            ]),
            correct: question.correct_answer
          }
        }));
    } else if (data.response_code === 1) {
      response = "No results were found that matched your request options.";
    }
    return response;
  } catch (error) {
    return console.error(error);
  }
}