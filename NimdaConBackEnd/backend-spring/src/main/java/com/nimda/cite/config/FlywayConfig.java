package com.nimda.cite.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.ValidateOutput;
import org.flywaydb.core.api.output.ValidateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway 마이그레이션 무결성 가시화.
 *
 * <p><b>왜 필요한가</b>
 *
 * <p>기존 설정은 무결성 검증이 사실상 꺼진 상태였습니다.
 *
 * <ul>
 *   <li>{@code validate-on-migrate: false} — 이미 적용된 마이그레이션 파일이 수정되어
 *       체크섬이 어긋나도(= 드리프트) 아무 경고 없이 통과합니다.</li>
 *   <li>{@code repair-on-migrate: true} — <b>Spring Boot 에 존재하지 않는 프로퍼티</b>입니다.
 *       {@code FlywayProperties} 에 해당 필드가 없고, Spring 의 프로퍼티 바인딩은 미지의 키를
 *       기본적으로 무시하므로 이 줄은 <b>아무 동작도 하지 않습니다</b>.
 *       즉 "자동 복구가 켜져 있다"는 것은 사실이 아니었습니다.</li>
 * </ul>
 *
 * <p>결과적으로 드리프트는 <b>복구되지도, 탐지되지도</b> 않는 상태였습니다.
 *
 * <p><b>이 클래스가 하는 일</b>
 *
 * <p>{@code validate-on-migrate} 를 곧바로 켜면, 이미 누적된 드리프트가 있는 경우
 * 애플리케이션 부팅이 실패합니다. 운영 DB 이력을 확인하지 않고 그렇게 바꾸는 것은
 * 위험하므로, 대신 <b>부팅을 막지 않는 탐지</b>를 수행합니다.
 *
 * <ol>
 *   <li>migrate 전에 {@code validateWithResult()} 로 검증을 <b>읽기 전용</b> 수행</li>
 *   <li>드리프트가 있으면 문제 마이그레이션을 WARN 으로 남김</li>
 *   <li>검증 결과와 무관하게 {@code migrate()} 진행 (기존 배포 동작 그대로)</li>
 * </ol>
 *
 * <p>검증 자체가 예외를 던져도(예: 최초 배포로 이력 테이블이 아직 없는 경우)
 * 삼켜서 로그만 남깁니다. 탐지가 배포를 막는 일은 없어야 하기 때문입니다.
 *
 * <p><b>정리 방법</b>: 로그에 드리프트 경고가 없음을 확인한 뒤
 * {@code FLYWAY_VALIDATE_ON_MIGRATE=true} 로 전환하면 이후에는 드리프트가
 * 부팅 실패로 즉시 드러납니다. (권장 최종 상태)
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy migrationStrategy() {
        return flyway -> {
            reportDrift(flyway);
            flyway.migrate();
        };
    }

    /**
     * 마이그레이션 무결성을 검사해 결과를 로그로 남긴다. 절대 예외를 던지지 않는다.
     */
    private void reportDrift(Flyway flyway) {
        try {
            ValidateResult result = flyway.validateWithResult();

            if (result.validationSuccessful) {
                log.info("Flyway 무결성 검증 통과 (검사 대상 {}건)", result.validateCount);
                return;
            }

            log.warn("[Flyway 무결성 경고] 마이그레이션 드리프트가 감지되었습니다. "
                    + "적용 완료된 마이그레이션 파일이 수정되었을 수 있습니다.");

            if (result.invalidMigrations != null) {
                for (ValidateOutput invalid : result.invalidMigrations) {
                    log.warn("[Flyway 무결성 경고] version={} description={} file={} 원인={}",
                            invalid.version,
                            invalid.description,
                            invalid.filepath,
                            invalid.errorDetails != null
                                    ? invalid.errorDetails.errorMessage
                                    : "(상세 없음)");
                }
            }

            String all = result.getAllErrorMessages();
            if (all != null && !all.isBlank()) {
                log.warn("[Flyway 무결성 경고] 상세: {}", all);
            }

            log.warn("[Flyway 무결성 경고] 배포는 계속 진행합니다. "
                    + "위 항목을 해소한 뒤 FLYWAY_VALIDATE_ON_MIGRATE=true 로 전환하면 "
                    + "이후 드리프트는 부팅 시점에 즉시 실패로 드러납니다.");

        } catch (Exception e) {
            // 탐지가 배포를 막아서는 안 된다.
            log.warn("Flyway 무결성 검증을 수행할 수 없었습니다 ({}). 마이그레이션은 계속 진행합니다.",
                    e.getClass().getSimpleName());
        }
    }
}
