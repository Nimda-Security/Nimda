package com.nimda.cup.judge.service;

import com.nimda.cup.judge.dto.JudgeResultDTO;
import com.nimda.cup.judge.dto.SubmissionDTO;
import com.nimda.cup.judge.entity.Problem;
import com.nimda.cup.judge.entity.Submission;
import com.nimda.cup.judge.entity.JudgeResult;
import com.nimda.cup.judge.entity.TestCase;
import com.nimda.cup.judge.enums.Language;
import com.nimda.cup.judge.enums.JudgeStatus;
import com.nimda.cup.judge.repository.ProblemRepository;
import com.nimda.cup.judge.repository.SubmissionRepository;
import com.nimda.cup.judge.repository.JudgeResultRepository;
import com.nimda.cup.judge.repository.TestCaseRepository;
import com.nimda.cup.user.entity.User;
import com.nimda.cup.user.repository.UserRepository;
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
    @Autowired
    private TestCaseRepository testCaseRepository; // 테스트 케이스 레포지토리

    private static final long TIME_LIMIT_MS = 5000; // 5초
    private static final long MEMORY_LIMIT_MB = 256; // 256MB

    // 임시 파일 경로
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir") + "/nimda-judge/";

    /**
     * 코드를 채점하는 메인 메서드 (닉네임 포함)
     */
    public JudgeResultDTO judgeCode(SubmissionDTO submissionDTO, String nickname) {
        try {
            // 1. 사용자 조회 (없으면 익명 사용자 생성 또는 조회)
            User user = userRepository.findByNickname(nickname).orElse(null);
            if (user == null) {
                logger.warn("사용자를 찾을 수 없음: {}", nickname);
                // 익명 사용자 조회 또는 생성
                user = userRepository.findByNickname("익명").orElseGet(() -> {
                    // 익명 사용자가 없으면 생성
                    User anonymousUser = new User();
                    anonymousUser.setUserId("anonymous");
                    anonymousUser.setName("익명");
                    anonymousUser.setNickname("익명");
                    anonymousUser.setPassword("anonymous");
                    anonymousUser.setEmail("anonymous@nimda.com");
                    // 필수 필드 임시값 설정 (ERD 기반 필수 필드)
                    anonymousUser.setStudentNum("000000000");
                    anonymousUser.setPhoneNum("01000000000");
                    anonymousUser.setMajor("미지정");
                    return userRepository.save(anonymousUser);
                });
                nickname = "익명";
            }

            // 2. 문제 조회 (SubmissionDTO에서 problemId 가져오기)
            Long problemId = submissionDTO.getProblemId() != null ? submissionDTO.getProblemId() : 1L; // 기본값 1L
            Problem problem = problemRepository.findById(problemId)
                    .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다: " + problemId));

            // 3. 제출 기록 생성 및 저장
            Submission submission = new Submission();
            submission.setUser(user);
            submission.setProblem(problem);
            submission.setCode(submissionDTO.getCode());
            submission.setLanguage(Language.fromString(submissionDTO.getLanguage()));
            submission.setStatus(JudgeStatus.JUDGING);

            submission = submissionRepository.save(submission); // DB 저장
            logger.info("제출 기록 저장 완료 - ID: {}, 사용자: {}", submission.getId(), nickname);

            // 4. 실제 채점 수행
            createTempDirectory();
            String language = submissionDTO.getLanguage().toLowerCase();

            JudgeResultDTO resultDTO;
            switch (language) {
                case "java":
                    resultDTO = judgeJavaCode(submission, problem);
                    break;
                case "c":
                case "c11":
                case "c99":
                    resultDTO = judgeCCode(submission, problem);
                    break;
                case "c++17":
                case "cpp":
                    resultDTO = judgeCppCode(submission, problem);
                    break;
                default:
                    resultDTO = new JudgeResultDTO(
                            JudgeResultDTO.Status.SYSTEM_ERROR,
                            "지원하지 않는 언어입니다: " + language,
                            "");
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

            judgeResult = judgeResultRepository.save(judgeResult); // DB 저장

            // 6. 제출 상태 업데이트 및 JudgeResult 연결
            submission.setStatus(JudgeStatus.valueOf(resultDTO.getStatus().name()));
            submission.setJudgeResult(judgeResult); // JudgeResult 연결
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
                    "");
        }
    }

    /**
     * Java 코드 채점 (TestCase 기반)
     * Submission, Problem
     */
    private JudgeResultDTO judgeJavaCode(Submission submission, Problem problem)
            throws IOException, InterruptedException {
        String nickname = submission.getUser().getNickname().replaceAll("[^a-zA-Z0-9]", "_");
        String folderName = String.format("%s_%d_%d", nickname, problem.getId(), submission.getId());
        String workDir = TEMP_DIR + folderName + "/";
        Files.createDirectories(Paths.get(workDir));

        String fileName = "Solution";
        String sourceFile = workDir + fileName + ".java";
        String classFile = workDir + fileName + ".class";

        // 소스 코드를 파일로 저장
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(submission.getCode());
        }

        // 컴파일
        ProcessBuilder compileBuilder = new ProcessBuilder("javac", sourceFile);
        compileBuilder.directory(new File(workDir));
        Process compileProcess = compileBuilder.start();

        boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);
        if (!compileFinished || compileProcess.exitValue() != 0) {
            String error = readStream(compileProcess.getErrorStream());
            return new JudgeResultDTO(
                    JudgeResultDTO.Status.COMPILATION_ERROR,
                    "컴파일 에러",
                    error);
        }

        // TestCase 조회
        List<TestCase> testCases = testCaseRepository.findByProblemId(problem.getId());
        if (testCases.isEmpty()) {
            return new JudgeResultDTO(
                    JudgeResultDTO.Status.SYSTEM_ERROR,
                    "테스트케이스가 없습니다",
                    "");
        }

        // 각 테스트케이스별로 실행
        for (TestCase testCase : testCases) {
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", workDir, fileName);
            runBuilder.directory(new File(workDir));

            long startTime = System.currentTimeMillis();
            Process runProcess = runBuilder.start();

            // TestCase의 입력값 사용
            try (PrintWriter writer = new PrintWriter(runProcess.getOutputStream())) {
                writer.println(testCase.getInput()); // 동적 입력!
                writer.flush();
            }

            boolean runFinished = runProcess.waitFor(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!runFinished) {
                runProcess.destroyForcibly();
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.TIME_LIMIT_EXCEEDED,
                        "시간 초과",
                        "");
            }

            if (runProcess.exitValue() != 0) {
                String error = readStream(runProcess.getErrorStream());
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.RUNTIME_ERROR,
                        "런타임 에러",
                        error);
            }

            // 출력 결과 확인
            String output = readStream(runProcess.getInputStream()).trim();

            // TestCase 기반 정답 검증
            if (!testCase.isCorrect(output)) {
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.WRONG_ANSWER,
                        "오답입니다. 입력: " + testCase.getInput() +
                                ", 예상: " + testCase.getOutput() +
                                ", 실제: " + output,
                        "");
            }
        }

        // 모든 테스트케이스 통과
        return new JudgeResultDTO(
                JudgeResultDTO.Status.ACCEPTED,
                "모든 테스트케이스를 통과했습니다!",
                0, // 실행시간은 추후 개선 필요
                0, // 메모리 사용량은 추후 구현
                problem.getPoints());
    }

    /**
     * C 코드 채점 (TestCase 기반)
     */
    private JudgeResultDTO judgeCCode(Submission submission, Problem problem)
            throws IOException, InterruptedException {
        String nickname = submission.getUser().getNickname().replaceAll("[^a-zA-Z0-9]", "_");
        String folderName = String.format("%s_%d_%d", nickname, problem.getId(), submission.getId());
        String workDir = TEMP_DIR + folderName + "/";
        Files.createDirectories(Paths.get(workDir));

        String fileName = "solution";
        String sourceFile = workDir + fileName + ".c";
        String execFile = workDir + fileName;

        // 소스 코드를 파일로 저장
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(submission.getCode());
        }

        // 컴파일
        ProcessBuilder compileBuilder = new ProcessBuilder(
                "gcc", "-std=c11", "-O2", "-o", execFile, sourceFile);
        compileBuilder.directory(new File(workDir));
        Process compileProcess = compileBuilder.start();

        boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);
        if (!compileFinished || compileProcess.exitValue() != 0) {
            String error = readStream(compileProcess.getErrorStream());
            return new JudgeResultDTO(
                    JudgeResultDTO.Status.COMPILATION_ERROR,
                    "컴파일 에러",
                    error);
        }

        // TestCase 조회
        List<TestCase> testCases = testCaseRepository.findByProblemId(problem.getId());
        if (testCases.isEmpty()) {
            return new JudgeResultDTO(
                    JudgeResultDTO.Status.SYSTEM_ERROR,
                    "테스트케이스가 없습니다",
                    "");
        }

        // 각 테스트케이스별로 실행
        for (TestCase testCase : testCases) {
            ProcessBuilder runBuilder = new ProcessBuilder(execFile);
            runBuilder.directory(new File(workDir));

            long startTime = System.currentTimeMillis();
            Process runProcess = runBuilder.start();

            // TestCase의 입력값 사용
            try (PrintWriter writer = new PrintWriter(runProcess.getOutputStream())) {
                writer.println(testCase.getInput()); // 동적 입력!
                writer.flush();
            }

            boolean runFinished = runProcess.waitFor(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!runFinished) {
                runProcess.destroyForcibly();
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.TIME_LIMIT_EXCEEDED,
                        "시간 초과",
                        "");
            }

            if (runProcess.exitValue() != 0) {
                String error = readStream(runProcess.getErrorStream());
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.RUNTIME_ERROR,
                        "런타임 에러",
                        error);
            }

            // 출력 결과 확인
            String output = readStream(runProcess.getInputStream()).trim();

            // TestCase 기반 정답 검증
            if (!testCase.isCorrect(output)) {
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.WRONG_ANSWER,
                        "오답입니다. 입력: " + testCase.getInput() +
                                ", 예상: " + testCase.getOutput() +
                                ", 실제: " + output,
                        "");
            }
        }

        // 모든 테스트케이스 통과
        return new JudgeResultDTO(
                JudgeResultDTO.Status.ACCEPTED,
                "모든 테스트케이스를 통과했습니다!",
                0, // 실행시간은 추후 개선 필요
                0, // 메모리 사용량은 추후 구현
                problem.getPoints());
    }

    /**
     * C++ 코드 채점 (TestCase 기반)
     */
    private JudgeResultDTO judgeCppCode(Submission submission, Problem problem)
            throws IOException, InterruptedException {
        String nickname = submission.getUser().getNickname().replaceAll("[^a-zA-Z0-9]", "_");
        String folderName = String.format("%s_%d_%d", nickname, problem.getId(), submission.getId());
        String workDir = TEMP_DIR + folderName + "/";
        Files.createDirectories(Paths.get(workDir));

        String fileName = "solution";
        String sourceFile = workDir + fileName + ".cpp";
        String execFile = workDir + fileName;

        // 소스 코드를 파일로 저장
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(submission.getCode());
        }

        // 컴파일
        ProcessBuilder compileBuilder = new ProcessBuilder(
                "g++", "-std=c++17", "-O2", "-o", execFile, sourceFile);
        compileBuilder.directory(new File(workDir));
        Process compileProcess = compileBuilder.start();

        boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);
        if (!compileFinished || compileProcess.exitValue() != 0) {
            String error = readStream(compileProcess.getErrorStream());
            return new JudgeResultDTO(
                    JudgeResultDTO.Status.COMPILATION_ERROR,
                    "컴파일 에러",
                    error);
        }

        // TestCase 조회
        List<TestCase> testCases = testCaseRepository.findByProblemId(problem.getId());
        if (testCases.isEmpty()) {
            return new JudgeResultDTO(
                    JudgeResultDTO.Status.SYSTEM_ERROR,
                    "테스트케이스가 없습니다",
                    "");
        }

        // 각 테스트케이스별로 실행
        for (TestCase testCase : testCases) {
            ProcessBuilder runBuilder = new ProcessBuilder(execFile);
            runBuilder.directory(new File(workDir));

            long startTime = System.currentTimeMillis();
            Process runProcess = runBuilder.start();

            // TestCase의 입력값 사용
            try (PrintWriter writer = new PrintWriter(runProcess.getOutputStream())) {
                writer.println(testCase.getInput()); // 동적 입력!
                writer.flush();
            }

            boolean runFinished = runProcess.waitFor(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!runFinished) {
                runProcess.destroyForcibly();
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.TIME_LIMIT_EXCEEDED,
                        "시간 초과",
                        "");
            }

            if (runProcess.exitValue() != 0) {
                String error = readStream(runProcess.getErrorStream());
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.RUNTIME_ERROR,
                        "런타임 에러",
                        error);
            }

            // 출력 결과 확인
            String output = readStream(runProcess.getInputStream()).trim();

            // TestCase 기반 정답 검증
            if (!testCase.isCorrect(output)) {
                return new JudgeResultDTO(
                        JudgeResultDTO.Status.WRONG_ANSWER,
                        "오답입니다. 입력: " + testCase.getInput() +
                                ", 예상: " + testCase.getOutput() +
                                ", 실제: " + output,
                        "");
            }
        }

        // 모든 테스트케이스 통과
        return new JudgeResultDTO(
                JudgeResultDTO.Status.ACCEPTED,
                "모든 테스트케이스를 통과했습니다!",
                0, // 실행시간은 추후 개선 필요
                0, // 메모리 사용량은 추후 구현
                problem.getPoints());
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
    public List<Submission> getSubmissionsByUser(String nickname) {
        logger.info("사용자별 제출 목록 조회 요청 - 사용자: {}", nickname);
        User user = userRepository.findByNickname(nickname).orElse(null);
        if (user == null) {
            logger.warn("사용자를 찾을 수 없음: {}", nickname);
            return List.of();
        }
        return submissionRepository.findByUserOrderBySubmittedAtDesc(user);
    }

    /**
     * 특정 사용자의 특정 문제에 대한 제출 목록 조회
     */
    public List<Submission> getSubmissionsByUserAndProblem(Long userId, Long problemId) {
        logger.info("사용자별 문제별 제출 목록 조회 요청 - 사용자 ID: {}, 문제 ID: {}", userId, problemId);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            logger.warn("사용자를 찾을 수 없음: {}", userId);
            return List.of();
        }
        return submissionRepository.findByUserAndProblemIdOrderBySubmittedAtDesc(user, problemId);
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
