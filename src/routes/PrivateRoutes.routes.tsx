import React from 'react'
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../auth/useAuth";

interface PrivateRoutesProps {
    children: React.ReactNode;
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ children }) => {
    const { authMode, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (authMode === "demo") {
        return children;
    }

    if (isLoading) {
        return (
            <div className="loader-wrapper">
                <div className="dot-spinner">
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                    <div className="dot-spinner__dot"></div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const next = `${location.pathname}${location.search}${location.hash}`;
        return <Navigate replace to={`/auth?next=${encodeURIComponent(next)}`} />;
    }

    return children;
}

export default PrivateRoutes
