type ClassValue = string | ((...args: never[]) => string | undefined | null | false) | undefined | null | false

export function cn(...classes: ClassValue[]): string {
  return classes.filter((c): c is string => typeof c === 'string').join(' ')
}
