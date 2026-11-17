export const createDemoHandle = (displayName: string): string => {
  const normalized = displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "_")
    .replace(/^[_\-.]+|[_\-.]+$/g, "")
    .slice(0, 32);

  return normalized.length >= 3 ? normalized : "oyente_sonus";
};
