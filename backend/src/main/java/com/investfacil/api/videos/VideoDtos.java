package com.investfacil.api.videos;

import java.time.Instant;
import java.util.UUID;

public final class VideoDtos {

    private VideoDtos() {
    }

    public record VideoView(UUID lessonId, String url, String mime, Integer durationSeconds,
                            String source) {
    }

    public record VideoAdminView(UUID id, UUID lessonId, String storagePath, String status,
                                 String mime, Long sizeBytes, Integer durationSeconds,
                                 String externalUrl, Instant createdAt, Instant updatedAt) {
        public static VideoAdminView from(VideoAsset asset) {
            return new VideoAdminView(asset.getId(), asset.getLessonId(), asset.getStoragePath(),
                    asset.getStatus(), asset.getMime(), asset.getSizeBytes(),
                    asset.getDurationSeconds(), asset.getExternalUrl(),
                    asset.getCreatedAt(), asset.getUpdatedAt());
        }
    }
}
