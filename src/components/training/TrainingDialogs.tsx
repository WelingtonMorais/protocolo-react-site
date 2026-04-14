import React from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

import { useAuth } from "@/providers/AuthProvider";
import { useTraining } from "@/providers/TrainingProvider";

const STEP_TEXT: Record<number, { title: string; body: string; cta: string }> = {
  0: {
    title: "Treinamento rapido do operador",
    body: "Em ate 2 minutos voce aprende o fluxo certo. Melhor do que so usar e saber usar bem, para atender com seguranca e velocidade.",
    cta: "Iniciar treinamento",
  },
  1: {
    title: "Etapa 1: Cadastre o condominio",
    body: "Crie o condominio e compartilhe o codigo/QR com os moradores para eles solicitarem vinculo no app.",
    cta: "Ir para condominio",
  },
  2: {
    title: "Etapa 2: Cadastre a primeira unidade",
    body: "Cadastre a primeira unidade agora. Para lista grande, teremos importacao rapida via suporte nas configuracoes.",
    cta: "Ir para unidades",
  },
  3: {
    title: "Etapa 3: Cadastre mensageiros",
    body: "Cada mensageiro precisa do seu token de 4 digitos. Isso identifica quem registrou e quem deu baixa na encomenda.",
    cta: "Ir para mensageiros",
  },
  4: {
    title: "Etapa 4: Pedidos de acesso",
    body: "Aqui chegam os pedidos de vinculo dos moradores via QR/codigo. A validacao e responsabilidade da operacao.",
    cta: "Ir para pedidos de acesso",
  },
  5: {
    title: "Treinamento concluido",
    body: "Perfeito! Agora voce pode registrar e entregar encomendas com tranquilidade. Obrigado por concluir o treinamento.",
    cta: "Concluir e continuar",
  },
};

export const TrainingDialogs = (): React.JSX.Element | null => {
  const { user } = useAuth();
  const {
    training,
    operatorStep,
    operatorModalOpen,
    startOperatorTraining,
    closeOperatorModal,
    goToCurrentStep,
    completeTraining,
    clientWelcomeOpen,
    closeClientWelcome,
  } = useTraining();

  if (!user) return null;

  const isOperator = user.role === "EMPLOYEE" || user.role === "ADMIN";
  const stepConfig = STEP_TEXT[operatorStep] ?? STEP_TEXT[0];

  return (
    <>
      {isOperator && training && !training.isCompleted && (
        <Dialog open={operatorModalOpen} maxWidth="sm" fullWidth>
          <DialogTitle>{stepConfig.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Alert severity="info">
                Treinamento guiado ativo. Ele aparece em todo login ate voce concluir.
              </Alert>
              <Typography variant="body1">{stepConfig.body}</Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => void closeOperatorModal()} color="inherit">
              Fechar
            </Button>
            {operatorStep >= 5 ? (
              <Button variant="contained" onClick={() => void completeTraining()}>
                {stepConfig.cta}
              </Button>
            ) : operatorStep === 0 ? (
              <Button variant="contained" onClick={() => void startOperatorTraining()}>
                {stepConfig.cta}
              </Button>
            ) : (
              <Button variant="contained" onClick={goToCurrentStep}>
                {stepConfig.cta}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {user.role === "CLIENT" && (
        <Dialog open={clientWelcomeOpen} onClose={closeClientWelcome} maxWidth="sm" fullWidth>
          <DialogTitle>Bem-vindo(a) ao Protocolo Encomendas</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Typography variant="body1">
                Para vincular ao condominio, voce precisa do QR code ou codigo de convite da portaria, sindico ou administracao.
              </Typography>
              <Alert severity="success">
                Seu sindico ainda nao usa? Convide agora: testar o app e o melhor jeito de conhecer e melhorar a rotina do condominio.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={closeClientWelcome}>
              Entendi
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
