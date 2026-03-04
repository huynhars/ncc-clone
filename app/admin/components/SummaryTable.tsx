'use client';

import { useEffect, useState } from 'react';
import { previewApplyPunishmentAndGetSummary } from '@/src/lib/api';

export default function SummaryTable() {
  const now = new Date();

  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [status, setStatus] = useState<string>('Approved');

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();

  useEffect(() => {
    fetchSummary();
  }, [year, month, status]);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const res = await previewApplyPunishmentAndGetSummary({
        year,
        month,
      });

      setSummary(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SMALL COMPONENTS ================= */

  function Select({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: any;
    onChange: (v: any) => void;
    options: any[];
  }) {
    return (
      <label className="flex items-center gap-1 text-gray-700">
        <span className="font-medium">{label}:</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          {options.map((opt, index) => (
            <option key={index} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function StickyTh({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <th className=" left-0 z-10 border border-gray-200 bg-blue-200 px-4 py-2 text-gray-700 text-left w-8">
        {children}
      </th>
    );
  }

  function StickyTd({
    children,
    className = '',
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <td
        className={` left-0 z-10 border border-gray-200 bg-blue-100 px-4 py-5 text-center text-gray-700 ${className}`}
      >
        {children}
      </td>
    );
  }

  /* ================= HELPER ================= */

  function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }

    return years;
  }

  function generateMonthOptions() {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }


  return (
    <div className="bg-white rounded shadow">
      {/* HEADER */}
      <div className="flex items-center px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Summary</h3>

        <div className="flex items-center gap-8 text-sm px-4">
          <Select
            label="Year"
            value={year}
            onChange={(v) => setYear(Number(v))}
            options={generateYearOptions()}
          />

          <Select
            label="Month"
            value={month}
            onChange={(v) => setMonth(Number(v))}
            options={generateMonthOptions()}
          />

          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(v)}
            options={['Approved', 'Pending', 'Rejected']}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="border-collapse min-w-max w-full">
          <thead>
            <tr>
              <StickyTh>Total</StickyTh>
              <StickyTh>Open Talk</StickyTh>

              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(year, month - 1, i + 1);
                const isWeekend =
                  date.getDay() === 0 || date.getDay() === 6;

                return (
                  <th
                    key={i}
                    className={`border border-gray-200 bg-blue-200 px-3 py-2 text-center ${isWeekend
                        ? 'text-red-500'
                        : 'text-gray-700'
                      }`}
                  >
                    <div className="text-sm font-semibold">
                      {i + 1}
                    </div>
                    <div className="text-xs">
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                      })}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            <tr>
              <StickyTd className="font-semibold">
                {summary?.total ?? 0}
              </StickyTd>

              <StickyTd>
                {summary?.openTalk ?? 0}
              </StickyTd>

              {Array.from({ length: daysInMonth }).map(
                (_, index) => (
                  <td
                    key={index}
                    className="border border-gray-200 px-3 py-5 text-center text-gray-600 bg-white"
                  >
                    {summary?.dailyData?.[index] ?? '--'}
                  </td>
                )
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="p-3 text-center text-sm text-gray-500">
          Loading...
        </div>
      )}
    </div>
  );
}


