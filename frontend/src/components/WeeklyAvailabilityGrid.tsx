import { useCallback, useEffect, useRef, useState } from 'react'
import type { DaySlot } from '../types'
import { DAYS_ORDER, WEEKLY_SLOT_COUNT, slotLabel } from '../lib/availability'

const DAY_LABEL: Record<DaySlot, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

type PaintState = { value: boolean }

type WeeklyAvailabilityGridProps = {
  value: Record<DaySlot, boolean[]>
  onChange: (next: Record<DaySlot, boolean[]>) => void
}

export function WeeklyAvailabilityGrid({
  value,
  onChange,
}: WeeklyAvailabilityGridProps) {
  const paintRef = useRef<PaintState | null>(null)
  const [, bump] = useState(0)
  const forceRender = useCallback(() => bump((n) => n + 1), [])

  const setSlot = useCallback(
    (day: DaySlot, slot: number, selected: boolean) => {
      if (value[day][slot] === selected) return
      const next = { ...value, [day]: [...value[day]] }
      next[day][slot] = selected
      onChange(next)
    },
    [value, onChange]
  )

  const onCellDown = (day: DaySlot, slot: number, e: React.MouseEvent) => {
    e.preventDefault()
    const nextVal = !value[day][slot]
    paintRef.current = { value: nextVal }
    setSlot(day, slot, nextVal)
  }

  const onCellEnter = (day: DaySlot, slot: number) => {
    const p = paintRef.current
    if (!p) return
    setSlot(day, slot, p.value)
  }

  useEffect(() => {
    const endPaint = () => {
      paintRef.current = null
      forceRender()
    }
    window.addEventListener('mouseup', endPaint)
    window.addEventListener('blur', endPaint)
    return () => {
      window.removeEventListener('mouseup', endPaint)
      window.removeEventListener('blur', endPaint)
    }
  }, [forceRender])

  const slotRows = Array.from({ length: WEEKLY_SLOT_COUNT }, (_, i) => i)

  return (
    <div className="availability-wrap">
      <p className="field-help availability-help">
        Only mark times you are <strong>free</strong>—leave other days and times
        blank. For example, Monday 2–4pm and Wednesday 10–11am only is fine.
        Click or drag to paint cells. Each column is one day; rows are 30-minute
        steps from <strong>9:00am–9:00pm</strong>.
      </p>
      <div
        className="availability-grid-scroll"
        role="region"
        aria-label="Weekly availability from 9am to 9pm"
      >
        <div className="availability-table">
          <div className="availability-table__head">
            <div className="availability-table__corner" aria-hidden />
            {DAYS_ORDER.map((d) => (
              <div key={d} className="availability-table__day">
                {DAY_LABEL[d]}
              </div>
            ))}
          </div>
          {slotRows.map((slot) => (
            <div key={slot} className="availability-table__row">
              <div className="availability-table__time">
                {slot % 2 === 0 ? slotLabel(slot) : ''}
              </div>
              {DAYS_ORDER.map((day) => {
                const on = value[day][slot]
                const endLabel =
                  slot < WEEKLY_SLOT_COUNT - 1
                    ? slotLabel(slot + 1)
                    : '9:00pm'
                return (
                  <button
                    key={`${day}-${slot}`}
                    type="button"
                    className={`availability-cell${on ? ' availability-cell--on' : ''}`}
                    aria-pressed={on}
                    aria-label={`${DAY_LABEL[day]}, ${slotLabel(slot)} to ${endLabel}, ${on ? 'available' : 'busy'}`}
                    onMouseDown={(e) => onCellDown(day, slot, e)}
                    onMouseEnter={() => onCellEnter(day, slot)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
