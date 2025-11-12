// utils/formatPlaca.ts (nova util para formatar placas)
export const formatPlaca = (placa: string): string => {
  if (placa && placa.length >= 3 && !placa.includes('-')) {
    return placa.slice(0, 3) + '-' + placa.slice(3);
  }
  return placa;
};