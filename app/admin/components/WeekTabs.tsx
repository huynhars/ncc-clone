'use client';

export default function CheckInPunishments() {
  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        {/* Left */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Check in punishments
          </h3>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
            <Select label="Year" value="2026" />
            <Select label="Month" value="2" />

            <span className="text-blue-600">
              Click vào button Complain và nhập nội dung khiếu nại nếu bạn thấy
              không đúng.
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm text-gray-700">
          <div>
            <div>
              Tổng tiền phạt tháng:{' '}
              <span className="text-green-600 font-semibold">0 VND</span>
            </div>
            <div>
              Tổng tiền phạt còn lại:{' '}
              <span className="text-red-600 font-semibold">220,000 VND</span>
            </div>
          </div>

          <button className="bg-orange-600 text-white px-5 py-2 rounded shadow hover:bg-pink-700">
            Confirm
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Date
              </th>

              <th
                colSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Checking time
              </th>

              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Tracker Time
              </th>

              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Edited by
              </th>

              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Punishments
              </th>

              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Complain
              </th>

              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Complain Reply
              </th>

              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800"
              >
                Action
              </th>
            </tr>

            <tr>
              <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                Check in
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                Check out
              </th>
            </tr>
          </thead>

          <tbody>
            {/* demo empty row */}
            <tr>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
              <td className="border px-4 py-3 text-center">--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- helper ---------- */

function Select({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex items-center gap-1 text-gray-700">
      <span className="font-medium">{label}:</span>
      <select className="border rounded px-2 py-1 text-sm bg-white">
        <option>{value}</option>
      </select>
    </label>
  );
}

