import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

/**
 * Renders a chart card from agent-generated chart_data.
 * data shape: { tipo, titulo, labels, valores, cor_primaria, fonte }
 */
export default function AgentChart({ data, accentColor = '#C9A24F' }) {
  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.valores)) return null;
  const color = data.cor_primaria || accentColor;
  const series = data.labels.map((l, i) => ({ name: l, value: Number(data.valores[i]) || 0 }));
  const PIE_PALETTE = [color, '#C9A24F', '#8B5CF6', '#10B981', '#EC4899', '#1E3A8A', '#991B1B', '#F5C2D5'];

  const Chart = () => {
    const common = { data: series, margin: { top: 8, right: 12, left: 0, bottom: 0 } };
    if (data.tipo === 'line') {
      return (
        <LineChart {...common}>
          <CartesianGrid stroke="#E8E0CF" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#FBFAF6', border: '1px solid #E8E0CF', borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} />
        </LineChart>
      );
    }
    if (data.tipo === 'area') {
      return (
        <AreaChart {...common}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E8E0CF" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#FBFAF6', border: '1px solid #E8E0CF', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${color})`} strokeWidth={2} />
        </AreaChart>
      );
    }
    if (data.tipo === 'pie') {
      return (
        <PieChart>
          <Pie data={series} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={2}>
            {series.map((_, i) => (
              <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#FBFAF6', border: '1px solid #E8E0CF', borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      );
    }
    // default: bar
    return (
      <BarChart {...common}>
        <CartesianGrid stroke="#E8E0CF" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#FBFAF6', border: '1px solid #E8E0CF', borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    );
  };

  return (
    <div className="mx-4 mb-3 rounded-xl border border-border bg-[#FBFAF6] p-3">
      {data.titulo && <p className="text-xs font-semibold mb-2 text-foreground">{data.titulo}</p>}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Chart />
        </ResponsiveContainer>
      </div>
      {data.fonte && <p className="text-[10px] text-muted-foreground mt-1.5">Fonte: {data.fonte}</p>}
    </div>
  );
}