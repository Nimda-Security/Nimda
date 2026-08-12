package com.nimda.cite.user.service;

import com.nimda.cite.user.dto.ChangePassword.CheckUserValidateResponse;
import com.nimda.cite.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserRecoveryService {
    @Autowired
    private UserRepository userRepository;

    // 컨트롤러에서 DTO화해서 반환
    @Transactional
    public CheckUserValidateResponse checkValidate(String userId, String studentNum, String email) {
        boolean isFullMatch = userRepository.existsByUserIdAndStudentNumAndEmail(userId, studentNum, email);
        return new CheckUserValidateResponse(isFullMatch, isFullMatch, isFullMatch);
    }
}
