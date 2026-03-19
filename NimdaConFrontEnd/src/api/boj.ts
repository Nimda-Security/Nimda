// solved.ac API를 활용한 BOJ(백준) 사용자 정보 조회
// 참고: https://solvedac.github.io/unofficial-documentation/#/

const SOLVEDAC_API_BASE = '/solvedac-api/v3';

/**
 * Note. Solved.ac 등급 번호를 한글로 변경
 * 0: Unrated, 1~5: Bronze V~I, 6~10: Silver V~I,
 * 11~15: Gold V~I, 16~20: Platinum V~I,
 * 21~25: Diamond V~I, 26~30: Ruby V~I, 31: Master
 */
const TIER_NAMES: Record<number, string> = {
    0: 'Unrated',
    1: 'Bronze V', 2: 'Bronze IV', 3: 'Bronze III', 4: 'Bronze II', 5: 'Bronze I',
    6: 'Silver V', 7: 'Silver IV', 8: 'Silver III', 9: 'Silver II', 10: 'Silver I',
    11: 'Gold V', 12: 'Gold IV', 13: 'Gold III', 14: 'Gold II', 15: 'Gold I',
    16: 'Platinum V', 17: 'Platinum IV', 18: 'Platinum III', 19: 'Platinum II', 20: 'Platinum I',
    21: 'Diamond V', 22: 'Diamond IV', 23: 'Diamond III', 24: 'Diamond II', 25: 'Diamond I',
    26: 'Ruby V', 27: 'Ruby IV', 28: 'Ruby III', 29: 'Ruby II', 30: 'Ruby I',
    31: 'Master',
};

/**
 * 티어 번호 → 등급명 변환
 */
export const getTierName = (tier: number): string => {
    return TIER_NAMES[tier] ?? 'Unknown';
};

/**
 * solved.ac 유저 프로필 응답 타입 (필요한 필드만)
 */
export interface SolvedacUser {
    handle: string;
    bio: string;
    tier: number;
    rating: number;
    solvedCount: number;
    rank: number;
    maxStreak: number;
    profileImageUrl: string | null;
    class: number;
    classDecoration: string;
}

/**
 * 잔디(grass) 데이터 항목 타입
 */
export interface GrassEntry {
    date: string;
    value: number | string; // 숫자(풀이 수) 또는 "frozen", "repaired-incremented" 등
}

/**
 * 잔디 응답 타입
 */
export interface GrassResponse {
    grass: GrassEntry[];
}

/**
 * BOJ 유저 정보 (가공된 결과)
 */
export interface BojUserInfo {
    handle: string;
    tier: number;
    tierName: string;
    rating: number;
    solvedCount: number;
    rank: number;
    maxStreak: number;
    todaySolved: number;
    profileImageUrl: string | null;
    profileUrl: string;
    class: number;
}

/**
 * solved.ac 유저 프로필 조회
 * GET /api/v3/user/show?handle={handle}
 */
export const getSolvedacUser = async (handle: string): Promise<SolvedacUser | null> => {
    try {
        const response = await fetch(`${SOLVEDAC_API_BASE}/user/show?handle=${handle}`);

        if (!response.ok) {
            console.error(`solved.ac 유저 조회 실패 (${response.status})`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('solved.ac 유저 조회 API 오류:', error);
        return null;
    }
};

/**
 * solved.ac 잔디(grass) 데이터 조회
 * GET /api/v3/user/grass?handle={handle}&topic=default
 */
export const getSolvedacGrass = async (handle: string): Promise<GrassResponse | null> => {
    try {
        const response = await fetch(`${SOLVEDAC_API_BASE}/user/grass?handle=${handle}&topic=default`);

        if (!response.ok) {
            console.error(`solved.ac 잔디 조회 실패 (${response.status})`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('solved.ac 잔디 조회 API 오류:', error);
        return null;
    }
};

/**
 * 오늘 날짜의 풀이 수를 잔디 데이터에서 추출 (내부 함수)
 */
const extractTodaySolvedCount = (grass: GrassEntry[]): number => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const todayEntry = grass.find((entry) => entry.date === today);

    if (!todayEntry) return 0;

    // value가 숫자가 아닌 경우 (frozen, repaired-incremented 등) 0 반환
    if (typeof todayEntry.value !== 'number') return 0;

    return todayEntry.value;
};

/**
 * 오늘 푼 문제 수만 조회 (잔디 API만 호출)
 * GET /api/v3/user/grass?handle={handle}&topic=default
 *
 * @param handle - solved.ac 핸들
 * @returns 오늘 푼 문제 수 (없으면 0)
 */
export const getTodaySolvedCount = async (handle: string): Promise<number> => {
    try {
        const grassData = await getSolvedacGrass(handle);
        if (!grassData) return 0;
        return extractTodaySolvedCount(grassData.grass);
    } catch (error) {
        console.error('오늘 푼 문제 수 조회 오류:', error);
        return 0;
    }
};

/**
 * 유저 등급만 조회 (user/show API만 호출)
 * GET /api/v3/user/show?handle={handle}
 *
 * @param handle - solved.ac 핸들
 * @returns 등급 정보 { tier: number, tierName: string } 또는 null
 */
export const getUserTier = async (handle: string): Promise<{ tier: number; tierName: string } | null> => {
    try {
        const user = await getSolvedacUser(handle);
        if (!user) return null;
        return {
            tier: user.tier,
            tierName: getTierName(user.tier),
        };
    } catch (error) {
        console.error('유저 등급 조회 오류:', error);
        return null;
    }
};

/**
 * BOJ 유저 정보 통합 조회 (프로필 + 오늘 푼 문제 수)
 *
 * @param handle - solved.ac 핸들 (예: "nov2pro")
 * @returns 유저 랭크(등급), 오늘 푼 문제 수 등 통합 정보
 */
export const getBojUserInfo = async (handle: string): Promise<BojUserInfo | null> => {
    try {
        // 유저 프로필과 잔디 데이터를 병렬로 조회
        const [user, grassData] = await Promise.all([
            getSolvedacUser(handle),
            getSolvedacGrass(handle),
        ]);

        if (!user) {
            console.error(`유저 "${handle}"을 찾을 수 없습니다.`);
            return null;
        }

        // 오늘 푼 문제 수 계산
        const todaySolved = grassData ? extractTodaySolvedCount(grassData.grass) : 0;

        return {
            handle: user.handle,
            tier: user.tier,
            tierName: getTierName(user.tier),
            rating: user.rating,
            solvedCount: user.solvedCount,
            rank: user.rank,
            maxStreak: user.maxStreak,
            todaySolved,
            profileImageUrl: user.profileImageUrl,
            profileUrl: `https://solved.ac/profile/${user.handle}`,
            class: user.class,
        };
    } catch (error) {
        console.error('BOJ 유저 정보 조회 오류:', error);
        return null;
    }
};
