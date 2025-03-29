'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function AuthNav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = Cookies.get('authToken');
        const userDataStr = Cookies.get('userData');
        
        if (token && userDataStr) {
            setIsLoggedIn(true);
            setUserData(JSON.parse(userDataStr));
        }
    }, []);

    return (
        <li className="nav-item">
            {isLoggedIn ? (
                <a href="/dashboard" className="nav-link account-btn">
                    <span className="material-symbols-rounded">person</span>
                    <span className="nav-label">Mon Compte</span>
                </a>
            ) : (
                <a href="/Login" className="nav-link login-btn">
                    <span className="material-symbols-rounded">login</span>
                    <span className="nav-label">Connexion</span>
                </a>
            )}
        </li>
    );
} 