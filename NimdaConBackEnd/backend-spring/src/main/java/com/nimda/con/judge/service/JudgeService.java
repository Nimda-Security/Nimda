package com.nimda.con.judge.service;

import com.nimda.con.judge.dto.JudgeResultDTO;
import com.nimda.con.judge.dto.SubmissionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Service
public class JudgeService {
    
    private static final Logger logger = LoggerFactory.getLogger(JudgeService.class);
    
    // 제한 설정
    private static final long TIME_LIMIT_MS = 5000; // 5초
    private static final long MEMORY_LIMIT_MB = 256; // 256MB
    
    // 임시 파일 경로
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir") + "/nimda-judge/";
    
    /**
     * 코드를 채점하는 메인 메서드
     */
    public JudgeResultDTO judgeCode(SubmissionDTO submission) {
        try {
            // 임시 디렉토리 생성
            createTempDirectory();
            
            String language = submission.getLanguage().toLowerCase();
            
            switch (language) {
                case "java":
                    return judgeJavaCode(submission);
                case "c++17":
                case "cpp":
                    return judgeCppCode(submission);
                default:
                    return new JudgeResultDTO(
                        JudgeResultDTO.Status.SYSTEM_ERROR,
                        "지원하지 않는 언어입니다: " + language,
                        ""
                    );
            }
            
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
