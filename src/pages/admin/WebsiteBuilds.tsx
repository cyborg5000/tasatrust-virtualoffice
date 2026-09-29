import { useState } from 'react';

export default function AdminWebsiteBuilds() {
  const [builds] = useState([
    {
      id: 1,
      client: 'John Doe',
      projectName: 'E-commerce Store',
      status: 'In Development',
      progress: 65,
      startDate: '2026-01-15',
      deadline: '2026-03-15'
    },
    {
      id: 2,
      client: 'Jane Smith',
      projectName: 'Portfolio Website',
      status: 'Completed',
      progress: 100,
      startDate: '2025-12-01',
      deadline: '2026-01-15'
    },
    {
      id: 3,
      client: 'Bob Johnson',
      projectName: 'Corporate Site',
      status: 'Design Phase',
      progress: 30,
      startDate: '2026-02-01',
      deadline: '2026-04-01'
    },
    {
      id: 4,
      client: 'Alice Brown',
      projectName: 'Blog Platform',
      status: 'Testing',
      progress: 85,
      startDate: '2026-01-20',
      deadline: '2026-02-28'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Development':
        return 'bg-blue-100 text-blue-800';
      case 'Testing':
        return 'bg-purple-100 text-purple-800';
      case 'Design Phase':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Website Builds</h1>
          <p className="text-gray-600">Track and manage website development projects</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          New Project
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Total Projects</p>
          <p className="text-3xl font-bold">{builds.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">
            {builds.filter(b => b.status === 'In Development').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">
            {builds.filter(b => b.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Avg Progress</p>
          <p className="text-3xl font-bold text-purple-600">
            {Math.round(builds.reduce((acc, b) => acc + b.progress, 0) / builds.length)}%
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {builds.map((build) => (
          <div key={build.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{build.projectName}</h3>
                <p className="text-sm text-gray-600">Client: {build.client}</p>
              </div>
              <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(build.status)}`}>
                {build.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{build.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${build.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-semibold">{build.startDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Deadline</p>
                <p className="font-semibold">{build.deadline}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                View Details
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                Update Status
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
