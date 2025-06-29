// /src/lib/scheduler/assignBrewPlanDates.js

export function assignBrewPlanDates(plans, fermenters) {
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const dateRangesOverlap = (startA, endA, startB, endB) => {
    return startA < endB && startB < endA;
  };

  const getDuration = (type) => {
    if (!type) return 14;
    const t = type.toLowerCase();
    if (t.includes("lager")) return 42;
    if (t.includes("hybrid")) return 21;
    return 14;
  };

  const getPriority = (plan) => {
    if (plan.flagType === "flagship") return 3;
    if (plan.flagType === "seasonal") return 2;
    if (plan.flagType === "one-off" && plan.eventDueDate) return 3;
    return 1;
  };

  const fvBookings = {};
  fermenters.forEach((fv) => {
    fvBookings[fv.id] = [];
  });

  // Pre-fill bookings
  plans.forEach((plan) => {
    if (plan.assignedFermenter && fvBookings[plan.assignedFermenter]) {
      fvBookings[plan.assignedFermenter].push({
        start: new Date(plan.startDate),
        end: new Date(plan.endDate),
      });
    }
  });

  const updatedPlans = [];

  // Sort by priority
  plans
    .filter((p) => !p.assignedFermenter)
    .sort((a, b) => getPriority(b) - getPriority(a))
    .forEach((plan) => {
      const duration = getDuration(plan.fermentationType);
      const desiredStart = plan.eventDueDate
        ? addDays(new Date(plan.eventDueDate), -duration)
        : new Date(plan.startDate || new Date());

      let bestFV = null;
      let bestStart = null;

      for (const fv of fermenters) {
        let tryDate = new Date(desiredStart);
        let conflict = true;

        while (conflict) {
          const tryEnd = addDays(tryDate, duration);
          conflict = fvBookings[fv.id].some((booking) =>
            dateRangesOverlap(tryDate, tryEnd, booking.start, booking.end)
          );

          if (!conflict) {
            bestFV = fv.id;
            bestStart = new Date(tryDate);
            break;
          }

          tryDate.setDate(tryDate.getDate() + 1);
        }

        if (bestFV) break; // Stop after first available FV found
      }

      if (bestFV && bestStart) {
        const endDate = addDays(bestStart, duration);

        fvBookings[bestFV].push({ start: bestStart, end: endDate });

        updatedPlans.push({
          ...plan,
          assignedFermenter: bestFV,
          startDate: bestStart.toISOString(),
          endDate: endDate.toISOString(),
        });
      }
    });

  return updatedPlans;
}
