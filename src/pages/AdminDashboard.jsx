import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNotice from '../components/CreateNotice';
import NoticeFeed from '../components/NoticeFeed';
import {
    Plus,
    MagnifyingGlass,
    House,
    BookmarkSimple,
    Fire,
    Ticket,
    CalendarCheck,
    Briefcase,
    Tag
} from 'phosphor-react';
import './AdminDashboard.css';

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null); // Added for Edit
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filters = [
        { id: 'All', label: 'Home', icon: House },
        { id: 'Urgent', label: 'Urgent', icon: Fire },
        { id: 'Exam', label: 'Exams', icon: Ticket },
        { id: 'Event', label: 'Events', icon: CalendarCheck },
        { id: 'Placement', label: 'Placements', icon: Briefcase },
        { id: 'General', label: 'General', icon: Tag },
        { id: 'Saved', label: 'Saved Notices', icon: BookmarkSimple }
    ];

    const handleEdit = (notice) => {
        setEditingNotice(notice);
        setCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setEditingNotice(null);
    };

    return (
        <div className="admin-container">
            {/* 1. Header */}
            <header className="admin-header">
                <div className="header-titles">
                    <h1>Admin Dashboard</h1>
                    <p className="header-subtitle">Manage college notices and announcements.</p>
                </div>
            </header>

            {/* 2. Controls: Search + Create Button */}
            <div className="dashboard-controls">
                <div className="search-wrapper">
                    <MagnifyingGlass size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search notices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="btn-create-subtle" onClick={() => setCreateModalOpen(true)}>
                    <Plus size={16} weight="bold" />
                    Create
                </button>
            </div>

            {/* 3. Filter Pills */}
            <div className="filters-row">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        className={`filter-pill filter-${filter.id.toLowerCase()} ${selectedCategory === filter.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(filter.id)}
                    >
                        <filter.icon size={16} weight={selectedCategory === filter.id ? 'fill' : 'regular'} />
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* 4. Notices Feed */}
            <main className="feed-container">
                <NoticeFeed
                    user={user}
                    category={selectedCategory}
                    searchTerm={searchTerm}
                    onEdit={handleEdit}
                />
            </main>

            {createModalOpen && (
                <CreateNotice
                    user={user}
                    initialData={editingNotice} // Pass editing data
                    onClose={handleCloseModal}
                    onSuccess={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
