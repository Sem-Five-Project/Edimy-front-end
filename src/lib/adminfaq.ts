import api from "./api";

export interface FaqDto {
  faqId: number;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface FaqStatsDto {
  totalFaqs: number;
  activeFaqs: number;
  categoryCount: number;
}

export const getFaqStats = async (): Promise<FaqStatsDto> => {
  const response = await api.get("/faq/stats");
  return response.data;
};

export const getAllFaqs = async (): Promise<FaqDto[]> => {
  const response = await api.get("/faq");
  return response.data;
};

export const createFaq = async (
  faqDto: Omit<FaqDto, "faqId" | "createdAt">,
): Promise<FaqDto> => {
  const response = await api.post("/faq", faqDto);
  return response.data;
};

export const updateFaq = async (
  id: number,
  faqDto: Omit<FaqDto, "faqId" | "createdAt">,
): Promise<FaqDto> => {
  const response = await api.put(`/faq/${id}`, faqDto);
  return response.data;
};

export const deleteFaq = async (id: number): Promise<void> => {
  await api.delete(`/faq/${id}`);
};
