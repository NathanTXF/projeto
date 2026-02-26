/**
 * Utilitários de data para garantir resiliência temporal no sistema.
 */

/**
 * Gera um array de anos relativos a um ano base.
 * Útil para seletores que precisam mostrar anos passados e futuros.
 * 
 * @param baseYear O ano de referência (ex: new Date().getFullYear())
 * @param past Quantos anos para trás incluir
 * @param future Quantos anos para frente incluir
 * @returns Array de números ordenados (ex: [2024, 2025, 2026, 2027])
 */
export function generateYearRange(baseYear: number, past: number, future: number): number[] {
    const years: number[] = [];
    for (let i = baseYear - past; i <= baseYear + future; i++) {
        years.push(i);
    }
    return years;
}

/**
 * Retorna o ano atual como número.
 */
export function getCurrentYear(): number {
    return new Date().getFullYear();
}

/**
 * Retorna o mês atual (1-12).
 */
export function getCurrentMonth(): number {
    return new Date().getMonth() + 1;
}
