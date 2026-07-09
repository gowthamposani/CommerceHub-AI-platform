export function shortId(value: string | null | undefined, length = 8): string {
  if (!value) {
    return 'N/A';
  }

  return value.length > length ? value.slice(0, length) : value;
}
