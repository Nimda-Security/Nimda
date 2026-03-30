import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '@/utils/jwt';
import { validateSession } from '@/api/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {
        // 쿠키가 실제 인증 수단이므로 항상 서버에 검증
        validateSession().then((ok) => {
            setValid(ok);
            setChecking(false);
        });
    }, []);

    if (checking) return null; // 검증 중에는 아무것도 렌더링하지 않음

    if (!valid) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
