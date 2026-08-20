"use client";

/**
 * Calcula um valor UMA vez, assim que o progresso terminar de carregar.
 *
 * Sessão e fila de revisão precisam ser congeladas na entrada: recalcular a cada
 * resposta faria os itens mudarem debaixo do aluno — acertar move o domínio, que
 * move o gargalo, que reordenaria a sessão em andamento; e responder um item de
 * revisão o tira da fila no meio dela.
 *
 * O congelamento ingênuo, num inicializador de `useState`, roda no primeiro
 * render — quando o progresso ainda é nulo, porque vem de leitura assíncrona. O
 * valor congelava em nulo e a tela ficava em "carregando" para sempre. Só não
 * aparecia quando se chegava por navegação interna, com o provider já pronto.
 */

import { useEffect, useRef, useState } from "react";

export function useCongelado<T>(pronto: boolean, calcular: () => T): T | null {
  const [valor, setValor] = useState<T | null>(null);
  const jaCalculado = useRef(false);
  const calcularRef = useRef(calcular);
  calcularRef.current = calcular;

  useEffect(() => {
    if (!pronto || jaCalculado.current) return;
    jaCalculado.current = true;
    setValor(calcularRef.current());
  }, [pronto]);

  return valor;
}
