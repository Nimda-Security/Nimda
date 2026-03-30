import React, { useState, useEffect } from 'react';
import { getPointDetailsAPI } from '@/api/point';
import type { PointHistoryItem } from '@/api/point';

interface PointContentProps {
  loading?: boolean;
  userBalance: number;
}

const PointContent: React.FC<PointContentProps> = ({
  loading: initialLoading,
  userBalance,
}) => {
  const [transactions, setTransactions] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(initialLoading || false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const data = await getPointDetailsAPI();
        setTransactions(data);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'earn') return item.amount > 0;
    if (activeFilter === 'use') return item.amount < 0;
    if (activeFilter === 'expire') return item.type === 'expire';
    return true;
  });

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const getRecordIcon = (type: string) => {
    const isExpire = type === 'expire';
    return (
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${isExpire ? 'bg-[#D4D4D4]' : 'bg-[#D97399]'}`}
      ></div>
    );
  };

  return (
    <div className="w-full flex flex-col font-['Pretendard'] antialiased">
      <div
        style={{
          width: '100%',
          borderRadius: '4px',
          border: '1px solid #D4D4D4',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 0 48px 0',
        }}
      >
        {/* 마일리지 정보 + 버튼 */}
        <div
          style={{
            paddingTop: '32px',
            paddingLeft: '32px',
            paddingRight: '24px',
          }}
        >
          <div className="flex gap-20">
            <div>
              <p className="text-[14px] font-medium leading-[150%] text-[#D97399] mb-1 tracking-tight">
                보유 마일리지
              </p>
              <div className="flex items-baseline" style={{ columnGap: '4px' }}>
                <span className="text-[24px] font-bold leading-[120%] text-[#0C0C0C] tracking-[-0.03em]">
                  {userBalance.toLocaleString()}
                </span>
                <span className="text-[16px] font-medium leading-[150%] text-[#0C0C0C] tracking-tight">
                  NC
                </span>
              </div>
            </div>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2" style={{ marginTop: '32px' }}>
            {[
              { key: 'all', label: '전체' },
              { key: 'earn', label: '적립' },
              { key: 'use', label: '사용' },
              { key: 'expire', label: '만료' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`text-[14px] font-[600] leading-[150%] text-center transition-all flex items-center justify-center ${
                  activeFilter === f.key ? 'text-[#F5F5F5]' : 'border-[1.5px] border-[#D97399] text-[#D97399]'
                }`}
                style={{
                  width: '49px',
                  height: '28px',
                  borderRadius: '8px',
                  background: activeFilter === f.key ? '#D97399' : 'transparent',
                  border: activeFilter === f.key ? '1px solid #D97399' : '1.5px solid #D97399',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 거래 내역 리스트 - 스크롤 적용 */}
        <div
          style={{
            paddingLeft: '24px',
            paddingRight: '24px',
            marginTop: '24px',
            maxHeight: '576px',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-10 text-[#A3A3A3] text-[14px]">
              거래 내역을 불러오는 중입니다...
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="flex flex-col">
              {filteredTransactions.map((record, index) => (
                <div
                  key={record.id || index}
                  style={{
                    width: '100%',
                    height: '72px',
                    flexShrink: 0,
                    borderTop: '1px solid #D4D4D4',
                    borderBottom:
                      index === filteredTransactions.length - 1
                        ? '1px solid #D4D4D4'
                        : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                  }}
                >
                  <div className="flex-shrink-0">
                    {getRecordIcon(record.type || 'earn')}
                  </div>

                  <div className="flex-grow">
                    <p className="text-[14px] font-[500] leading-[150%] text-[#000] flex items-center">
                      {(() => {
                        const match = record.description?.match(/^(.+?)(\d+)$/);
                        if (match) {
                          return (
                            <>
                              <span style={{ marginRight: '5px' }}>{match[1]}</span>
                              <span>{match[2]}</span>
                            </>
                          );
                        }
                        return record.description;
                      })()}
                    </p>
                    <p className="text-[12px] font-normal text-[#A3A3A3] leading-[150%] mt-0.5">
                      {record.date}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <p
                      className={`text-[20px] font-bold leading-[150%] ${
                        record.amount > 0 ? 'text-[#D97399]' : 'text-[#0C0C0C]'
                      }`}
                    >
                      {record.amount > 0
                        ? `+${record.amount.toLocaleString()}`
                        : record.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-10 text-[#A3A3A3]">
              <p className="text-[14px] font-medium">거래 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointContent;