package com.nimda.cite.common.s3;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "aws.s3")
public class S3Properties {
    private String bucket;
    private String region;
    private String accessKey;
    private String secretKey;

    // 경로 설정 (미설정 시 기본값)
    private String profileImagePath = "profiles/";
    private String boardImagePath = "boards/";
    private String boardFilePath = "boards/files/";
    private String challengePath = "challenges/";

    // 제약 사항
    private Long maxFileSize;
    private List<String> allowedImageTypes;
    private List<String> allowedFileTypes;
}