/* =====================================================================
   Dados de demonstração (usados quando não há rv.json nem base local).
   ===================================================================== */
function gerarDemo(){
  let s=20261113; const rnd=()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const ri=(a,b)=>Math.floor(a+rnd()*(b-a+1));
  const nomes=['Ana Beatriz Souza','Bruno Carvalho','Camila Ferreira','Diego Martins','Eduarda Rocha','Felipe Nunes','Gabriela Ramos','Henrique Teixeira','Isabela Moreira','João Pedro Alves','Karina Duarte','Lucas Barbosa','Mariana Pires','Nicolas Freitas','Olívia Cardoso','Pedro Henrique Dias','Rafaela Castro','Samuel Pinto','Tatiane Gomes','Vinícius Araújo','Yasmin Correia','Wesley Monteiro','Larissa Campos','Mateus Ribeiro','Bianca Lima','Caio Fernandes','Débora Vieira','Elias Santana','Fernanda Lopes','Gustavo Mendes','Helena Cunha','Igor Batista'];
  const db=emptyDB(); db.demo=true;
  const ops=[
    {op:'chubb',sup:'Paula Mendes',coord:'Sérgio Lima',base:30000},
    {op:'credsystem',sup:'Rogério Tavares',coord:'Aline Prado',base:40000},
    {op:'axs',sup:'Marina Lopes',coord:'Ricardo Alves',base:70000},
    {op:'guerrilha',sup:'Thiago Rezende',coord:'Cláudia Nogueira',base:90000},
  ];
  let ni=0;
  ops.forEach(o=>{
    db.hc.push({mat:String(o.base+900),nome:o.sup,op:o.op,cargo:'supervisor',sup:'',coord:o.coord,equipe:'',regiao:'',meta:'',status:'Ativo'});
    db.hc.push({mat:String(o.base+990),nome:o.coord,op:o.op,cargo:'coordenador',sup:'',coord:'',equipe:'',regiao:'',meta:'',status:'Ativo'});
    for(let k=0;k<8;k++){
      const nome = o.op==='axs'&&k===0 ? 'Jonas Quintela' : nomes[ni++];
      const mat = o.op==='axs'&&k===0 ? '70231' : String(o.base+101+k*7);
      db.hc.push({mat,nome,op:o.op,cargo:'promotor',sup:o.sup,coord:o.coord,
        equipe:o.op==='axs'?(k<5?'Convencional':'High Performance'):'',
        regiao:o.op==='guerrilha'?['GERAL','RJ/ES','SP1 PLENO','SP1 SENIOR'][k%4]:'',
        meta:o.op==='chubb'?120:'',status:'Ativo'});
    }
  });
  ['2026-09','2026-10'].forEach((mes,mi)=>{
    const M={vendas:[],estornos:[],indicadores:[],importadoEm:new Date().toISOString()};
    const dia=d=>`${mes}-${String(d).padStart(2,'0')}`;
    db.hc.filter(p=>p.cargo==='promotor').forEach((p,pi)=>{
      if(p.op==='chubb'){
        const tot=ri(80,175); let rest=tot; let d=1; while(rest>0&&d<=30){ const q=Math.min(rest,ri(2,9)); M.vendas.push({mat:p.mat,data:dia(d),produto:['Seguro Residencial','Seguro Celular','Seguro Vida'][ri(0,2)],tipo:'',qtd:q,valor:0,port:false,marco:'',id:'',status:'Pago'}); rest-=q; d++; }
        M.indicadores.push({mat:p.mat,meta:120,abs:rnd()<.25,ativacao:null,seguros:null,assiduidade:null});
        for(let e=0;e<ri(0,8);e++) M.estornos.push({mat:p.mat,dataVenda:`2026-0${7+mi}-${String(ri(1,28)).padStart(2,'0')}`,id:'AP-'+ri(100000,999999),produto:'Seguro Celular',qtd:1,valor:0,valorVenda:0,motivo:['Cancelamento em 7 dias','Inadimplência 1ª parcela'][ri(0,1)]});
      }
      if(p.op==='credsystem'){
        const tot=ri(60,150); let rest=tot,d=1; while(rest>0&&d<=30){ const q=Math.min(rest,ri(2,8)); M.vendas.push({mat:p.mat,data:dia(d),produto:'Cartão aprovado',tipo:'APROVACAO',qtd:q,valor:0,port:false,marco:'',id:'',status:'Aprovado'}); rest-=q; d++; }
        M.indicadores.push({mat:p.mat,meta:'',abs:false,ativacao:+(0.58+rnd()*.25).toFixed(4),seguros:+(0.28+rnd()*.28).toFixed(4),assiduidade:+(0.86+rnd()*.14).toFixed(4)});
        for(let e=0;e<ri(0,6);e++) M.estornos.push({mat:p.mat,dataVenda:`2026-0${7+mi}-${String(ri(1,28)).padStart(2,'0')}`,id:'PR-'+ri(100000,999999),produto:'Cartão',qtd:1,valor:0,valorVenda:0,motivo:'Quebra de aprovação'});
      }
      if(p.op==='axs'){
        const n=ri(9,30); for(let k=0;k<n;k++) M.vendas.push({mat:p.mat,data:dia(ri(1,30)),produto:'Contrato energia por assinatura',tipo:'',qtd:1,valor:+(140+rnd()*320).toFixed(2),port:false,marco:'',id:'CT-'+ri(100000,999999),status:'Pago'});
        for(let e=0;e<ri(0,3);e++) M.estornos.push({mat:p.mat,dataVenda:`2026-0${7+mi}-${String(ri(1,28)).padStart(2,'0')}`,id:'CT-'+ri(100000,999999),produto:'Contrato energia',qtd:1,valor:0,valorVenda:+(140+rnd()*320).toFixed(2),motivo:'Cancelamento do cliente'});
      }
      if(p.op==='guerrilha'){
        const nc=ri(25,85); for(let k=0;k<nc;k++) M.vendas.push({mat:p.mat,data:dia(ri(1,30)),produto:['Combo Claro 350MB + Controle','Combo Claro 500MB + Pós','Combo Claro 1GB + Pós'][ri(0,2)],tipo:'COMBO',qtd:1,valor:[129.9,169.9,219.9][ri(0,2)],port:rnd()<.3,marco:'D30',id:'LN-119'+ri(10000000,99999999),status:'Pago'});
        if(mi>0){ const nd=ri(10,40); for(let k=0;k<nd;k++) M.vendas.push({mat:p.mat,data:`2026-08-${String(ri(1,28)).padStart(2,'0')}`,produto:'Combo Claro 350MB + Controle',tipo:'COMBO',qtd:1,valor:129.9,port:rnd()<.3,marco:'D60',id:'LN-119'+ri(10000000,99999999),status:'Pago'}); }
        const nf=ri(20,120); for(let k=0;k<nf;k++) M.vendas.push({mat:p.mat,data:dia(ri(1,30)),produto:rnd()<.5?'Flex Recarga':'Flex Cartão',tipo:'FLEX',qtd:1,valor:0,port:rnd()<.2,marco:'',id:'LN-119'+ri(10000000,99999999),status:'Pago'});
        for(let e=0;e<ri(2,14);e++) M.estornos.push({mat:p.mat,dataVenda:`2026-0${7+mi}-${String(ri(1,28)).padStart(2,'0')}`,id:'LN-119'+ri(10000000,99999999),produto:'Combo Claro 350MB + Controle',qtd:1,valor:0,valorVenda:129.9,motivo:'Inadimplência · 2ª fatura'});
      }
    });
    db.meses[mes]=M;
  });
  return db;
}
