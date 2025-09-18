package com.nimda.con.judge.service;

import com.nimda.con.judge.dto.JudgeResultDTO;
import com.nimda.con.judge.dto.SubmissionDTO;
import com.nimda.con.judge.entity.Problem;
import com.nimda.con.judge.entity.Submission;
import com.nimda.con.judge.entity.JudgeResult;
import com.nimda.con.judge.enums.Language;
import com.nimda.con.judge.enums.JudgeStatus;
import com.nimda.con.judge.repository.ProblemRepository;
import com.nimda.con.judge.repository.SubmissionRepository;
import com.nimda.con.judge.repository.JudgeResultRepository;
import com.nimda.con.user.entity.User;
import com.nimda.con.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class JudgeService {
    
    private static final Logger logger = LoggerFactory.getLogger(JudgeService.class);
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private JudgeResultRepository judgeResultRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // 제한 설정
    private static final long TIME_LIMIT_MS = 5000; // 5초
    private static final long MEMORY_LIMIT_MB = 256; // 256MB
    
    // 임시 파일 경로
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir") + "/nimda-judge/";
    
    /**
     * 코드를 채점하는 메인 메서드 (사용자명 포함)
     */
    public JudgeResultDTO judgeCode(SubmissionDTO submissionDTO, String username) {
        try {
            // 1. 사용자 조회 (없으면 익명 사용자 생성)
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null && !"익명".equals(username)) {
                logger.warn("사용자를 찾을 수 없음: {}", username);
                username = "익명";
            }
            
            // 2. 문제 조회 (기본 A+B 문제)
            Problem problem = problemRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("기본 문제를 찾을 수 없습니다."));
            
            // 3. 제출 기록 생성 및 저장
            Submission submission = new Submission();
            submission.setUser(user);
            submission.setProblem(problem);
            submission.setCode(submissionDTO.getCode());
            submission.setLanguage(Language.fromString(submissionDTO.getLanguage()));
            submission.setStatus(JudgeStatus.JUDGING);
            
            submission = submissionRepository.save(submission); // DB 저장
            logger.info("제출 기록 저장 완료 - ID: {}, 사용자: {}", submission.getId(), username);
            
            // 4. 실제 채점 수행
            createTempDirectory();
            String language = submissionDTO.getLanguage().toLowerCase();
            
            JudgeResultDTO resultDTO;
            switch (language) {
                case "java":
                    resultDTO = judgeJavaCode(submissionDTO);
                    break;
                case "c++17":
                case "cpp":
                    resultDTO = judgeCppCode(submissionDTO);
                    break;
                default:
                    resultDTO = new JudgeResultDTO(
                        JudgeResultDTO.Status.SYSTEM_ERROR,
                        "지원하지 않는 언어입니다: " + language,
                        ""
                    );
            }
            
            // 5. 채점 결과 저장
            JudgeResult judgeResult = new JudgeResult();
            judgeResult.setSubmission(submission);
            judgeResult.setStatus(JudgeStatus.valueOf(resultDTO.getStatus().name()));
            judgeResult.setMessage(resultDTO.getMessage());
            judgeResult.setOutput(resultDTO.getOutput());
            judgeResult.setErrorOutput(resultDTO.getErrorOutput());
            judgeResult.setExecutionTime(resultDTO.getExecutionTime());
            judgeResult.setMemoryUsage(resultDTO.getMemoryUsage());
            judgeResult.setScore(resultDTO.getScore());
            
            judgeResultRepository.save(judgeResult); // DB 저장
            
            // 6. 제출 상태 업데이트
            submission.setStatus(JudgeStatus.valueOf(resultDTO.getStatus().name()));
            submissionRepository.save(submission);
            
            logger.info("채점 완료 및 저장 - 제출 ID: {}, 결과: {}", submission.getId(), resultDTO.getStatus());
            
            // 7. 제출 ID 포함해서 응답
            resultDTO.setMessage("제출 ID: " + submission.getId() + " - " + resultDTO.getMessage());
            return resultDTO;
            
        } catch (Exception e) {
            logger.error("채점 중 오류 발생", e);
            return new JudgeResultDTO(
                JudgeResultDTO.Status.SYSTEM_ERROR,
                "채점 시스템 오류: " + e.getMessage(),
                ""
            );
        }
    }
    
    /**
     * Java 코드 채점
     */
    private JudgeResultDTO judgeJavaCode(SubmissionDTO submission) throws IOException, InterruptedException {
        String fileName = "Solution";
        String sourceFile = TEMP_DIR + fileName + ".java";
        String classFile = TEMP_DIR + fileName + ".class";
        
        // 소스 코드를 파일로 저장
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(submission.getCode());
        }
        
        // 컴파일
        ProcessBuilder compileBuilder = new ProcessBuilder("javac", sourceFile);
        compileBuilder.directory(new File(TEMP_DIR));
        Process compileProcess = compileBuilder.start();
        
        boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);
        if (!compileFinished || compileProcess.exitValue() != 0) {
            String error = readStream(compileProcess.getErrorStream());
            return new JudgeResultDTO(
                JudgeResultDTO.Status.COMPILATION_ERROR,
                "컴파일 에러",
                error
            );
        }
        
        // 실행
        ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", TEMP_DIR, fileName);
        runBuilder.directory(new File(TEMP_DIR));
        
        long startTime = System.currentTimeMillis();
        Process runProcess = runBuilder.start();
        
        // 간단한 테스트 입력 (A + B 문제라고 가정)
        try (PrintWriter writer = new PrintWriter(runProcess.getOutputStream())) {
            writer.println("1 2");
            writer.flush();
        }
        
        boolean runFinished = runProcess.waitFor(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);
        long executionTime = System.currentTimeMillis() - startTime;
        
        if (!runFinished) {
            runProcess.destroyForcibly();
            return new JudgeResultDTO(
                JudgeResultDTO.Status.TIME_LIMIT_EXCEEDED,
                "시간 초과",
                ""
            );
        }
        
        if (runProcess.exitValue() != 0) {
            String error = readStream(runProcess.getErrorStream());
            return new JudgeResultDTO(
                JudgeResultDTO.Status.RUNTIME_ERROR,
                "런타임 에러",
                error
            );
        }
        
        // 출력 결과 확인
        String output = readStream(runProcess.getInputStream()).trim();
        
        // 간단한 정답 체크 (A + B = 3)
        if ("3".equals(output)) {
            return new JudgeResultDTO(
                JudgeResultDTO.Status.ACCEPTED,
                output,
                executionTime,
                0, // 메모리 사용량은 추후 구현
                100
            );
        } else {
            return new JudgeResultDTO(
                JudgeResultDTO.Status.WRONG_ANSWER,
                "오답입니다. 출력: " + output + ", 정답: 3",
                ""
            );
        }
    }
    
    /**
     * C++ 코드 채점
     */
    private JudgeResultDTO judgeCppCode(SubmissionDTO submission) throws IOException, InterruptedException {
        String fileName = "solution";
        String sourceFile = TEMP_DIR + fileName + ".cpp";
        String execFile = TEMP_DIR + fileName;
        
        // 소스 코드를 파일로 저장
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(submission.getCode());
        }
        
        // 컴파일
        ProcessBuilder compileBuilder = new ProcessBuilder(
            "g++", "-std=c++17", "-O2", "-o", execFile, sourceFile
        );
        compileBuilder.directory(new File(TEMP_DIR));
        Process compileProcess = compileBuilder.start();
        
        boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);
        if (!compileFinished || compileProcess.exitValue() != 0) {
            String error = readStream(compileProcess.getErrorStream());
            return new JudgeResultDTO(
                JudgeResultDTO.Status.COMPILATION_ERROR,
                "컴파일 에러",
                error
            );
        }
        
        // 실행
        ProcessBuilder runBuilder = new ProcessBuilder(execFile);
        runBuilder.directory(new File(TEMP_DIR));
        
        long startTime = System.currentTimeMillis();
        Process runProcess = runBuilder.start();
        
        // 간단한 테스트 입력 (A + B 문제)
        try (PrintWriter writer = new PrintWriter(runProcess.getOutputStream())) {
            writer.println("1 2");
            writer.flush();
        }
        
        boolean runFinished = runProcess.waitFor(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);
        long executionTime = System.currentTimeMillis() - startTime;
        
        if (!runFinished) {
            runProcess.destroyForcibly();
            return new JudgeResultDTO(
                JudgeResultDTO.Status.TIME_LIMIT_EXCEEDED,
                "시간 초과",
                ""
            );
        }
        
        if (runProcess.exitValue() != 0) {
            String error = readStream(runProcess.getErrorStream());
            return new JudgeResultDTO(
                JudgeResultDTO.Status.RUNTIME_ERROR,
                "런타임 에러",
                error
            );
        }
        
        // 출력 결과 확인
        String output = readStream(runProcess.getInputStream()).trim();
        
        // 간단한 정답 체크 (A + B = 3)
        if ("3".equals(output)) {
            return new JudgeResultDTO(
                JudgeResultDTO.Status.ACCEPTED,
                output,
                executionTime,
                0, // 메모리 사용량은 추후 구현
                100
            );
        } else {
            return new JudgeResultDTO(
                JudgeResultDTO.Status.WRONG_ANSWER,
                "오답입니다. 출력: " + output + ", 정답: 3",
                ""
            );
        }
    }
    
    /**
     * 임시 디렉토리 생성
     */
    private void createTempDirectory() throws IOException {
        Path tempPath = Paths.get(TEMP_DIR);
        if (!Files.exists(tempPath)) {
            Files.createDirectories(tempPath);
        }
    }
    
    /**
     * 제출 목록 조회
     */
    public List<Submission> getSubmissions() {
        logger.info("제출 목록 조회 요청");
        return submissionRepository.findAll();
    }
    
    /**
     * 특정 사용자의 제출 목록 조회
     */
    public List<Submission> getSubmissionsByUser(String username) {
        logger.info("사용자별 제출 목록 조회 요청 - 사용자: {}", username);
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            logger.warn("사용자를 찾을 수 없음: {}", username);
            return List.of();
        }
        return submissionRepository.findByUserOrderBySubmittedAtDesc(user);
    }
    
    /**
     * InputStream을 문자열로 변환
     */
    private String readStream(InputStream inputStream) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }
}
