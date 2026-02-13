import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
                <h2 className="text-2xl font-medium text-gray-700 mb-2">접근 권한이 없습니다</h2>
                <p className="text-gray-500 mb-8">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
                <div className="space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        이전 페이지
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                    >
                        홈으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForbiddenPage;
