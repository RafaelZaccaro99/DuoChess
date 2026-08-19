/**
 * Substituto de `server-only` nos testes.
 *
 * O pacote real lança ao ser importado de um bundle de cliente — é a proteção
 * que impede código de servidor vazar para o navegador. Em teste de Node não
 * existe bundle de cliente, então ele não tem o que proteger.
 */
export {};
