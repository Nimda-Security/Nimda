package com.nimda.cite.common.image;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ImageSanitizerTest {

    @Test
    void reEncodesAValidImageToTheCanonicalFormat() throws Exception {
        byte[] input = png(16, 12);

        byte[] output = ImageSanitizer.reEncode(input, "png");

        assertTrue(output.length > 0);
        assertEquals("png", ImageSanitizer.getOutputExtension("png"));
    }

    @Test
    void rejectsOversizedDimensionsBeforeFullDecode() throws Exception {
        byte[] input = png(8_193, 1);

        assertThrows(IOException.class, () -> ImageSanitizer.reEncode(input, "png"));
    }

    @Test
    void rejectsBytesThatAreNotAnImage() {
        assertThrows(
                IOException.class,
                () -> ImageSanitizer.reEncode("NIMDA_AUDIT".getBytes(), "png"));
    }

    private byte[] png(int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }
}
