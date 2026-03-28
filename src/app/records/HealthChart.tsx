'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type ChartData = {
  date: string
  weight: number | null
  food_amount: number | null
}

type Props = {
  data: ChartData[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function HealthChart({ data }: Props) {
  const chartData = data
    .map((r) => ({
      date: formatDate(r.date),
      体重: r.weight,
      食事量: r.food_amount,
    }))
    .reverse()

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DFC4A5" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#8B7355' }}
          tickLine={false}
          axisLine={{ stroke: '#DFC4A5' }}
        />
        <YAxis
          yAxisId="weight"
          orientation="left"
          domain={['auto', 'auto']}
          tick={{ fontSize: 12, fill: '#8B7355' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}kg`}
          width={52}
        />
        <YAxis
          yAxisId="food"
          orientation="right"
          domain={[50, 130]}
          ticks={[60, 70, 80, 90, 100, 110, 120]}
          tick={{ fontSize: 12, fill: '#8B7355' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}g`}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: '#FFFDF8',
            border: '1px solid #DFC4A5',
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(value, name) =>
            name === '体重' ? [`${value}kg`, '体重'] : [`${value}g`, '食事量']
          }
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 13, color: '#8B7355', paddingTop: 8 }}
        />
        <Bar
          yAxisId="food"
          dataKey="食事量"
          fill="#C49A6C"
          opacity={0.5}
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
        <Line
          yAxisId="weight"
          type="monotone"
          dataKey="体重"
          stroke="#7A4F2E"
          strokeWidth={2.5}
          dot={{ fill: '#7A4F2E', r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
