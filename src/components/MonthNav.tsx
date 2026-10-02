import { monthLabel, shiftMonth } from '../utils/date'
import { ChevronLeft, ChevronRight } from './Icons'

export function MonthNav({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <div className="month-nav">
      <button onClick={() => onChange(shiftMonth(month, -1))} aria-label="前の月"><ChevronLeft /></button>
      <strong>{monthLabel(month)}</strong>
      <button onClick={() => onChange(shiftMonth(month, 1))} aria-label="次の月"><ChevronRight /></button>
    </div>
  )
}
