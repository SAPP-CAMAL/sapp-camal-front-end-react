/**
 * Tipos para la unidad de medida de trabajo
 */

export type UnitMeasure = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  description: string;
  status: boolean;
};

export type GetUnitMeasureResponse = {
  code: number;
  message: string;
  data: UnitMeasure;
};
