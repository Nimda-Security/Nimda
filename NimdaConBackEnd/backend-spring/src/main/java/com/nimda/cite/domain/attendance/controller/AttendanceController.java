package com.nimda.cite.domain.attendance.controller;

import com.nimda.cite.domain.attendance.dto.TodayVisitorResponse;
import com.nimda.cite.domain.attendance.entity.Attendance;
import com.nimda.cite.domain.attendance.entity.AttendanceLog;
import com.nimda.cite.domain.attendance.service.AttendanceService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cite.common.s3.S3Service;
import com.nimda.cite.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cite/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired(required = false)
    private S3Service s3Service;
    /**
     * [POST] 출석 체크 실행
     */
    @PostMapping("/checkIn")
    public ResponseEntity<?> checkIn(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Long userId = userDetails.getUser().getId();
            attendanceService.markAttendance(userId);
            return ApiResponse.ok("오늘의 출석이 완료되었습니다!").toResponse();
        } catch (IllegalStateException e) {
            return ApiResponse.fail(e.getMessage()).toResponse(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * [GET] 오늘 출석자 전체 조회
     */
    @GetMapping("/today")
    public ResponseEntity<?> getTodayVisitors() {
        List<AttendanceLog> visitors = attendanceService.getTodayVisitors();
        List<TodayVisitorResponse> dto = visitors.stream()
                .map(TodayVisitorResponse::from)
                .toList();

        // S3 키 → Presigned URL 변환
        if (s3Service != null) {
            for (TodayVisitorResponse v : dto) {
                String img = v.getProfileImageUrl();
                if (img != null && !img.isBlank() && !img.startsWith("http")) {
                    v.setProfileImageUrl(s3Service.createPresignedGetUrl(img, 60));
                }
            }
        }

        return ApiResponse.ok("출석자 조회에 성공했습니다", dto).toResponse();
    }

    /**
     * [GET] 연속 출석 랭킹 TOP 5
     */
    @GetMapping("/rank/consecutive")
    public ResponseEntity<ApiResponse<List<Attendance>>> getConsecutiveRank() {
        List<Attendance> rank = attendanceService.getTop5ByConsecutive();
        return ApiResponse.ok("연속 출석 랭킹 TOP 5 조회 성공", rank).toResponse();
    }

    /**
     * [GET] 누적 출석 랭킹 TOP 5
     */
    @GetMapping("/rank/total")
    public ResponseEntity<ApiResponse<List<Attendance>>> getTotalRank() {
        List<Attendance> rank = attendanceService.getTop5ByTotal();
        return ApiResponse.ok("누적 출석 랭킹 TOP 5 조회 성공", rank).toResponse();
    }

    /**
     * [GET] 내 출석부 상태 조회
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Attendance>> getMyAttendance(@AuthenticationPrincipal CustomUserDetails userDetails) {
         Long userId = userDetails.getUser().getId();
         Attendance attendance = attendanceService.getUserAttendance(userId);
         return ApiResponse.ok(attendance).toResponse();
    }

    /**
     * [GET] 내 상세 출석 로그 조회
     */
    @GetMapping("/me/logs")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getMyLogs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<AttendanceLog> logs = attendanceService.getUserLogs(userId);
        return ApiResponse.ok(logs).toResponse();
    }

    @GetMapping
    public ResponseEntity<?> getMyTotalAttendanceCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        Long dto = attendanceService.getMyTotalAttendanceCount(userId);

        // 누적 출석 횟수(totalCount)만 추출하여 반환
        return ApiResponse.ok(Map.of("visitCount", dto)).toResponse();
    }
}