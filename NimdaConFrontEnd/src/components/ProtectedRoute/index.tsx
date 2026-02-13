import { Navigate } from 'react-router-dom';
import { isAdmin } from '@/utils/jwt';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    if (requireAdmin) {
        const token = localStorage.getItem('authToken');

        // 로그인하지 않은 경우 → 로그인 페이지로 리다이렉트
        if (!token) {
            return <Navigate to="/login" replace />;
        }

        // 로그인했지만 관리자 권한이 없는 경우 → 403 페이지로 리다이렉트
        if (!isAdmin()) {
            return <Navigate to="/403" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
