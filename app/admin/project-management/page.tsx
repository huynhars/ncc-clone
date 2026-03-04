'use client';

import { useEffect, useState } from 'react';
import { getQuantityProject, getAllProjects, getProjectById, inactiveProject } from '@/src/lib/api';
import { ProjectDto, } from '@/src/lib/type';
import { Search, Plus, ChevronDown, Pencil, Eye, X, Trash2 } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import ProjectTimesheetModal from './ProjectTimesheetModal';
import ConfirmDeactivateModal from './ConfirmDeactivateModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { toast } from "sonner";



export default function ProjectManagementPage() {
    const [quantity, setQuantity] = useState<number>(0);
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | null>(0);
    const [openFilter, setOpenFilter] = useState(false);
    const [activeCount, setActiveCount] = useState(0);
    const [deactiveCount, setDeactiveCount] = useState(0);
    const [allCount, setAllCount] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);
    const [openView, setOpenView] = useState(false);
    const [viewProjectId, setViewProjectId] = useState<number | null>(null);
    const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
    const [projectToDeactivate, setProjectToDeactivate] = useState<ProjectDto | null>(null);
    const [deactivating, setDeactivating] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<ProjectDto | null>(null);





    useEffect(() => {
        loadData();
    }, [statusFilter, search]);

    // Trong ProjectManagementPage.tsx

    // Định nghĩa enum status
    const ProjectStatus = {
        ACTIVE: 0,    // hoặc 1 tùy theo API
        DEACTIVE: 1,  // hoặc 0 tùy theo API
        ALL: null
    } as const;

    const loadCounts = async () => {
        try {
            // Gọi API để lấy tất cả projects, sau đó filter ở client
            const allProjects = await getAllProjects();

            // Filter dựa trên status field của project
            const active = allProjects.filter(p => p.status === 1); // Giả sử status = 1 là Active
            const deactive = allProjects.filter(p => p.status === 0); // Giả sử status = 0 là Deactive

            setActiveCount(active.length);
            setDeactiveCount(deactive.length);
            setAllCount(allProjects.length);
        } catch (error) {
            console.error("Failed to load counts:", error);
        }
    };

    // Sửa lại loadData
    const loadData = async () => {
        try {
            // Lấy tất cả projects
            let projectData = await getAllProjects({
                search: search || undefined,
            });

            // Filter theo status ở client nếu API không hỗ trợ filter status
            if (statusFilter !== null) {
                projectData = projectData.filter(p => p.status === statusFilter);
            }

            setProjects(projectData);
            setQuantity(projectData.length);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load projects");
        }
    };

    // Search
    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group theo customerName
    const groupedProjects = Object.values(
        filteredProjects.reduce((acc: any, project) => {
            if (!acc[project.customerName]) {
                acc[project.customerName] = {
                    customerName: project.customerName,
                    projects: [],
                };
            }
            acc[project.customerName].projects.push(project);
            return acc;
        }, {})
    );

    const handleSuccess = () => {
        // Reload data after successful save
        loadData();
        loadCounts();
    };



    return (
        <>
            <div className="p-8 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-semibold mb-6 text-gray-950">
                    Manage Projects
                </h1>

                {/* Top */}
                <div className="flex items-center gap-6 mb-6">
                    <button
                        onClick={() => {
                            setSelectedProject(null);
                            setOpenModal(true);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded shadow flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Project
                    </button>

                    <div className="relative">
                        <div
                            onClick={() => setOpenFilter(!openFilter)}
                            className="bg-white border rounded px-4 py-3 flex items-center gap-2 min-w-[120px] ml-20 shadow-sm cursor-pointer hover:border-gray-900"
                        >
                            <span className="text-gray-700">
                                {statusFilter === 0 && `Active Projects (${quantity})`}
                                {statusFilter === 1 && `Deactive Projects (${quantity})`}
                                {statusFilter === null && `All Projects (${quantity})`}
                            </span>
                            <ChevronDown size={16} className='text-gray-700' />
                        </div>

                        {openFilter && (
                            <div className="absolute mt-2 w-full bg-white rounded shadow-lg border z-10 ml-20">
                                <div
                                    onClick={() => {
                                        setStatusFilter(0);
                                        setOpenFilter(false);
                                    }}
                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                                >
                                    Active Projects ({activeCount})
                                </div>
                                <div
                                    onClick={() => {
                                        setStatusFilter(1);
                                        setOpenFilter(false);
                                    }}
                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                                >
                                    Deactive Projects ({deactiveCount})
                                </div>
                                <div
                                    onClick={() => {
                                        setStatusFilter(null);
                                        setOpenFilter(false);
                                    }}
                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                                >
                                    All Projects ({allCount})
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                        />
                        <input
                            type="text"
                            placeholder="Search by client or project name"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border rounded py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-700"
                        />
                    </div>
                </div>

                {/* LIST */}
                <div className="bg-white rounded shadow overflow-hidden">
                    {groupedProjects.map((group: any) => (
                        <div key={group.customerName}>
                            {/* Customer Header */}
                            <div className="bg-gray-200 px-6 py-3 font-semibold text-gray-700">
                                {group.customerName}
                            </div>

                            {group.projects.map((project: ProjectDto) => (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between px-6 py-5 border-b hover:bg-gray-50"
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Project Name */}
                                        <div className="text-gray-800 font-medium">
                                            {project.name} [{project.code}]
                                        </div>

                                        {/* Badges */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* PMS */}
                                            {project.pms?.length > 0 && (
                                                <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                                    {project.pms.join(', ')}
                                                </span>
                                            )}

                                            {/* Members */}
                                            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                                                {project.activeMember} members
                                            </span>

                                            {/* FF */}
                                            {project.projectType === 1 && (
                                                <span className="bg-orange-400 text-white text-xs px-2 py-1 rounded-full">
                                                    FF
                                                </span>
                                            )}

                                            {/* Date */}
                                            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                                                {formatDate(project.timeStart)}
                                                {project.timeEnd &&
                                                    ` - ${formatDate(project.timeEnd)}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="relative inline-block">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenActionId(
                                                    openActionId === project.id ? null : project.id
                                                );
                                            }}
                                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border px-4 py-2 rounded shadow-sm flex items-center gap-2"
                                        >
                                            Actions
                                            <ChevronDown size={14} />
                                        </button>

                                        {openActionId === project.id && (
                                            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                                                <button
                                                    onClick={async () => {
                                                        const detail = await getProjectById(project.id);
                                                        setOpenModal(true);
                                                        setSelectedProject(detail);
                                                        setOpenActionId(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 w-full text-left"
                                                >

                                                    <Pencil size={16} />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setViewProjectId(project.id);
                                                        setOpenView(true);
                                                        setOpenActionId(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 w-full text-left"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setProjectToDeactivate(project);
                                                        setOpenDeactivateModal(true);
                                                        setOpenActionId(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 w-full text-left"
                                                >
                                                    <X size={16} />
                                                    Deactive
                                                </button>



                                                <button
                                                    onClick={() => {
                                                        setProjectToDelete(project);
                                                        setOpenDeleteModal(true);
                                                        setOpenActionId(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-red-600 w-full text-left"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>

                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <CreateProjectModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
                onSuccess={handleSuccess}
            />

            <ProjectTimesheetModal
                open={openView}
                projectId={viewProjectId}
                onClose={() => {
                    setOpenView(false);
                    setViewProjectId(null);
                }}
            />

            <ConfirmDeactivateModal
                open={openDeactivateModal}
                projectName={projectToDeactivate?.name}
                onClose={() => {
                    setOpenDeactivateModal(false);
                    setProjectToDeactivate(null);
                }}
                onConfirm={async () => {
                    if (!projectToDeactivate) return;

                    try {
                        await inactiveProject(projectToDeactivate.id);

                        toast.success("Project deactivated successfully"); // 👈 thêm dòng này

                        await loadData();
                        await loadCounts();

                    } catch (error) {
                        console.error("Inactive failed:", error);
                        toast.error("Deactivate failed");
                    }

                    setOpenDeactivateModal(false);
                    setProjectToDeactivate(null);
                }}

            />



        </>
    );
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}