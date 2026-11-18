# Painel RV multi-operação

Roda 100% no navegador. Não tem back-end nem banco de dados: tudo fica no arquivo `rv.json`.

## Estrutura

```
index.html                 só a casca: carrega o CSS e os scripts na ordem certa
css/style.css              todo o visual
js/nucleo.js               registro das operações + utilidades (formatação, faixas, datas)
js/operacoes/
  chubb.js                 regras + cálculo + tabela de regras da Chubb
  credsystem.js            idem CredSystem
  axs.js                   idem AXS Energia
  guerrilha.js             idem Guerrilha (Trade Claro)
js/armazenamento.js        leitura/gravação do rv.json e do localStorage
js/motor.js                apuração genérica: promotores → gestores → estornos → remanescentes
js/importacao.js           leitura das planilhas (HC, vendas, estornos, indicadores)
js/demo.js                 dados de demonstração
js/telas/login.js          tela de entrada
js/telas/colaborador.js    ambiente do promotor/supervisor (tema da operação)
js/telas/master.js         ambiente master
js/app.js                  estado da sessão e roteamento entre as telas
modelos/                   planilhas-modelo para importação
```

### Mexer numa operação
Tudo de uma operação está no arquivo dela em `js/operacoes/`: nome, cores, `aliases` (como ela aparece na coluna OPERACAO da base HC), `regras` (as faixas), `calcularPromotor`, `calcularGestor` (opcional) e `telaRegras`.

### Nova operação
Copie um arquivo de `js/operacoes/`, troque a chave em `registrarOperacao('nova', {...})` e adicione o `<script>` no index.html.

## Publicar na Vercel
Suba a pasta inteira (sem build, é site estático). Abrir o index.html direto do computador também funciona.

## Ciclo de apuração do mês
1. Entre com a chave master (padrão `MASTER2026`; troque em **Regras**).
2. **Indicadores do mês**: escolha a competência e a operação e ligue só o que vale no mês (o mês sem configuração herda a do último mês configurado).
3. **Importar bases** → **Folha de indicadores** (modelo `modelos/modelo_folha_premiacao.xlsx`, mesmo layout da aba FOLHA RV). Pode subir o arquivo inteiro: a aba com MATRICULA é encontrada sozinha.
   - Identificação: MÊS, MATRICULA, NOME, OPERACAO, CARGO, SUPERVISOR, COORDENADOR, REGIONAL, PERFIL.
   - AXS: MENSALIDADES (promotor); MENSALIDADES, META MENSALIDADES, %ICM MENSALIDADES, FTE, %QUADRO, FTE ZERADOS <30 DIAS (supervisor, uma linha por regional).
   - Chubb: SEG CHUB, ABS CHUBB (promotor); PROD SEG CHUBB (supervisor/coordenador).
   - CredSystem: APROVADOS, ATIVIADOS, %ATIVADOS, SEGUROS CRED, %SEGUROS CRED, %ASSIDUIDADE; META APROV (supervisor).
   - Guerrilha: COMBO ATV, FLEX, VALORES D60, CONTESTAÇÕES, QUEBRAS (promotor); META CONTROLE, META COMBO, %ICM CONTROLE, %ICM COMBO, HC %ICM 90/100/120% CONTROLE e COMBO, %QUEBRA CONC. FINANCEIRA, % TURN OVER (supervisor).
   - Colunas de prêmio (PREM..., RV ...) são ignoradas: a ferramenta calcula. PREMIACAO TTOAL, se vier, alimenta a aba **Conferência**.
4. **Conferência**: compara o calculado com a PREMIACAO TTOAL da planilha, pessoa a pessoa.
5. Confira **Visão geral**, **Ranking** e **Folha de RV** (exporta Excel).
6. **Dados (JSON)** → **Baixar rv.json** → coloque na raiz desta pasta → publique de novo.
7. Promotores e supervisores entram com as 2 primeiras letras do nome + matrícula (ex.: `JO70231`).

Sem `rv.json` na pasta, o painel abre com dados de demonstração.

## Atenção
O `rv.json` fica acessível para quem souber o endereço, e a chave identifica a pessoa, mas não é uma senha.
