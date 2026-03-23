package com.nimda.cite.common.s3;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.lang.NonNull;

/**
 * aws.s3.access-key / secret-key 가 둘 다 비어 있지 않을 때만 S3 빈을 등록한다.
 * Docker 등에서 환경변수 미설정 시 앱이 기동 실패하지 않도록 한다.
 */
public class AwsS3ConfiguredCondition implements Condition {

    @Override
    public boolean matches(@NonNull ConditionContext context, @NonNull AnnotatedTypeMetadata metadata) {
        var env = context.getEnvironment();
        String access = env.getProperty("aws.s3.access-key");
        String secret = env.getProperty("aws.s3.secret-key");
        return access != null && !access.isBlank()
                && secret != null && !secret.isBlank();
    }
}
