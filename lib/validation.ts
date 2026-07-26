export function isValidStellarAddress(address: string): boolean {
  return typeof address === 'string' && /^G[A-Z0-9]{55}$/.test(address.trim());
}

export function truncateAddress(address: string, start = 6, end = 6): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
