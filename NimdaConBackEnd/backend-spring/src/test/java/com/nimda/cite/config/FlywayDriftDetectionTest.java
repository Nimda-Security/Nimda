package com.nimda.cite.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.ValidateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Flyway 마이그레이션 무결성 회귀 테스트.
 *
 * <p>"적용 완료된 마이그레이션 파일이 나중에 수정되는" 상황(체크섬 드리프트)을
 * 실제로 만들어 두 가지를 증명한다.
 *
 * <ol>
 *   <li>드리프트가 실재한다 — validate 를 켜면 부팅이 실패한다.</li>
 *   <li>그런데도 현재 설정(validate off)에서는 아무 신호가 없었다.
 *       FlywayConfig 의 전략은 이를 탐지해 로그로 남기면서도 배포를 막지 않는다.</li>
 * </ol>
 */
class FlywayDriftDetectionTest {

    @TempDir
    Path migrationDir;

    private String jdbcUrl() {
        // 테스트마다 격리된 인메모리 DB
        return "jdbc:h2:mem:flyway_" + UUID.randomUUID().toString().replace("-", "")
                + ";DB_CLOSE_DELAY=-1;MODE=MySQL";
    }

    private Flyway flyway(String url, boolean validateOnMigrate) {
        return Flyway.configure()
                .dataSource(url, "sa", "")
                .locations("filesystem:" + migrationDir.toAbsolutePath())
                .validateOnMigrate(validateOnMigrate)
                .baselineOnMigrate(true)
                .load();
    }

    private void writeMigration(String body) throws Exception {
        Files.writeString(migrationDir.resolve("V1__init.sql"), body);
    }

    @Test
    @DisplayName("정상 상태에서는 무결성 검증이 통과한다")
    void cleanStateValidates() throws Exception {
        writeMigration("CREATE TABLE demo (id INT PRIMARY KEY);");
        String url = jdbcUrl();

        flyway(url, false).migrate();

        ValidateResult result = flyway(url, false).validateWithResult();
        assertThat(result.validationSuccessful).isTrue();
    }

    @Test
    @DisplayName("적용 완료된 마이그레이션을 수정하면 드리프트가 실재한다 (validate 켜면 부팅 실패)")
    void tamperedMigrationIsRealDrift() throws Exception {
        writeMigration("CREATE TABLE demo (id INT PRIMARY KEY);");
        String url = jdbcUrl();

        flyway(url, false).migrate();

        // 이미 적용된 마이그레이션 파일을 사후 수정 → 체크섬 불일치
        writeMigration("CREATE TABLE demo (id INT PRIMARY KEY, extra VARCHAR(10));");

        ValidateResult result = flyway(url, false).validateWithResult();
        assertThat(result.validationSuccessful)
                .as("파일이 수정됐으므로 검증은 실패해야 한다")
                .isFalse();
        assertThat(result.invalidMigrations).isNotEmpty();

        // validate-on-migrate 를 켜면 이 상태에서 부팅이 실패한다.
        // → 운영 DB 이력을 모르는 채로 true 로 뒤집을 수 없는 이유의 근거.
        assertThatThrownBy(() -> flyway(url, true).migrate())
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("FlywayConfig 전략은 드리프트를 탐지하면서도 마이그레이션을 막지 않는다")
    void strategyDetectsDriftWithoutBlockingBoot() throws Exception {
        writeMigration("CREATE TABLE demo (id INT PRIMARY KEY);");
        String url = jdbcUrl();

        flyway(url, false).migrate();
        writeMigration("CREATE TABLE demo (id INT PRIMARY KEY, extra VARCHAR(10));");

        Flyway drifted = flyway(url, false);
        assertThat(drifted.validateWithResult().validationSuccessful).isFalse();

        FlywayMigrationStrategy strategy = new FlywayConfig().migrationStrategy();

        // 핵심: 드리프트가 있어도 전략은 예외를 던지지 않는다(무중단 배포 보호).
        assertThatCode(() -> strategy.migrate(drifted))
                .as("탐지는 하되 배포를 막지 않아야 한다")
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("전략은 검증 자체가 불가능한 상황에서도 마이그레이션을 진행한다")
    void strategyNeverThrowsEvenWhenValidationImpossible() throws Exception {
        writeMigration("CREATE TABLE demo (id INT PRIMARY KEY);");
        String url = jdbcUrl();

        FlywayMigrationStrategy strategy = new FlywayConfig().migrationStrategy();

        // 아직 스키마 이력 테이블조차 없는 최초 부팅 상황
        assertThatCode(() -> strategy.migrate(flyway(url, false)))
                .doesNotThrowAnyException();
    }
}
