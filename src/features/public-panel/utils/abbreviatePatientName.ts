export function abbreviatePatientName(name?: string) {
  const normalizedName = (name ?? '').trim();

  if (!normalizedName) {
    return '';
  }

  const parts = normalizedName.split(/\s+/);

  if (parts.length <= 3) {
    return normalizedName;
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleNames = parts.slice(1, parts.length - 1).map((part, index) => {
    if (index === 0) {
      return part;
    }

    return `${part[0].toUpperCase()}.`;
  });

  return [firstName, ...middleNames, lastName].join(' ');
}
