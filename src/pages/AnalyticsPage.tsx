import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { MonthNav } from '../components/MonthNav'
import { useStore } from '../hooks/useStore'
import { chartColor, expenseByCategory, monthlyExpense } from '../utils/aggregate'
import { currentMonth, monthOf } from '../utils/date'
import { yen } from '../utils/format'

export function AnalyticsPage() {
  const { transactions } = useStore()
  const [month, setMonth] = useState(currentMonth())

  const rows = useMemo(
    () => expenseByCategory(transactions.filter((t) => monthOf(t.date) === month)),
    [transactions, month],
  )
  const total = rows.reduce((s, r) => s + r.amount, 0)
  const trend = useMemo(
    () => monthlyExpense(transactions, month, 6).map((m) => ({ ...m, label: `${Number(m.month.slice(5))}月` })),
    [transactions, month],
  )

  return (
    <div className="page">
      <header className="large-title"><h1>分析</h1></header>
      <MonthNav month={month} onChange={setMonth} />

      <div className="card">
        <h2 className="card-title">カテゴリ別支出</h2>
        {rows.length === 0 ? (
          <p className="empty">この月の支出はありません</p>
        ) : (
          <>
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={rows} dataKey="amount" nameKey="category" innerRadius={62} outerRadius={100}
                    paddingAngle={rows.length > 1 ? 2 : 0} stroke="none" isAnimationActive={false}>
                    {rows.map((r, i) => <Cell key={r.category} fill={chartColor(i)} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <span>合計</span>
                <strong>{yen(total)}</strong>
              </div>
            </div>
            <ul className="legend">
              {rows.map((r, i) => (
                <li key={r.category}>
                  <span className="dot" style={{ background: chartColor(i) }} />
                  <span className="legend-name">{r.category}</span>
                  <span className="legend-pct">{(r.ratio * 100).toFixed(1)}%</span>
                  <span className="legend-amount">{yen(r.amount)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">月別支出の推移（直近6か月）</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-2)', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'var(--fill)' }}
              formatter={(v) => [yen(Number(v)), '支出']}
              labelFormatter={(_, p) => (p?.[0]?.payload?.month ? p[0].payload.month.replace('-', '年') + '月' : '')}
              contentStyle={{ background: 'var(--card)', border: 'none', borderRadius: 12, color: 'var(--text)' }}
            />
            <Bar dataKey="expense" radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {trend.map((m) => <Cell key={m.month} fill={m.month === month ? 'var(--blue)' : 'var(--fill-strong)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ul className="legend compact">
          {trend.map((m) => (
            <li key={m.month}>
              <span className="legend-name">{m.month.replace('-', '年')}月</span>
              <span className="legend-amount">{yen(m.expense)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
