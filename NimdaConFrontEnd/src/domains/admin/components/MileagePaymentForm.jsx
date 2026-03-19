import React, { useState } from 'react';

const MileagePaymentForm = ({ onGrant }) => {
    const [studentId, setStudentId] = useState('');
    const [mileageAmount, setMileageAmount] = useState('');
    const [reason, setReason] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // 실제 데이터 연동 전 임시 데이터 (깃허브 올릴 땐 비워둡니다)
    const dummyUsers = []; // TODO: 추후 학번 검색 API 연동 필요

    const handleButtonClick = () => {
        if (!studentId || !mileageAmount) {
            alert('학번과 지급 마일리지를 입력해주세요.');
            return;
        }
        // 부모 컴포넌트로 데이터 전달
        onGrant({ studentId, mileageAmount, reason });
    };

    return (
        <div className="w-[874px] h-[520px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] relative mt-4 overflow-hidden">
            <div className="w-[797px] border-t border-black/20 absolute left-[18px] top-4"></div>

            <div className="absolute left-[16px] top-[108px] w-[807px] h-11 flex items-center gap-0">
                {/* 1. 학번 영역 */}
                <div className="flex items-center h-8">
                    <div className="w-12 h-6 flex items-center justify-center text-black text-base border border-stone-300 rounded-l-[3px] bg-gray-50 border-r-0">
                        학번
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-60 h-8 px-2 text-sm text-neutral-950 font-medium border border-stone-300 outline-none rounded-r-[3px]"
                            value={studentId}
                            onChange={(e) => {
                                setStudentId(e.target.value);
                                setShowDropdown(e.target.value.length >= 4);
                            }}
                            onFocus={() => studentId.length >= 4 && setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        />
                        {showDropdown && (
                            <div className="absolute left-0 top-[34px] w-36 bg-white border border-stone-100 shadow-md rounded-b-[3px] z-20">
                                {dummyUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex justify-between px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs"
                                        onClick={() => {
                                            setStudentId(user.id);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <span className="font-medium">{user.id}</span>
                                        <span className="text-right w-11">{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-6 shrink-0"></div>

                {/* 2. 지급 마일리지 영역 */}
                <div className="flex items-center h-8">
                    <div className="w-28 h-6 flex items-center justify-center text-black text-base border border-stone-300 rounded-l-[3px] bg-gray-50 border-r-0">
                        지급 마일리지
                    </div>
                    <input
                        type="number"
                        className="w-24 h-8 px-2 text-sm border border-stone-300 outline-none rounded-r-[3px]"
                        value={mileageAmount}
                        onChange={(e) => setMileageAmount(e.target.value)}
                    />
                </div>

                <div className="w-6 shrink-0"></div>

                {/* 3. 사유 영역 */}
                <div className="flex items-center h-8">
                    <div className="w-12 h-6 flex items-center justify-center text-black text-base border border-stone-300 rounded-l-[3px] bg-gray-50 border-r-0">
                        사유
                    </div>
                    <input
                        type="text"
                        className="w-56 h-8 px-2 text-sm border border-stone-300 outline-none rounded-r-[3px]"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
            </div>

            <button
                className="absolute left-[735px] top-[484px] w-20 h-9 bg-rose-400 rounded-lg text-white hover:bg-rose-500"
                onClick={handleButtonClick}
            >
                지급
            </button>
        </div>
    );
};

export default MileagePaymentForm;