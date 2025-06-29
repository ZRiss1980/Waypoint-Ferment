// /src/lib/scheduler.js

/**
 * Calculates fermentation duration in days based on type.
 * @param {string} type - "lager", "hybrid", "ale", etc.
 * @returns {number}
 */
export function getFermentationDuration(type) {
  switch (type?.toLowerCase()) {
    case "lager":
      return 42;
    case "lager-hybrid":
      return 28;
    case "ale-hybrid":
      return 21;
    case "ale":
    default:
      return 14;
  }
}

/**
 * Adds days to a JS Date without mutating the original.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Returns true if two date ranges overlap.
 * @param {Date} startA
 * @param {Date} endA
 * @param {Date} startB
 * @param {Date} endB
 * @returns {boolean}
 */
export function dateRangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Determines scheduling priority from plan metadata.
 * @param {object} plan
 * @returns {number}
 */
export function getPlanPriority(plan) {
  if (plan.flagType === "flagship") return 3;
  if (plan.flagType === "seasonal") return 2;
  if (plan.flagType === "one-off" && plan.eventDueDate) return 3;
  return 1;
}

/**
 * Attempts to find the best available start date and fermenter.
 * @param {Date} preferredStart
 * @param {number} duration
 * @param {object[]} fermenters [{ id, bookings: [{start, end}] }]
 * @returns {{ startDate: Date, fermenterId: string } | null}
 */
export function findOpenSlot(preferredStart, duration, fermenters) {
  for (const fv of fermenters) {
    let tryDate = new Date(preferredStart);

    while (true) {
      const tryEnd = addDays(tryDate, duration);

      const conflict = fv.bookings?.some((booking) =>
        dateRangesOverlap(tryDate, tryEnd, booking.start, booking.end)
      );

      if (!conflict) {
        return { startDate: tryDate, fermenterId: fv.id };
      }

      tryDate.setDate(tryDate.getDate() + 1);
    }
  }

  return null;
}
