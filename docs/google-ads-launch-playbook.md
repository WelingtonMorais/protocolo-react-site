# Google Ads Launch Playbook (Primeiros 30 dias)

## 1) Pré-requisitos de medição
- Definir variáveis no front:
  - `VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`
  - `VITE_GTM_ID=GTM-XXXXXXX` (opcional)
- Validar recebimento dos eventos:
  - `landing_view`
  - `cta_click`
  - `register_start`
  - `register_success`
  - `payment_success`
- Confirmar que o cadastro está chegando com atribuição no backend (`LeadAttribution`).

## 2) Configuração da campanha de Pesquisa
- Objetivo: Vendas/Leads (otimização inicial para `register_success`).
- Estratégia de lances (fase 1): CPC manual com teto conservador.
- Rede: somente pesquisa Google (sem display no início).
- Segmentação geográfica: cidades/regiões alvo.
- Programação: foco em horário comercial nos primeiros 14 dias.

## 3) Estrutura enxuta recomendada
- Campanha: `BR_Search_Protocolo_Condo_01`
- Grupo 1 (alta intenção):
  - `gestao encomendas condominio`
  - `controle encomendas portaria`
  - `sistema encomendas condominio`
- Grupo 2 (categoria complementar):
  - `aplicativo portaria condominio`
  - `software condominio encomendas`
  - `organizar entregas condominio`

## 4) Orçamento para até R$1.000/mês
- Total mensal: R$1.000
- Média diária: ~R$33
- Distribuição:
  - 70% Grupo 1 (alta intenção)
  - 20% Grupo 2 (testes)
  - 10% reserva para remarketing futuro

## 5) Criativos (anúncios)
- Criar pelo menos 2 variações por grupo com promessas diferentes:
  - Variação A: controle e agilidade.
  - Variação B: segurança e rastreabilidade.
- Incluir CTA explícito para cadastro.

## 6) Conversões no Google Ads
- Importar conversões da GA4:
  - Primária: `payment_success`
  - Secundária: `register_success`
- Janela de conversão inicial: 30 dias.
- Após volume mínimo, avaliar migração para `Maximizar conversões`.

## 6.1) Configuração GTM para cadastro concluído (primária de aquisição)
- Garantir `VITE_GTM_ID` definido no build de produção.
- No GTM, criar **Custom Event Trigger** com `Event name = register_success`.
- Criar tag de conversão Google Ads para cadastro (`signup_success`) usando esse trigger.
- Manter regra por URL `/dashboard` apenas como apoio de navegação (não usar como conversão primária).
- Validar em **Preview**:
  - Landing abre: `landing_view`
  - CTA clicado: `cta_click`
  - Formulário iniciou: `register_start`
  - Cadastro concluiu: `register_success`
  - Primeiro acesso ao painel (secundário): `dashboard_view`

## 7) Critérios de decisão (semana a semana)
- Pausar termo que gastar acima do limite definido sem gerar `register_success`.
- Escalar termos com melhor taxa de `register_success -> payment_success`.
- Ajustar páginas e CTA quando houver queda forte entre `landing_view` e `register_start`.
