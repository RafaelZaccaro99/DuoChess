/**
 * Aleatoriedade com semente.
 *
 * O gerador precisa ser determinístico: mesma semente, mesmo conteúdo, byte a
 * byte. Sem isso, cada execução produziria um diff em git cheio de ruído e
 * ninguém conseguiria revisar o que mudou de verdade.
 *
 * `Math.random` não serve porque não aceita semente.
 */

/** Gerador congruencial linear — pequeno, estável entre versões de Node. */
export class Aleatorio {
  private estado: number;

  constructor(semente: number) {
    // Normaliza para o intervalo positivo, evitando semente 0 (que travaria).
    this.estado = (Math.abs(Math.trunc(semente)) % 2_147_483_646) + 1;
  }

  /** Próximo número em [0, 1). */
  proximo(): number {
    this.estado = (this.estado * 16_807) % 2_147_483_647;
    return (this.estado - 1) / 2_147_483_646;
  }

  /** Inteiro em [min, max]. */
  inteiro(min: number, max: number): number {
    return min + Math.floor(this.proximo() * (max - min + 1));
  }

  /** Um elemento qualquer. Lança em lista vazia: escolher de nada é sempre bug. */
  escolher<T>(itens: readonly T[]): T {
    if (itens.length === 0) throw new Error("escolher() recebeu lista vazia");
    return itens[this.inteiro(0, itens.length - 1)]!;
  }

  /** Cópia embaralhada (Fisher-Yates). Não muta a entrada. */
  embaralhar<T>(itens: readonly T[]): T[] {
    const saida = [...itens];
    for (let i = saida.length - 1; i > 0; i--) {
      const j = this.inteiro(0, i);
      [saida[i], saida[j]] = [saida[j]!, saida[i]!];
    }
    return saida;
  }

  /** Alguns elementos distintos, na ordem embaralhada. */
  amostra<T>(itens: readonly T[], quantidade: number): T[] {
    return this.embaralhar(itens).slice(0, Math.min(quantidade, itens.length));
  }
}
