type ClassValue = string | ((...args: unknown[]) => unknown) | undefined | null | false

export function cn(...classes: ClassValue[]): string {
  return classes.filter((c): c is string => typeof c === 'string').join(' ')
}
