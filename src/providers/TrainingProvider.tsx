import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api";
import { trainingService, type TrainingState } from "@/services/training.service";
import type { Courier } from "@/types/operator.types";

type OperatorStep = 0 | 1 | 2 | 3 | 4 | 5;

interface TrainingContextValue {
  training: TrainingState | null;
  loading: boolean;
  operatorStep: OperatorStep;
  operatorModalOpen: boolean;
  startOperatorTraining: () => Promise<void>;
  closeOperatorModal: () => Promise<void>;
  goToCurrentStep: () => void;
  completeTraining: () => Promise<void>;
  clientWelcomeOpen: boolean;
  closeClientWelcome: () => void;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

const OPERATOR_STEP_ROUTES: Record<OperatorStep, string> = {
  0: "/operador/dashboard",
  1: "/operador/condominio",
  2: "/operador/unidades",
  3: "/operador/mensageiros",
  4: "/operador/pedidos",
  5: "/operador/registrar",
};

export const TrainingProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<TrainingState | null>(null);
  const [operatorModalOpen, setOperatorModalOpen] = useState(false);
  const [clientWelcomeOpen, setClientWelcomeOpen] = useState(false);

  const refreshTraining = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user || user.role === "CLIENT") {
      setTraining(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const state = await trainingService.get();
      setTraining(state);
      setOperatorModalOpen(!state.isCompleted);
    } catch {
      setTraining(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const advanceIfStepComplete = useCallback(
    async (state: TrainingState): Promise<TrainingState> => {
      if (!user || (user.role !== "EMPLOYEE" && user.role !== "ADMIN")) return state;
      if (state.isCompleted) return state;

      let nextStep = state.currentStep;
      if (state.currentStep <= 1 && location.pathname.startsWith("/operador/condominio")) {
        const condo = await api.get<{ id?: string } | null>("/employee/condominiums/me").then((r) => r.data).catch(() => null);
        if (condo?.id) nextStep = Math.max(nextStep, 2);
      }
      if (nextStep <= 2 && location.pathname.startsWith("/operador/unidades")) {
        const condo = await api.get<{ id?: string } | null>("/employee/condominiums/me").then((r) => r.data).catch(() => null);
        if (condo?.id) {
          const units = await api.get<{ id: string }[]>(`/employee/condominiums/${condo.id}/units`).then((r) => r.data).catch(() => []);
          if (units.length > 0) nextStep = Math.max(nextStep, 3);
        }
      }
      if (nextStep <= 3 && location.pathname.startsWith("/operador/mensageiros")) {
        const couriers = await api.get<Courier[]>("/employee/couriers").then((r) => r.data).catch(() => []);
        if (couriers.length > 0) nextStep = Math.max(nextStep, 4);
      }
      if (nextStep <= 4 && location.pathname.startsWith("/operador/pedidos")) {
        nextStep = Math.max(nextStep, 5);
      }

      if (nextStep !== state.currentStep) {
        const updated = await trainingService.update({ currentStep: nextStep });
        setTraining(updated);
        return updated;
      }
      return state;
    },
    [location.pathname, user]
  );

  useEffect(() => {
    void refreshTraining();
  }, [refreshTraining]);

  useEffect(() => {
    if (!user || user.role !== "CLIENT") {
      setClientWelcomeOpen(false);
      return;
    }
    const sessionKey = `client-welcome-shown:${user.id}`;
    const alreadyShown = sessionStorage.getItem(sessionKey) === "1";
    if (!alreadyShown) setClientWelcomeOpen(true);
  }, [user]);

  useEffect(() => {
    if (!training || training.isCompleted) return;
    if (!user || (user.role !== "EMPLOYEE" && user.role !== "ADMIN")) return;
    void advanceIfStepComplete(training);
  }, [training, user, advanceIfStepComplete]);

  useEffect(() => {
    if (training && !training.isCompleted) setOperatorModalOpen(true);
  }, [training?.currentStep, training?.isCompleted]);

  useEffect(() => {
    if (!training || training.isCompleted) return;
    if (!user || (user.role !== "EMPLOYEE" && user.role !== "ADMIN")) return;
    const timer = setInterval(() => {
      void advanceIfStepComplete(training);
    }, 2500);
    return () => clearInterval(timer);
  }, [training, user, advanceIfStepComplete]);

  const closeOperatorModal = useCallback(async (): Promise<void> => {
    setOperatorModalOpen(false);
  }, []);

  const startOperatorTraining = useCallback(async (): Promise<void> => {
    if (!training) return;
    const updated =
      training.currentStep <= 0
        ? await trainingService.update({ currentStep: 1, isDismissed: false })
        : training;
    setTraining(updated);
    setOperatorModalOpen(false);
    navigate(OPERATOR_STEP_ROUTES[1], { replace: false });
  }, [training, navigate]);

  const goToCurrentStep = useCallback((): void => {
    const step = (training?.currentStep ?? 0) as OperatorStep;
    if (step <= 0) {
      void startOperatorTraining();
      return;
    }
    setOperatorModalOpen(false);
    navigate(OPERATOR_STEP_ROUTES[step], { replace: false });
  }, [training?.currentStep, navigate, startOperatorTraining]);

  const completeTraining = useCallback(async (): Promise<void> => {
    const updated = await trainingService.update({ currentStep: 5, isCompleted: true, isDismissed: true });
    setTraining(updated);
    setOperatorModalOpen(false);
  }, []);

  const closeClientWelcome = useCallback((): void => {
    if (user?.id) sessionStorage.setItem(`client-welcome-shown:${user.id}`, "1");
    setClientWelcomeOpen(false);
  }, [user?.id]);

  const value = useMemo<TrainingContextValue>(
    () => ({
      training,
      loading,
      operatorStep: ((training?.currentStep ?? 0) as OperatorStep),
      operatorModalOpen,
      startOperatorTraining,
      closeOperatorModal,
      goToCurrentStep,
      completeTraining,
      clientWelcomeOpen,
      closeClientWelcome,
    }),
    [
      training,
      loading,
      operatorModalOpen,
      startOperatorTraining,
      closeOperatorModal,
      goToCurrentStep,
      completeTraining,
      clientWelcomeOpen,
      closeClientWelcome,
    ]
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
};

export const useTraining = (): TrainingContextValue => {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error("useTraining must be used within TrainingProvider");
  return ctx;
};
