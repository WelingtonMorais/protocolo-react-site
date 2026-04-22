# GTM Checklist: Conversao de Cadastro

## 1) Objetivo
- Conversao principal de aquisicao no Google Ads: `signup_success`.
- Evento de origem no frontend (dataLayer): `register_success`.

## 2) Gatilho no GTM
- Tipo: `Custom Event`
- Event name: `register_success`
- This trigger fires on: `All Custom Events`

## 3) Tag de conversao Google Ads
- Tipo: `Google Ads Conversion Tracking`
- Conversion ID: `AW-18098857521`
- Conversion Label: usar o rotulo da acao `signup_success` criado no Google Ads.
- Trigger: `Custom Event - register_success`

## 4) Eventos de funil para GA4/GTM
- `landing_view` (entrada na landing)
- `cta_click` (cliques para login/cadastro)
- `register_start` (inicio do cadastro)
- `register_success` (cadastro concluido)
- `dashboard_view` (indicador secundario de navegacao para painel)

## 5) Regra de governanca
- Nao usar URL contendo `/dashboard` como conversao principal.
- `/dashboard` permanece como metrica secundaria de navegacao.

## 6) Validacao rapida (Preview do GTM)
1. Abrir landing (`/`) e verificar `landing_view`.
2. Clicar CTA e verificar `cta_click`.
3. Entrar em cadastro e verificar `register_start`.
4. Concluir cadastro e verificar `register_success`.
5. Entrar no painel e verificar `dashboard_view`.
