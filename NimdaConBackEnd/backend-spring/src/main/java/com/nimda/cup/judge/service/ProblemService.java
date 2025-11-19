package com.nimda.cup.judge.service;

import com.nimda.cup.judge.dto.ProblemCreateDTO;
import com.nimda.cup.judge.entity.Problem;
import com.nimda.cup.judge.entity.TestCase;
import com.nimda.cup.judge.repository.ProblemRepository;
import com.nimda.cup.judge.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProblemService {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    /**
     * 문제 생성
     */
    @Transactional
    public Problem createProblem(ProblemCreateDTO problemCreateDTO) {

        // 1. Problem 엔티티 생성
        Problem problem = new Problem();
        problem.setTitle(problemCreateDTO.getTitle());
        problem.setDescription(problemCreateDTO.getDescription());
        problem.setPoints(problemCreateDTO.getPoints());
        problem.setTimeLimit(problemCreateDTO.getTimeLimit());
        problem.setMemoryLimit(problemCreateDTO.getMemoryLimit());
        problem.setDifficulty(problemCreateDTO.getDifficulty());
        problem.setLanguage(problemCreateDTO.getLanguage());
        problem.setInputFormat(problemCreateDTO.getInputFormat());
        problem.setOutputFormat(problemCreateDTO.getOutputFormat());

        // 2. Problem 저장
        problem = problemRepository.save(problem);

        // 3. TestCase 생성 및 저장
        if (problemCreateDTO.getTestCases() != null && !problemCreateDTO.getTestCases().isEmpty()) {
            for (ProblemCreateDTO.TestCaseDTO testCaseDTO : problemCreateDTO.getTestCases()) {
                TestCase testCase = new TestCase();
                testCase.setProblem(problem);
                testCase.setInput(testCaseDTO.getInput());
                testCase.setOutput(testCaseDTO.getOutput());
                // isPublic 설정 (null이면 기본값 false)
                testCase.setIsPublic(testCaseDTO.getIsPublic() != null ? testCaseDTO.getIsPublic() : false);
                testCaseRepository.save(testCase);
            }
        }

        return problem;
    }

    /**
     * 모든 문제 조회
     */
    @Transactional(readOnly = true)
    public List<Problem> getAllProblems() {
        System.out.println("=== ProblemService.getAllProblems() 호출됨 ===");
        try {
            System.out.println("=== problemRepository.findAll() 호출 중 ===");
            List<Problem> problems = problemRepository.findAll();
            System.out.println("=== 문제 수: " + problems.size() + " ===");
            return problems;
        } catch (Exception e) {
            System.out.println("=== ProblemService에서 오류 발생: " + e.getMessage() + " ===");
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * ID로 문제 조회
     */
    @Transactional(readOnly = true)
    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다: " + id));
    }

    /**
     * 문제 수정
     */
    @Transactional
    public Problem updateProblem(Long id, ProblemCreateDTO problemCreateDTO) {
        // 1. 기존 문제 조회
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("문제를 찾을 수 없습니다: " + id));

        // 2. Problem 엔티티 업데이트
        problem.setTitle(problemCreateDTO.getTitle());
        problem.setDescription(problemCreateDTO.getDescription());
        problem.setPoints(problemCreateDTO.getPoints());
        problem.setTimeLimit(problemCreateDTO.getTimeLimit());
        problem.setMemoryLimit(problemCreateDTO.getMemoryLimit());
        problem.setDifficulty(problemCreateDTO.getDifficulty());
        problem.setLanguage(problemCreateDTO.getLanguage());
        problem.setInputFormat(problemCreateDTO.getInputFormat());
        problem.setOutputFormat(problemCreateDTO.getOutputFormat());

        // 3. Problem 저장
        problem = problemRepository.save(problem);

        // 4. 기존 TestCase 삭제
        List<TestCase> existingTestCases = testCaseRepository.findByProblemId(id);
        testCaseRepository.deleteAll(existingTestCases);

        // 5. 새로운 TestCase 생성 및 저장
        if (problemCreateDTO.getTestCases() != null && !problemCreateDTO.getTestCases().isEmpty()) {
            for (ProblemCreateDTO.TestCaseDTO testCaseDTO : problemCreateDTO.getTestCases()) {
                TestCase testCase = new TestCase();
                testCase.setProblem(problem);
                testCase.setInput(testCaseDTO.getInput());
                testCase.setOutput(testCaseDTO.getOutput());
                // isPublic 설정 (null이면 기본값 false)
                testCase.setIsPublic(testCaseDTO.getIsPublic() != null ? testCaseDTO.getIsPublic() : false);
                testCaseRepository.save(testCase);
            }
        }

        return problem;
    }

    /**
     * 문제 삭제
     */
    @Transactional
    public void deleteProblem(Long id) {
        if (!problemRepository.existsById(id)) {
            throw new RuntimeException("문제를 찾을 수 없습니다: " + id);
        }
        problemRepository.deleteById(id);
    }
}
