export type FormatAddressOptions = {
  start?: number;
  end?: number;
};

/**
 * Formats an EVM address for display.
 *
 * Example:
 *  formatAddress('0x1234567890abcdef...', { start: 6, end: 4 }) -> 0x1234…cdef
 */
export function formatAddress(
  address?: string,
  { start = 6, end = 4 }: FormatAddressOptions = {},
) {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

