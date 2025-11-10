/**
 * Tipos para variables de entorno del dashboard
 */

export type EnvironmentVariable = {
  id: number;
  name: string;
  token: string; // JSON string que necesita ser parseado
  typeData: string;
  url: string | null;
  status: boolean;
};

export type EnvironmentVariableResponse = {
  code: number;
  message: string;
  data: EnvironmentVariable;
};
