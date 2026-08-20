# Auditoria por amostragem — agosto de 2026

Primeira rodada da auditoria por amostragem prevista em
`docs/09-plano-ate-o-mvp.md` §0, item 3: a terceira parte da rede de
segurança contra "xadrez certo, pedagogia errada" (junto dos dois gates
automatizados de A2/A7 e do canal de exercícios contestados de A8.4). O
objetivo não é revisar item a item — é ler uma amostra pequena procurando
erro **sistemático**: nome de padrão errado, fonte que não sustenta a
afirmação, regra que não generaliza.

## Processo

1. `npm run auditoria:amostragem` sorteia ~5% do acervo publicado (Fisher-
   Yates, sem repetição) e imprime cada item por completo — FEN, gabarito,
   erros previsíveis, as 6 partes da explicação, fontes citadas (próprias e
   herdadas da habilidade).
2. Rodei o script duas vezes nesta rodada (12 itens no total, ~11% do
   acervo de 112 exercícios) e li cada item contra
   `src/content/bibliografia.ts`: a fonte citada cobre a competência
   exigida? A afirmação pedagógica é sustentável pela obra citada? O padrão
   generaliza pra além do exemplo?
3. Construí `/admin/auditoria`, que reusa a mesma lógica de sorteio
   (`src/domain/content/audit-sample.ts`) e grava o veredito de cada item
   (OK/FLAGGED + observação) num novo modelo `SampleAuditRecord` — histórico
   de rodadas futuras, não fila de trabalho.

## Achados

### 1. `r5.e2` — explicação com raciocínio não editado (corrigido)

O exercício `r5.e2` (habilidade `r5.mate-em-1`, lição `r5.l1`, FEN
`6k1/5ppp/8/8/8/8/8/R3K2R w KQ - 0 1`) tinha um `predictableErrors` para a
resposta errada "Te8+" com texto de rascunho, não de explicação:

> "Te8+ dá xeque, mas o rei foge para h7? Não — melhor: a torre em e8 fica
> ao alcance do rei? Não. O problema é outro: o rei tem g7... que está
> ocupada. Confira com calma qual torre chega a uma casa segura na oitava
> fileira."

Investigando a fundo: essa jogada nem é legal na posição — nenhuma das
duas torres (a1, h1) alcança e8 ou h8 num lance só (`chess.js` confirma:
`Invalid move: Re8+`), então o texto também descrevia um lance que a
posição sequer permite, sem dizer isso com clareza.

**Isso não é o mesmo problema do padrão usado em outros itens.** Em vários
exercícios de `CHECK_ESCAPE` e de direito de roque (`r4.e2`, `r4.e3`,
`g.r4b.*`, `g.r6a.*`), um lance **ilegal** é usado de propósito como erro
previsível — "parece resolver, mas deixa o rei em xeque" ou "essa torre já
perdeu o direito de rocar" — e a explicação diz isso claramente
("Esse lance deixa o rei atacado, então não é legal"). É um recurso
pedagógico legítimo e correto. O problema específico do `r5.e2` era a
qualidade da explicação — raciocínio de rascunho, não uma explicação
pronta — não o uso de um lance ilegal em si.

**Corrigido**: troquei os dois `predictableErrors` de `r5.e2` por lances
legais com explicação direta (`Txh7` — captura um peão mas não é xeque;
`Ta7` — sobe a coluna certa mas para uma casa cedo). `content:validate`,
`tsc` e os 267 testes seguem limpos com a correção.

**Tentativa revertida**: cheguei a adicionar uma checagem de legalidade dos
`predictableErrors` ao gate ENGINE_REVIEW (`src/domain/content/gates.ts`)
para fechar a lacuna que deixou esse item passar. Revertida: ela reprovou
16 itens legítimos que usam o padrão intencional de "lance ilegal como erro
previsível" descrito acima. Distinguir programaticamente "lance
geometricamente impossível" (erro de autoria) de "lance ilegal só por
deixar o rei em xeque, ou por direito de roque perdido" (recurso
pedagógico) exigiria gerar pseudo-lances ignorando a segurança do rei —
`chess.js` não expõe isso diretamente na API pública. Registro como
limitação conhecida do gate automatizado, não como algo resolvido nesta
rodada — é exatamente o tipo de coisa que a auditoria humana existe pra
pegar, porque o gate automatizado não consegue.

### 2. Amostra lida a fundo: nenhum erro sistemático

Os demais 11 itens lidos (`g.r5b.02`, `g.r6c.03`, `g.r1.06`, `g.r2a.02`,
`g.r1b.04`, `g.r5b.03`, `g.r6b.03`, `g.r6.03`, `g.r1b.05`, `g.r1.03`,
`g.r4a.03`, `g.r6.06`) não mostraram padrão sistêmico:

- **Fontes**: toda fonte citada cobre a competência da habilidade
  (`sourcesFor`/gate exige que UMA fonte cubra, não todas — citar
  `silman-endgame` ao lado de `fide-laws` num item de afogamento é
  aceitável, não é falha de sourcing).
- **Correção xadrezística**: conferi à mão vários itens (cor de f7 e d2 por
  paridade, casas atacadas pelo cavalo de g4, casa inicial da dama em cada
  cor, en passant) — todos batem com a regra do xadrez.
- **Generalização**: as `transferableRule` descrevem regras que realmente
  generalizam (paridade decide cor da casa, cavalo troca de cor a cada
  lance, direito de en passant dura um lance só) — não são reformulações
  disfarçadas do exemplo específico.
- **Nomenclatura de padrão**: nomes como "mate de corredor", "en passant",
  "notação algébrica" batem com o uso padrão da literatura citada.

## Conclusão

Acervo aprovado nesta amostragem. Um achado real e corrigido (`r5.e2`),
isolado — não sistêmico, como demonstra o mesmo recurso pedagógico sendo
usado corretamente em outros itens do acervo. Processo e ferramenta
(`npm run auditoria:amostragem`, `/admin/auditoria`) agora existem para
rodadas futuras; a lacuna de legalidade de `predictableErrors` no gate
ENGINE_REVIEW fica registrada como possível trabalho futuro, não como algo
pendente de resolver nesta rodada.
