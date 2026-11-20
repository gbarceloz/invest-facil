package com.investfacil.api.videos;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
public class VideoController {

    private final VideoService videos;

    public VideoController(VideoService videos) {
        this.videos = videos;
    }

    /** Público: URL assinada de curta duração; nunca expõe o storage_path. */
    @GetMapping("/api/v1/content/lessons/{slug}/video")
    public VideoDtos.VideoView playback(@PathVariable String slug) {
        return videos.playbackBySlug(slug);
    }

    @PostMapping(value = "/api/v1/admin/videos/{lessonId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoDtos.VideoAdminView> upload(
            @PathVariable UUID lessonId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videos.upload(lessonId, file));
    }

    @GetMapping("/api/v1/admin/videos")
    public List<VideoDtos.VideoAdminView> list() {
        return videos.list();
    }
}
