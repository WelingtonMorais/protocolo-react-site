import { api } from "./api";

export interface TrainingState {
  id: string;
  currentStep: number;
  isCompleted: boolean;
  isDismissed: boolean;
}

export const trainingService = {
  async get(): Promise<TrainingState> {
    const { data } = await api.get<TrainingState>("/training");
    return data;
  },
  async update(payload: Partial<Pick<TrainingState, "currentStep" | "isCompleted" | "isDismissed">>): Promise<TrainingState> {
    const { data } = await api.put<TrainingState>("/training", payload);
    return data;
  },
};
