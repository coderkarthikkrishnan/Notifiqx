import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children, user }) => {
    const location = useLocation();
    const hideNavbarRoutes = ['/login'];

    const showNavbar = user &&
        !hideNavbarRoutes.includes(location.pathname) &&
        ['viewer', 'admin', 'super_admin'].includes(user.role);

    return (
        <>
            {showNavbar && <Navbar user={user} />}
            {children}
        </>
    );
};

export default Layout;
