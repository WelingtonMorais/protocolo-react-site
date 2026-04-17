# Planejamento de Lancamento e Aquisicao (Google Ads)

## Objetivo do ciclo inicial (30 dias)

- Validar Google Ads com orcamento de ate R$ 1.000/mes.
- Otimizar para duas conversoes:
  - micro: `register_success`
  - macro: `payment_success`
- Criar base de dados para decidir escala com seguranca.

## Publico e proposta

- Publico principal: condominios e operacoes de portaria com dor em controle de encomendas.
- Mensagem central: controle, rastreabilidade e agilidade na gestao de entregas.

## Estrategia de campanha (inicio enxuto)

- 1 campanha de Pesquisa com 2 grupos:
  - Grupo A: termos de alta intencao (dor/solucao direta).
  - Grupo B: termos complementares para descoberta.
- Distribuicao de verba:
  - 70% Grupo A
  - 20% Grupo B
  - 10% reserva para remarketing futuro
- Geografia/horario: focar cidades-alvo e horario comercial nas primeiras semanas.

## Instrumentacao e dados (ja implementado)

- Captura de origem no front:
  - UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
  - IDs de clique (`gclid`, `fbclid`)
  - Persistencia local com TTL para atribuicao de cadastro.
- Eventos de funil:
  - `landing_view`
  - `cta_click`
  - `register_start`
  - `register_success`
  - `payment_success`
- Persistencia no backend:
  - tabela `LeadAttribution` vinculada ao `User`.

## KPIs semanais minimos

- CTR por grupo de anuncios.
- CPC medio.
- Taxa `landing_view -> register_start`.
- Taxa `register_start -> register_success`.
- Taxa `register_success -> payment_success`.
- CAC estimado por assinatura.

## Rotina operacional semanal

### Segunda
- Ler volume de funil e performance de anuncios.
- Identificar termos com gasto alto e baixa conversao.

### Quarta
- Pausar termos ineficientes.
- Realocar verba para termos com melhor custo por cadastro.
- Ajustar 1-2 variacoes de anuncio.

### Sexta
- Revisar gargalos do funil e registrar aprendizados.
- Definir experimento principal da semana seguinte.

## Regras de decisao

- Pausar palavra-chave sem conversao apos limite de gasto definido.
- Escalar somente termos com estabilidade de conversao por ao menos 2 semanas.
- So aumentar orcamento quando o custo por `payment_success` estiver sustentavel.

## Backlog de evolucao (proximos passos)

1. Configurar IDs reais:
   - `VITE_GA4_MEASUREMENT_ID` (ex.: `G-ZH23QP309T` no `.env` local; no servidor de producao, exportar a mesma variavel **antes** de `npm run build` para o ID entrar no bundle)
   - `VITE_GOOGLE_ADS_ID` (ex.: `AW-...` — segunda `gtag('config', ...)` no mesmo loader do GA4, sem script duplicado no HTML)
   - `VITE_GOOGLE_ADS_CONVERSION_SEND_TO` (ex.: `AW-.../rotulo` — conversão disparada no app em `/payment/success`, sem segundo `<script>` no HTML)
   - `VITE_GTM_ID` (se usar GTM)
   - Apos publicar o `dist/`: no GA4, abrir **Relatorios > Tempo real** (ou **Admin > DebugView**) e percorrer `/` → CTA → `/cadastro` → cadastro → pagamento; conferir `landing_view`, `cta_click`, `register_start`, `register_success`, `payment_success`
2. Importar conversoes da GA4 no Google Ads:
   - primaria: `payment_success`
   - secundaria: `register_success`
3. Criar dashboard simples (Looker Studio/planilha) com KPIs semanais.
4. Montar lista inicial de negativas para reduzir cliques irrelevantes.
5. Iniciar remarketing somente apos base minima de trafego.

## Entregaveis esperados no fim do ciclo

- Atribuicao confiavel por origem/campanha no cadastro.
- Visibilidade clara do funil completo ate assinatura.
- Lista objetiva do que escalar, pausar e testar no proximo ciclo.
