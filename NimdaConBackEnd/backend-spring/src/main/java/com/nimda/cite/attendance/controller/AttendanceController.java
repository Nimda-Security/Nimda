package com.nimda.cite.attendance.controller;

import com.nimda.cite.attendance.entity.Attendance;
import com.nimda.cite.attendance.entity.AttendanceLog;
import com.nimda.cite.attendance.service.AttendanceService;
import com.nimda.cite.common.response.ApiResponse;
import com.nimda.cup.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cite/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final JwtUtil jwtUtil;
    /**
     * [POST] 출석 체크 실행
     */
    @PostMapping("/checkIn")
    public ResponseEntity<?> checkIn(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));
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
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getTodayVisitors() {
        List<AttendanceLog> visitors = attendanceService.getTodayVisitors();
        return ApiResponse.ok(visitors).toResponse();
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
    public ResponseEntity<ApiResponse<Attendance>> getMyAttendance(@RequestHeader("Authorization") String authHeader)
     {
         Long userId = jwtUtil.extractUserId(authHeader.substring(7));
         Attendance attendance = attendanceService.getUserAttendance(userId);
         return ApiResponse.ok(attendance).toResponse();
    }

    /**
     * [GET] 내 상세 출석 로그 조회
     */
    @GetMapping("/me/logs")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getMyLogs(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        List<AttendanceLog> logs = attendanceService.getUserLogs(userId);
        return ApiResponse.ok(logs).toResponse();
    }
}