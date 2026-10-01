import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateLabel(value: string | null, long = false) {
  return value ? format(parseISO(value), long ? 'd MMMM yyyy' : 'd MMM yyyy', { locale: id }) : 'Belum diajukan'
}

export function moneyLabel(value: number | null, decimals = 0) {
  return value === null ? 'Belum ditetapkan' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}
