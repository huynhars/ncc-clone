'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { getAllTasks } from '@/src/lib/api';
import { TaskDto } from '@/src/lib/type';

export default function TaskPage() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

 const commonTasks = filteredTasks.filter(t => t.type === 0);
const otherTasks = filteredTasks.filter(t => t.type !== 0);

  return (
    <div className="p-8 bg-white min-h-screen">

      <h1 className="text-2xl font-semibold mb-4 text-black">
        Manage Tasks
      </h1>

      <div className="flex justify-between items-center mb-6">
        <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md shadow">
          <Plus size={18} />
          New Task
        </button>

        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by task name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full text-gray-700"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500 ">
          Loading tasks...
        </div>
      )}

      {!loading && (
        <>
          {/* ================= COMMON TASK ================= */}
          <div className="mb-8">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-700">
                Common Task ({commonTasks.length})
              </h2>
              <p className="text-sm text-gray-700">
                These tasks are automatically added to all new projects
              </p>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-gray-700">Name</th>
                  <th className="p-4 text-right text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {commonTasks.map(task => (
                  <tr key={task.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-gray-700">{task.name}</td>
                    <td className="p-4 text-right text-gray-700">
                      <button className="px-4 py-1 bg-gray-200 rounded text-gray-700">
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= OTHER TASK ================= */}
          <div>
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-700">
                Other Task ({otherTasks.length})
              </h2>
              <p className="text-sm text-gray-500">
                These tasks must be manually added to projects
              </p>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {otherTasks.map(task => (
                  <tr key={task.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{task.name}</td>
                    <td className="p-4 text-right">
                      <button className="px-4 py-1 bg-red-500 text-white rounded">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
