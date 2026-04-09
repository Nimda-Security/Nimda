package com.nimda.cite.common.image;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

/**
 * 이미지 파일을 재인코딩하여 EXIF/메타데이터 및 내부 삽입 코드를 파괴한다.
 * Java 표준 ImageIO만 사용하므로 추가 의존성이 필요 없다.
 */
public final class ImageSanitizer {

    private static final Logger log = LoggerFactory.getLogger(ImageSanitizer.class);

    private static final Set<String> RE_ENCODE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "bmp"
    );

    private ImageSanitizer() {}

    /**
     * 이미지 확장자인지 판별한다.
     */
    public static boolean isImageExtension(String ext) {
        return ext != null && RE_ENCODE_EXTENSIONS.contains(ext.toLowerCase());
    }

    /**
     * MultipartFile을 읽어 재인코딩된 바이트 배열을 반환한다.
     * - 모든 메타데이터(EXIF, XMP, ICC 프로필 내 스크립트 등)가 제거된다.
     * - PNG는 PNG로, 나머지는 JPEG로 재인코딩한다.
     * - GIF 애니메이션은 첫 프레임만 유지된다.
     *
     * @param file 원본 MultipartFile
     * @param ext  파일 확장자 (소문자)
     * @return 재인코딩된 바이트 배열
     * @throws IOException 이미지가 손상되었거나 읽을 수 없는 경우
     */
    public static byte[] reEncode(MultipartFile file, String ext) throws IOException {
        BufferedImage image;
        try (InputStream is = file.getInputStream()) {
            image = ImageIO.read(is);
        }

        if (image == null) {
            throw new IOException("이미지 파일을 읽을 수 없습니다. 파일이 손상되었을 수 있습니다.");
        }

        // PNG는 lossless 유지, 나머지는 JPEG로 통일
        String outputFormat = "png".equalsIgnoreCase(ext) ? "png" : "jpg";

        // JPEG는 알파 채널 지원 안 함 → 알파 제거
        BufferedImage output = image;
        if ("jpg".equals(outputFormat) && image.getColorModel().hasAlpha()) {
            output = new BufferedImage(
                    image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
            output.createGraphics().drawImage(image, 0, 0, java.awt.Color.WHITE, null);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        boolean written = ImageIO.write(output, outputFormat, baos);
        if (!written) {
            throw new IOException("이미지 재인코딩에 실패했습니다: " + outputFormat);
        }

        log.debug("이미지 재인코딩 완료: {}KB → {}KB ({})",
                file.getSize() / 1024, baos.size() / 1024, outputFormat);

        return baos.toByteArray();
    }

    /**
     * 재인코딩 후 출력 확장자를 반환한다.
     */
    public static String getOutputExtension(String ext) {
        return "png".equalsIgnoreCase(ext) ? "png" : "jpg";
    }
}
