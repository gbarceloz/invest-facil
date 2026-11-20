package com.investfacil.api.videos;

import com.investfacil.api.common.error.BusinessException;
import com.investfacil.api.config.AppProperties;
import com.investfacil.api.content.ContentCatalog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class VideoService {

    private static final long MAX_BYTES = 150L * 1024 * 1024;
    private static final Set<String> ALLOWED_MIME = Set.of(
            "video/mp4", "video/webm", "video/quicktime");
    private static final Map<String, String> EXTENSION = Map.of(
            "video/mp4", "mp4",
            "video/webm", "webm",
            "video/quicktime", "mov");

    private final VideoAssetRepository repository;
    private final SupabaseStorageClient storage;
    private final ContentCatalog catalog;
    private final AppProperties properties;

    public VideoService(VideoAssetRepository repository, SupabaseStorageClient storage,
                        ContentCatalog catalog, AppProperties properties) {
        this.repository = repository;
        this.storage = storage;
        this.catalog = catalog;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public VideoDtos.VideoView playbackBySlug(String lessonSlug) {
        ContentCatalog.LessonRef lesson = catalog.findLessonBySlug(lessonSlug)
                .orElseThrow(() -> BusinessException.notFound("Aula não encontrada."));
        return playback(lesson.id());
    }

    @Transactional(readOnly = true)
    public VideoDtos.VideoView playback(UUID lessonId) {
        VideoAsset asset = repository.findByLessonId(lessonId).orElse(null);
        if (asset == null || !"PUBLISHED".equals(asset.getStatus())) {
            String demo = properties.getVideos().getDemoUrl();
            if (demo != null && !demo.isBlank()) {
                return new VideoDtos.VideoView(lessonId, demo, "video/mp4", null, "DEMO");
            }
            throw BusinessException.notFound("Esta aula ainda não possui vídeo publicado.");
        }
        if (storage.isConfigured()) {
            try {
                String url = storage.signedUrl(asset.getStoragePath(),
                        properties.getSupabase().getSignedUrlSeconds());
                return new VideoDtos.VideoView(lessonId, url, asset.getMime(),
                        asset.getDurationSeconds(), "SUPABASE");
            } catch (BusinessException ex) {
                if (asset.getExternalUrl() != null && !asset.getExternalUrl().isBlank()) {
                    return new VideoDtos.VideoView(lessonId, asset.getExternalUrl(),
                            asset.getMime(), asset.getDurationSeconds(), "EXTERNAL");
                }
                throw ex;
            }
        }
        if (asset.getExternalUrl() != null && !asset.getExternalUrl().isBlank()) {
            return new VideoDtos.VideoView(lessonId, asset.getExternalUrl(),
                    asset.getMime(), asset.getDurationSeconds(), "EXTERNAL");
        }
        String demo = properties.getVideos().getDemoUrl();
        if (demo != null && !demo.isBlank()) {
            return new VideoDtos.VideoView(lessonId, demo, "video/mp4", null, "DEMO");
        }
        throw BusinessException.unavailable("Armazenamento de vídeo não configurado.");
    }

    @Transactional
    public VideoDtos.VideoAdminView upload(UUID lessonId, MultipartFile file) {
        ContentCatalog.LessonRef lesson = catalog.findLesson(lessonId)
                .orElseThrow(() -> BusinessException.notFound("Aula não encontrada."));
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("EMPTY_FILE", "Selecione um arquivo de vídeo.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw BusinessException.badRequest("FILE_TOO_LARGE", "O vídeo deve ter no máximo 150 MB.");
        }
        String mime = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_MIME.contains(mime)) {
            throw BusinessException.badRequest("INVALID_FORMAT",
                    "Formato não permitido. Envie MP4, WebM ou MOV.");
        }
        if (!storage.isConfigured()) {
            throw BusinessException.unavailable(
                    "Supabase Storage não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw BusinessException.badRequest("FILE_READ_ERROR", "Não foi possível ler o arquivo.");
        }
        validateSignature(bytes, mime);

        String extension = EXTENSION.get(mime);
        String path = "videos/" + lesson.id() + "/" + UUID.randomUUID() + "." + extension;
        storage.upload(path, bytes, mime);

        VideoAsset asset = repository.findByLessonId(lessonId).orElseGet(VideoAsset::new);
        asset.setLessonId(lessonId);
        asset.setStoragePath(path);
        asset.setMime(mime);
        asset.setSizeBytes((long) bytes.length);
        asset.setStatus("PUBLISHED");
        repository.save(asset);
        return VideoDtos.VideoAdminView.from(asset);
    }

    @Transactional(readOnly = true)
    public List<VideoDtos.VideoAdminView> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(VideoDtos.VideoAdminView::from)
                .toList();
    }

    /** Assinatura mínima do container: impede upload de executáveis disfarçados. */
    private static void validateSignature(byte[] bytes, String mime) {
        if (bytes.length < 12) {
            throw BusinessException.badRequest("INVALID_FILE", "Arquivo de vídeo inválido.");
        }
        boolean valid;
        if ("video/webm".equals(mime)) {
            valid = (bytes[0] & 0xff) == 0x1A && (bytes[1] & 0xff) == 0x45
                    && (bytes[2] & 0xff) == 0xDF && (bytes[3] & 0xff) == 0xA3;
        } else {
            valid = bytes[4] == 'f' && bytes[5] == 't' && bytes[6] == 'y' && bytes[7] == 'p';
        }
        if (!valid) {
            throw BusinessException.badRequest("INVALID_FILE",
                    "O conteúdo do arquivo não corresponde a um vídeo válido.");
        }
    }
}
