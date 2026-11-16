import { formatTimeRange } from "@/lib/utils";

const sameVenue = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase() && a.trim() !== "";

/**
 * Checks a booking against existing ones on three levels:
 *  1. time: another event overlaps on the same date,
 *  2. venue: the same location is already in use in that slot,
 *  3. resources: catering teams and daily kitchen capacity from Settings.
 * Cancelled bookings never count.
 */
export function findConflicts(candidate, bookings, settings) {
  if (!candidate.eventDate || !candidate.startTime || !candidate.endTime) {
    return { overlapping: [], warnings: [] };
  }

  const sameDay = bookings.filter(
    (b) => b.id !== candidate.id && b.status !== "Cancelled" && b.eventDate === candidate.eventDate,
  );

  // "HH:mm" strings compare correctly as text.
  const overlapping = sameDay.filter(
    (b) => candidate.startTime < b.endTime && b.startTime < candidate.endTime,
  );

  const warnings = [];

  for (const b of overlapping) {
    const venue = sameVenue(b.location, candidate.location) ? " at the same venue" : "";
    warnings.push(
      `Overlaps with "${b.eventName}" (${formatTimeRange(b.startTime, b.endTime)})${venue}.`,
    );
  }

  if (overlapping.length > 0 && overlapping.length >= settings.cateringTeams) {
    warnings.push(
      `All ${settings.cateringTeams} catering team${settings.cateringTeams === 1 ? " is" : "s are"} already assigned in this time slot.`,
    );
  }

  const guestsThatDay =
    sameDay.reduce((sum, b) => sum + b.guestCount, 0) + (candidate.guestCount || 0);
  if (sameDay.length > 0 && guestsThatDay > settings.dailyGuestCapacity) {
    warnings.push(
      `Total guests on this day would be ${guestsThatDay}, above the daily kitchen capacity of ${settings.dailyGuestCapacity}.`,
    );
  }

  return { overlapping, warnings };
}
