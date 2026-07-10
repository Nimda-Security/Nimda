import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateSession, type SessionValidation } from '@/api/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const location = useLocation();
    const [session, setSession] = useState<SessionValidation | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let mounted = true;

        void validateSession().then((result) => {
            if (mounted) {
                setSession(result);
            }
        });

        return () => {
            mounted = false;
        };
    }, [retryCount]);

    if (!session) return null;

    if (session.status === 'unavailable') {
        return (
            <main role="alert">
                <p>세션을 확인할 수 없습니다. 네트워크 연결을 확인한 후 다시 시도해주세요.</p>
                <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
                    다시 시도
                </button>
            </main>
        );
    }

    if (session.status === 'unauthenticated') {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}${location.hash}` }}
            />
        );
    }

    if (requireAdmin && !session.roles.includes('ROLE_ADMIN')) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
