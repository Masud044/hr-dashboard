// src\lib\utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function getPageNumbers(currentPage, totalPages) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}




// Sort a list alphabetically by name field and map to {value, label} select options
export function toSortedOpts(list, idField, nameField) {
  return [...list]
    .sort((a, b) => a[nameField].localeCompare(b[nameField]))
    .map((item) => ({ value: String(item[idField]), label: item[nameField] }));
}



// Format a date as dd-mm-yyyy Day(Ddd), e.g. "01-12-2025 Mon"
export function formatDateWithDay(dateInput) {
  if (!dateInput) return "—";

  const d = typeof dateInput === "string" ? parseISO(dateInput) : new Date(dateInput);
  if (!isValid(d)) return "—";

  return format(d, "dd-MM-yyyy EEE");
}