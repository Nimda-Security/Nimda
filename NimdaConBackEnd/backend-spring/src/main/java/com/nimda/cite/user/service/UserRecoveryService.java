package com.nimda.cite.user.service;

import com.nimda.cite.common.util.JwtUtil;
import com.nimda.cite.user.dto.ChangePassword.CheckUserValidateResponse;
import com.nimda.cite.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserRecoveryService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;

    // 컨트롤러에서 DTO화해서 반환
    @Transactional
    public CheckUserValidateResponse checkValidate(String userId, String studentNum, String email) {
        List<Boolean> result = new ArrayList<>();
        boolean idExists = userRepository.existsByUserId(userId);

        // 2. 아이디가 없으면 모두 false로 반환
        if (!idExists) {
            return new CheckUserValidateResponse(false, false, false);
        }
        return new CheckUserValidateResponse(
                true,
                userRepository.existsByUserIdAndStudentNum(userId, studentNum),
                userRepository.existsByUserIdAndEmail(userId, email)
        );
    }
}
