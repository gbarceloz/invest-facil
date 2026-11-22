package com.investfacil.api.videos;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VideoAssetRepository extends JpaRepository<VideoAsset, UUID> {

    Optional<VideoAsset> findByLessonId(UUID lessonId);

    List<VideoAsset> findAllByOrderByCreatedAtDesc();
}
