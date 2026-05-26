export const normalizeCategoryKey = (value: string) =>
  value
    ? value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim()
    : "";

export const mapCategoryKey = (value: string) => {
  const normalized = normalizeCategoryKey(value);

  if (normalized.includes("UNIFORM")) return "UNIFORMES";
  if (normalized.includes("ASEO")) return "ASEO PERSONAL";
  if (normalized.includes("PROTECCION")) return "EQUIPO DE PROTECCION";
  if (normalized.includes("HIGUIEN") || normalized.includes("HIGIENE")) {
    return "ASEO PERSONAL";
  }
  if (normalized.includes("COMPORTAMIENTO")) {
    return "EQUIPO DE PROTECCION";
  }

  return normalized;
};