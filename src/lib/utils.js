export const formatDate = (timestamp) => {
    if (!timestamp) return 'Date unknown';
    // Handle Firestore Timestamp or ISO string
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High': return '#ef4444';
        case 'Medium': return '#f59e0b';
        case 'Low': return '#22c55e';
        default: return '#6b7280';
    }
};
