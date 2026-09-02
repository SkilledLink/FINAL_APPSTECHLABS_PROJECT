import { apiRequest } from "./api";
import type {
  CommunityQuestion,
  CreateAnswerData,
} from "../types/home";

export async function getQuestions(): Promise<
  CommunityQuestion[]
> {
  return apiRequest<CommunityQuestion[]>("/questions");
}

export async function getQuestion(
  questionId: number
): Promise<CommunityQuestion> {
  return apiRequest<CommunityQuestion>(
    `/questions/${questionId}`
  );
}

export async function createQuestion(data: {
  question: string;
  categories: string[];
}): Promise<CommunityQuestion> {
  return apiRequest<CommunityQuestion>("/questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function answerQuestion(
  questionId: number,
  data: CreateAnswerData
) {
  return apiRequest(
    `/questions/${questionId}/answers`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function getQuestionAnswers(
  questionId: number
) {
  return apiRequest(
    `/questions/${questionId}/answers`
  );
}