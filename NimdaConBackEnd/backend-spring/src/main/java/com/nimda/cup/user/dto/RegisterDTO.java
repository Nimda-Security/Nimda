package com.nimda.cup.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {

    @NotBlank(message = "User ID is required")
    @Size(min = 3, max = 20, message = "User ID must be between 3 and 20 characters")
    private String userId;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 10, message = "Name must be between 2 and 10 characters")
    private String name;

    @NotBlank(message = "Nickname is required")
    @Size(min = 3, max = 20, message = "Nickname must be between 3 and 20 characters")
    private String nickname;

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 255, message = "Password must be between 4 and 255 characters")
    private String password;

    @NotBlank(message = "Student number is required")
    @Size(min = 9, max = 9, message = "Student number must be exactly 9 characters")
    private String studentNum;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Major is required")
    @Size(max = 20, message = "Major must be at most 20 characters")
    private String major;

    private String universityName;

    private String grade;

}
