import api from "./api";

export interface Subject {
  subjectId?: number;
  name: string;
  educationLevel: EducationLevel;
  stream?: HighSchoolStreamType;
}

export enum EducationLevel {
  DOCTORATE = "DOCTORATE",
  HIGHSCHOOL_ADVANCED_LEVEL = "HIGHSCHOOL_ADVANCED_LEVEL",
  POSTGRADUATE = "POSTGRADUATE",
  PRIMARY_GRADE_1_5 = "PRIMARY_GRADE_1_5",
  SECONDARY_GRADE_6_11 = "SECONDARY_GRADE_6_11",
  UNDERGRADUATE = "UNDERGRADUATE",
}

export enum HighSchoolStreamType {
  MATHS = "MATHS",
  BIO = "BIO",
  TECHNOLOGY = "TECHNOLOGY",
  COMMERSE = "COMMERSE",
  ARTS = "ARTS",
  AGRI = "AGRI",
  ICT = "ICT",
}

export const subjectAPI = {
  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await api.get("/subjects");
    return response.data;
  },

  createSubject: async (subject: Subject): Promise<Subject> => {
    const response = await api.post("/subjects", subject);
    return response.data;
  },

  deleteSubject: async (id: number): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },
};
