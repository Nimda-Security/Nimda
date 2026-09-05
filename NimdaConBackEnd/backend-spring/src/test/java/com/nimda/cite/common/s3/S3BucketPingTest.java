package com.nimda.cite.common.s3;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * S3 통합 테스트 코드로, 다음과 같은 기능 테스트
 *     1. springRecognizesS3Configuration : spring context가 설정된 S3를 인식할 수 있는지 확인 (버킷, region, client)
 *     2. bucketPing : 주입된 s3 client object가 mock request를 통해 s3에 접속을 시도하였을 때, 예외 없이 처리 되는지 확인
 *
 */

@Tag("S3-integration")
@EnabledIfEnvironmentVariable(named = "AWS_S3_ACCESS_KEY", matches = ".+")
@SpringBootTest(classes = S3Config.class)
@EnableConfigurationProperties(S3Properties.class)
public class S3BucketPingTest {
    @Autowired private S3Client s3Client;
    @Autowired private S3Properties s3Properties;

    @Test
    void springRecognizesS3Configuration(){
        assertThat(s3Properties.getBucket()).isNotBlank();
        assertThat(s3Properties.getRegion()).isNotBlank();
        assertThat(s3Client).isNotNull();
    }

    @Test
    void bucketPing(){
        HeadBucketRequest request = HeadBucketRequest.builder()
                .bucket(s3Properties.getBucket())
                .build();

        assertThatCode(() -> s3Client.headBucket(request))
                .doesNotThrowAnyException();
    }
}
