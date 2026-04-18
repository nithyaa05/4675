import type { AvailabilityBlock, DaySlot } from '../types'

export const AVAILABILITY_START_HOUR = 9
export const AVAILABILITY_END_HOUR = 21
export const WEEKLY_SLOT_COUNT =
  (AVAILABILITY_END_HOUR - AVAILABILITY_START_HOUR) * 2

export const DAYS_ORDER: DaySlot[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

export function createEmptyWeeklyAvailability(): Record<DaySlot, boolean[]> {
  return {
    mon: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
    tue: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
    wed: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
    thu: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
    fri: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
    sat: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
    sun: Array.from({ length: WEEKLY_SLOT_COUNT }, () => false),
  }
}

function cloneGrid(
  grid: Record<DaySlot, boolean[]>
): Record<DaySlot, boolean[]> {
  const out = createEmptyWeeklyAvailability()
  for (const d of DAYS_ORDER) {
    for (let i = 0; i < WEEKLY_SLOT_COUNT; i++) {
      out[d][i] = Boolean(grid[d]?.[i])
    }
  }
  return out
}

function isWeeklyGrid(x: unknown): x is Record<DaySlot, boolean[]> {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return DAYS_ORDER.every((d) => {
    const a = o[d]
    return (
      Array.isArray(a) &&
      a.length === WEEKLY_SLOT_COUNT &&
      a.every((v) => typeof v === 'boolean')
    )
  })
}

function blocksToGrid(blocks: AvailabilityBlock[]): Record<DaySlot, boolean[]> {
  const grid = createEmptyWeeklyAvailability()
  const slotIndex = (hour: number) => Math.round((hour - AVAILABILITY_START_HOUR) * 2)

  for (const b of blocks) {
    const start = slotIndex(b.startHour)
    const end = slotIndex(b.endHour)
    const lo = Math.max(0, Math.min(WEEKLY_SLOT_COUNT, Math.min(start, end)))
    const hi = Math.max(0, Math.min(WEEKLY_SLOT_COUNT, Math.max(start, end)))
    for (let s = lo; s < hi; s++) {
      grid[b.day][s] = true
    }
  }
  return grid
}

/**
 * Accepts API/localStorage payloads with `weeklyAvailability` or legacy `availability` blocks.
 */
export function normalizeWeeklyAvailability(input: {
  weeklyAvailability?: unknown
  availability?: unknown
}): Record<DaySlot, boolean[]> {
  if (input.weeklyAvailability && isWeeklyGrid(input.weeklyAvailability)) {
    return cloneGrid(input.weeklyAvailability)
  }
  if (Array.isArray(input.availability) && input.availability.length > 0) {
    const blocks = input.availability as AvailabilityBlock[]
    if (blocks.every((b) => b && typeof b.day === 'string')) {
      return blocksToGrid(blocks)
    }
  }
  return createEmptyWeeklyAvailability()
}

export function slotLabel(slotIndex: number): string {
  const totalMinutes = AVAILABILITY_START_HOUR * 60 + slotIndex * 30
  const h24 = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const ampm = h24 < 12 ? 'am' : 'pm'
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

export function countSelectedSlots(
  grid: Record<DaySlot, boolean[]>
): number {
  let n = 0
  for (const d of DAYS_ORDER) {
    for (let i = 0; i < WEEKLY_SLOT_COUNT; i++) {
      if (grid[d][i]) n++
    }
  }
  return n
}
