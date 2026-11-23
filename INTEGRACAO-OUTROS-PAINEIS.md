# Integração com o portal unificado de premiação

O portal unificado (login com escolha da operação) abre o painel de cada colega
passando a chave no endereço, depois do `#`:

```
https://painel-rv-claro.vercel.app/#chave=WA3621
```

O que vem depois do `#` não vai para o servidor nem aparece em logs da Vercel.

## O que o colega precisa colar (painel Claro Varejo / PAP)

No `index.html` do painel Claro, **no final do `<script>` principal** (depois da linha
`$("form").onsubmit = async (e) => { ... };`), cole:

```js
/* Entrada pelo Portal de Premiação: ...vercel.app/#chave=WA3621 → entra sozinho */
(function () {
  const p = new URLSearchParams(location.hash.slice(1));
  const k = (p.get("chave") || "").replace(/\s/g, "").toUpperCase().slice(0, 6);
  if (!k) return;
  history.replaceState(null, "", location.pathname + location.search); // tira a chave do endereço
  $("key").value = k;
  $("form").requestSubmit();
})();
```

Usa o próprio formulário e a própria `/api/acesso` dele. Nada muda na forma como ele valida a chave.

Depois que ele publicar, no **nosso** projeto, abra `js/portais.js` e troque
`aceitaChave:false` por `aceitaChave:true` nas operações dele (Claro Varejo e Claro PAP).
A partir daí o portal manda a pessoa direto, já logada.

Enquanto isso não acontece, o portal abre o painel do colega e copia a chave para a pessoa colar.

## Opcional: botão "voltar ao portal" no painel do colega

```html
<a href="https://SEU-PORTAL.onrender.com/#claro-varejo">← Portal de premiação</a>
```

## Nova operação de outro colega (ex.: Claro HEAD)

Em `js/portais.js`, preencha o bloco `claro-head` (ou copie um bloco):

- `url`: endereço do painel dele
- `chave`: texto explicando o formato (ex.: "Duas primeiras letras do nome + 4 últimos dígitos do CPF.")
- `formato`: validação em expressão regular (ex.: `^[A-Z]{2}[0-9]{4}$`)
- `exemplo`: exemplo de chave

Com `url` vazio, a operação não aparece no login.
Se o painel dele usar outro nome de campo/formulário, o trecho de integração muda só nas linhas
`$("key")` e `$("form")`.

## Links diretos por operação

Cada operação tem um link que já abre com ela marcada no login:

| Operação | Link |
|---|---|
| Chubb | `https://SEU-PORTAL.onrender.com/#chubb` |
| CredSystem | `https://SEU-PORTAL.onrender.com/#credsystem` |
| AXS Energia | `https://SEU-PORTAL.onrender.com/#axs` |
| Guerrilha | `https://SEU-PORTAL.onrender.com/#guerrilha` |
| Claro Varejo | `https://SEU-PORTAL.onrender.com/#claro-varejo` |
| Claro PAP | `https://SEU-PORTAL.onrender.com/#claro-pap` |

Sem link direto, o login lembra a última operação escolhida naquele aparelho.
