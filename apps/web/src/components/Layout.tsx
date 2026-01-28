import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './Navbar';
import { UserRegistrationModal } from './UserRegistrationModal';

export function Layout() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-dark-900 text-dark-50 font-sans selection:bg-primary-500/30">
            {!user && <UserRegistrationModal onRegister={setUser} />}
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                }}
            />
        </div>
    );
}
