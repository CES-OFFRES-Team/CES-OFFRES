import React from 'react';
import Navigation from './components/navigation';

export default function AdminLayout({ children }) {
    return (
        <div className="admin-page">
            <Navigation />
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
}

