package jp.nihondata.documentview.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PdfConversionServiceTest {

    private static boolean sofficeAvailable() {
        try {
            Process process = new ProcessBuilder("soffice", "--version").start();
            boolean finished = process.waitFor(10, TimeUnit.SECONDS);
            return finished && process.exitValue() == 0;
        } catch (IOException | InterruptedException e) {
            return false;
        }
    }

    @Test
    void convertsXlsxToPdf(@TempDir Path tempDir) throws IOException {
        Assumptions.assumeTrue(sofficeAvailable(), "soffice が見つからないためスキップします");

        Path input = tempDir.resolve("sample.xlsx");
        try (InputStream in = getClass().getResourceAsStream("/sample.xlsx")) {
            Files.copy(in, input);
        }

        PdfConversionService service = new PdfConversionService("soffice", 60);
        Path outputDir = tempDir.resolve("out");

        Path result = service.convertToPdf(input, outputDir);

        assertThat(result).isRegularFile();
        assertThat(result.getFileName().toString()).isEqualTo("sample.pdf");
        assertThat(Files.size(result)).isGreaterThan(0);
    }

    @Test
    void throwsWhenInputFileDoesNotExist(@TempDir Path tempDir) {
        PdfConversionService service = new PdfConversionService("soffice", 60);
        Path missing = tempDir.resolve("missing.xlsx");

        assertThrows(PdfConversionException.class, () -> service.convertToPdf(missing, tempDir.resolve("out")));
    }
}
