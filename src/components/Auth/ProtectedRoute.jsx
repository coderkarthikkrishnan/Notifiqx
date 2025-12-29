import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
    // If we're still loading auth state (user is undefined/null), we usually wait.
    // However, App.jsx currently passes null for unauth.
    // If the parent handles "loading", we can trust "user" here.

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
