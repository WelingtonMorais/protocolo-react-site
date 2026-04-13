import { api } from "@/services/api";
import type { Courier } from "@/types/operator.types";

export const couriersService = {
  getAll: async (): Promise<Courier[]> => {
    const response = await api.get<Courier[]>("/employee/couriers");
    return response.data;
  },

  create: async (data: {
    name: string;
    email: string;
    phone: string;
    token?: string;
  }): Promise<Courier> => {
    const response = await api.post<Courier>("/employee/couriers", data);
    return response.data;
  },

  update: async (
    id: string,
    data: { name?: string; email?: string; phone?: string },
  ): Promise<Courier> => {
    const response = await api.put<Courier>(`/employee/couriers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employee/couriers/${id}`);
  },
};
