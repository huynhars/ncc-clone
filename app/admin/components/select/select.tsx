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
