import { useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useStore } from '../hooks/useStore'
import { monthlySummaries } from '../utils/aggregate'
import { currentMonth, monthLabel } from '../utils/date'
import { yen } from '../utils/format'

const INCOME = 'var(--green)'
const EXPENSE = 'var(--red)'
const MONTHS = 12

/** 縦軸の短縮表記（万円） */
const axisYen = (v: number) => (v === 0 ? '0' : Math.abs(v) >= 10000 ? `${Math.round(v / 1000) / 10}万` : String(v))

export function MonthlyCharts() {
  const { transactions } = useStore()
  const end = currentMonth()
  const [selected, setSelected] = useState(end)
  const data = useMemo(
    () => monthlySummaries(transactions, end, MONTHS).map((m) => ({ ...m, label: String(Number(m.month.slice(5))) })),
    [transactions, end],
  )
  const sel = data.find((d) => d.month === selected) ?? data[data.length - 1]

  // グラフをタップした位置の月を選択
  const pick = (state: { activeTooltipIndex?: number | string | null }) => {
    const i = Number(state?.activeTooltipIndex)
    if (Number.isInteger(i) && data[i]) setSelected(data[i].month)
  }
  const common = { data, margin: { top: 8, right: 4, left: 0, bottom: 0 }, onClick: pick }
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--sep)" />
      <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0}
        tick={{ fill: 'var(--text-2)', fontSize: 11 }} />
      <YAxis width={40} axisLine={false} tickLine={false} tickFormatter={axisYen}
        tick={{ fill: 'var(--text-2)', fontSize: 11 }} />
      <Tooltip content={() => null} cursor={{ stroke: 'var(--fill-strong)', fill: 'var(--fill)' }} />
    </>
  )

  return (
    <>
      <div className="card">
        <h2 className="card-title">月別の収入・支出（直近12か月）</h2>
        <Legend />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart {...common} barGap={1} barCategoryGap="18%">
            {axes}
            <Bar dataKey="income" fill={INCOME} radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.month} fillOpacity={d.month === sel.month ? 1 : 0.45} />)}
            </Bar>
            <Bar dataKey="expense" fill={EXPENSE} radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.month} fillOpacity={d.month === sel.month ? 1 : 0.45} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="chart-note">横軸は月（数字）。棒をタップするとその月の合計が表示されます。</p>
      </div>

      <div className="card">
        <h2 className="card-title">収支の推移（直近12か月）</h2>
        <Legend />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart {...common}>
            {axes}
            <Line type="linear" dataKey="income" stroke={INCOME} strokeWidth={2.5} isAnimationActive={false}
              dot={{ r: 3, strokeWidth: 0, fill: INCOME }} activeDot={{ r: 5 }} />
            <Line type="linear" dataKey="expense" stroke={EXPENSE} strokeWidth={2.5} isAnimationActive={false}
              dot={{ r: 3, strokeWidth: 0, fill: EXPENSE }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="sel-head">
          <h2 className="card-title">{monthLabel(sel.month)}の収支</h2>
          <label className="select mini">
            <select value={sel.month} onChange={(e) => setSelected(e.target.value)} aria-label="月を選択">
              {[...data].reverse().map((d) => <option key={d.month} value={d.month}>{monthLabel(d.month)}</option>)}
            </select>
          </label>
        </div>
        <ul className="legend">
          <li><span className="legend-name">収入合計</span><span className="legend-amount income">{yen(sel.income)}</span></li>
          <li><span className="legend-name">支出合計</span><span className="legend-amount expense-red">{yen(sel.expense)}</span></li>
          <li>
            <span className="legend-name">収支（収入－支出）</span>
            <span className={`legend-amount ${sel.balance < 0 ? 'expense-red' : ''}`}>{yen(sel.balance)}</span>
          </li>
        </ul>
      </div>
    </>
  )
}

function Legend() {
  return (
    <div className="chart-legend">
      <span><i style={{ background: INCOME }} />収入</span>
      <span><i style={{ background: EXPENSE }} />支出</span>
    </div>
  )
}
