import { useState } from 'react';
import NoticeFeed from '../components/NoticeFeed';
import {
    MagnifyingGlass,
    House,
    BookmarkSimple,
    Fire,
    Ticket,
    CalendarCheck,
    Briefcase,
    Tag
} from 'phosphor-react';
import './ViewerDashboard.css';

const ViewerDashboard = ({ user }) => {
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

    return (
        <div className="viewer-container">
            {/* 1. Header */}
            <header className="viewer-header">
                <div className="header-titles">
                    <h1>Notice Board</h1>
                    <p className="header-subtitle">View your college notices and announcements.</p>
                </div>
            </header>

            {/* 2. Controls: Search */}
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
                    category={selectedCategory === 'Saved' ? 'All' : selectedCategory} // Pass All for Saved for now or let Feed handle it
                    searchTerm={searchTerm}
                />
            </main>
        </div>
    );
};

export default ViewerDashboard;
