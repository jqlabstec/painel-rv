/* =====================================================================
   OPERAÇÕES DE OUTROS PAINÉIS (portal unificado)
   O login unificado mostra as operações deste painel (js/operacoes/*.js)
   e também as listadas aqui, que abrem o painel de outro colega.

   Campos:
   - id          identificador usado no link direto (ex.: https://SEU-SITE/#claro-varejo)
   - nome, sub   nome no botão e subtítulo
   - cor, cor2   cores do ambiente
   - url         endereço do painel do colega (vazio = operação escondida)
   - chave       explicação do formato da chave mostrada para o colaborador
   - formato     expressão que valida a chave antes de enviar (MAIÚSCULAS)
   - exemplo     exemplo exibido no campo
   - aceitaChave true quando o painel do colega já lê a chave do link
                 (#chave=XXXX) e entra sozinho. Enquanto for false, o portal
                 abre o painel do colega e copia a chave para a pessoa colar.
                 Código para o colega: INTEGRACAO-OUTROS-PAINEIS.md
   ===================================================================== */
window.RV_PORTAIS = [
  {
    id:'claro-varejo', nome:'Claro Varejo', sub:'Claro',
    cor:'#d0101f', cor2:'#7a0010',
    url:'https://painel-rv-claro.vercel.app/',
    chave:'Duas primeiras letras do nome + 4 últimos dígitos do CPF.',
    formato:'^[A-Z]{2}[0-9]{4}$', exemplo:'WA3621',
    aceitaChave:false,
  },
  {
    id:'claro-pap', nome:'Claro PAP', sub:'Claro',
    cor:'#d0101f', cor2:'#7a0010',
    url:'https://painel-rv-claro.vercel.app/',
    chave:'Duas primeiras letras do nome + 4 últimos dígitos do CPF.',
    formato:'^[A-Z]{2}[0-9]{4}$', exemplo:'WA3621',
    aceitaChave:false,
  },
  {
    // ESPAÇO RESERVADO: preencha url, chave, formato e exemplo quando o colega enviar.
    id:'claro-head', nome:'Claro HEAD', sub:'Claro',
    cor:'#a3000f', cor2:'#5f0009',
    url:'',
    chave:'Duas primeiras letras do nome + ...',
    formato:'^[A-Z]{2}[0-9]+$', exemplo:'AB1234',
    aceitaChave:false,
  },
];
