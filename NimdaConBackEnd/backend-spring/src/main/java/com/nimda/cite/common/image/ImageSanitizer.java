package com.nimda.cite.common.image;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
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
    // Decode-bomb limits: 8K per side and 40 megapixels.
    private static final int MAX_DIMENSION = 8_192;
    private static final long MAX_PIXELS = 40_000_000L;

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
        try (InputStream input = file.getInputStream()) {
            return reEncode(input, file.getSize(), ext);
        }
    }

    public static byte[] reEncode(byte[] data, String ext) throws IOException {
        try (InputStream input = new ByteArrayInputStream(data)) {
            return reEncode(input, data.length, ext);
        }
    }

    private static byte[] reEncode(InputStream input, long originalSize, String ext) throws IOException {
        BufferedImage image;
        try (ImageInputStream imageInput = ImageIO.createImageInputStream(input)) {
            if (imageInput == null) {
                throw new IOException("이미지 파일을 읽을 수 없습니다.");
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) {
                throw new IOException("이미지 파일을 읽을 수 없습니다. 파일이 손상되었을 수 있습니다.");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(imageInput, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                long pixels = Math.multiplyExact((long) width, (long) height);
                if (width <= 0 || height <= 0
                        || width > MAX_DIMENSION || height > MAX_DIMENSION || pixels > MAX_PIXELS) {
                    throw new IOException("이미지 크기가 허용 범위를 초과합니다.");
                }
                image = reader.read(0);
            } catch (ArithmeticException e) {
                throw new IOException("이미지 크기가 허용 범위를 초과합니다.", e);
            } finally {
                reader.dispose();
            }
        }

        if (image == null) {
            throw new IOException("이미지 파일을 읽을 수 없습니다. 파일이 손상되었을 수 있습니다.");
        }

        String outputFormat = "png".equalsIgnoreCase(ext) ? "png" : "jpg";
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
                originalSize / 1024, baos.size() / 1024, outputFormat);
        return baos.toByteArray();
    }

    /**
     * 재인코딩 후 출력 확장자를 반환한다.
     */
    public static String getOutputExtension(String ext) {
        return "png".equalsIgnoreCase(ext) ? "png" : "jpg";
    }
}
