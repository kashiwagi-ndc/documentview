package jp.nihondata.documentview.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * LibreOffice (soffice) を無人実行し、Office 系ファイル（xlsx/docx/pptx 等）を PDF に変換する。
 * 変換対象の収集・スケジューリング・リトライは呼び出し側の責務とし、このクラスは
 * 「1ファイルを渡されたら PDF に変換して返す」ことにのみ責任を持つ。
 */
@Service
public class PdfConversionService {

    private final String sofficeCommand;
    private final Duration timeout;

    public PdfConversionService(
            @Value("${documentview.conversion.soffice-path:soffice}") String sofficeCommand,
            @Value("${documentview.conversion.timeout-seconds:60}") long timeoutSeconds) {
        this.sofficeCommand = sofficeCommand;
        this.timeout = Duration.ofSeconds(timeoutSeconds);
    }

    /**
     * inputFile を PDF に変換し、outputDirectory に生成された PDF のパスを返す。
     */
    public Path convertToPdf(Path inputFile, Path outputDirectory) {
        if (!Files.isRegularFile(inputFile)) {
            throw new PdfConversionException("入力ファイルが存在しません: " + inputFile);
        }

        try {
            Files.createDirectories(outputDirectory);
        } catch (IOException e) {
            throw new PdfConversionException("出力ディレクトリを作成できません: " + outputDirectory, e);
        }

        // 同時実行中の soffice プロセスとユーザープロファイルが衝突しないよう、実行ごとに専用の
        // プロファイルディレクトリを割り当てる（LibreOffice はプロファイルを共有すると
        // 他プロセスからのロックでハングすることがあるため）。
        Path userProfile = createTempProfileDir();
        try {
            List<String> command = List.of(
                    sofficeCommand,
                    "--headless",
                    "--norestore",
                    "--nolockcheck",
                    "-env:UserInstallation=file://" + userProfile.toAbsolutePath(),
                    "--convert-to", "pdf",
                    "--outdir", outputDirectory.toAbsolutePath().toString(),
                    inputFile.toAbsolutePath().toString());

            String processOutput = runProcess(command);

            Path convertedFile = outputDirectory.resolve(stripExtension(inputFile.getFileName().toString()) + ".pdf");
            if (!Files.isRegularFile(convertedFile)) {
                throw new PdfConversionException(
                        "変換後の PDF が見つかりません: " + convertedFile + System.lineSeparator() + processOutput);
            }
            return convertedFile;
        } finally {
            deleteRecursivelyQuietly(userProfile);
        }
    }

    private String runProcess(List<String> command) {
        Process process;
        try {
            process = new ProcessBuilder(command).redirectErrorStream(true).start();
        } catch (IOException e) {
            throw new PdfConversionException("LibreOffice プロセスの起動に失敗しました: " + command, e);
        }

        String output;
        try {
            output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            process.destroyForcibly();
            throw new PdfConversionException("LibreOffice プロセスの出力読み取りに失敗しました", e);
        }

        boolean finished;
        try {
            finished = process.waitFor(timeout.toSeconds(), TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            process.destroyForcibly();
            Thread.currentThread().interrupt();
            throw new PdfConversionException("変換処理が中断されました", e);
        }

        if (!finished) {
            process.destroyForcibly();
            throw new PdfConversionException("変換がタイムアウトしました（" + timeout.toSeconds() + "秒）: " + command);
        }
        if (process.exitValue() != 0) {
            throw new PdfConversionException(
                    "LibreOffice の変換に失敗しました（exit=" + process.exitValue() + "）: " + output);
        }
        return output;
    }

    private static Path createTempProfileDir() {
        try {
            return Files.createTempDirectory("soffice-profile-");
        } catch (IOException e) {
            throw new PdfConversionException("一時プロファイルディレクトリを作成できません", e);
        }
    }

    private static String stripExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(0, dot) : fileName;
    }

    private static void deleteRecursivelyQuietly(Path root) {
        try (var paths = Files.walk(root)) {
            paths.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                    // 一時プロファイルの後片付けなので失敗しても変換結果には影響しない
                }
            });
        } catch (IOException ignored) {
            // 同上
        }
    }
}
