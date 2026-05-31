package com.voicescribe.controller;

import com.voicescribe.dto.TranscriptionDTO;
import com.voicescribe.service.TranscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TranscriptionController {

    private final TranscriptionService transcriptionService;

    // ─── POST /api/transcribe ─────────────────────────────────────────────────────
    // Upload an audio file → get transcription back
    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TranscriptionDTO.ApiResponse<TranscriptionDTO.TranscriptionResponse>> transcribeFile(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(TranscriptionDTO.ApiResponse.error("No audio file provided."));
        }

        log.info("Received file: {} size: {} bytes", file.getOriginalFilename(), file.getSize());

        try {
            TranscriptionDTO.TranscriptionResponse result = transcriptionService.transcribeFile(file);
            return ResponseEntity.ok(TranscriptionDTO.ApiResponse.success("Transcription successful!", result));
        } catch (Exception e) {
            log.error("Transcription failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(TranscriptionDTO.ApiResponse.error("Transcription failed: " + e.getMessage()));
        }
    }

    // ─── POST /api/transcribe/microphone ─────────────────────────────────────────
    // Save a transcript from the browser Web Speech API
    @PostMapping("/transcribe/microphone")
    public ResponseEntity<TranscriptionDTO.ApiResponse<TranscriptionDTO.TranscriptionResponse>> saveMicTranscript(
            @RequestBody Map<String, Object> body) {

        String text = (String) body.get("text");
        Integer duration = body.get("duration") != null
                ? Integer.parseInt(body.get("duration").toString()) : null;

        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(TranscriptionDTO.ApiResponse.error("Transcript text is required."));
        }

        try {
            TranscriptionDTO.TranscriptionResponse result =
                    transcriptionService.saveMicrophoneTranscript(text, duration);
            return ResponseEntity.ok(TranscriptionDTO.ApiResponse.success("Transcript saved!", result));
        } catch (Exception e) {
            log.error("Save mic transcript failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(TranscriptionDTO.ApiResponse.error("Failed to save: " + e.getMessage()));
        }
    }

    // ─── GET /api/history ────────────────────────────────────────────────────────
    // Get all transcriptions
    @GetMapping("/history")
    public ResponseEntity<TranscriptionDTO.ApiResponse<List<TranscriptionDTO.TranscriptionResponse>>> getHistory() {
        List<TranscriptionDTO.TranscriptionResponse> list = transcriptionService.getAllTranscriptions();
        return ResponseEntity.ok(TranscriptionDTO.ApiResponse.success(list));
    }

    // ─── GET /api/history/{id} ────────────────────────────────────────────────────
    @GetMapping("/history/{id}")
    public ResponseEntity<TranscriptionDTO.ApiResponse<TranscriptionDTO.TranscriptionResponse>> getOne(
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    TranscriptionDTO.ApiResponse.success(transcriptionService.getById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── DELETE /api/history/{id} ─────────────────────────────────────────────────
    @DeleteMapping("/history/{id}")
    public ResponseEntity<TranscriptionDTO.ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            transcriptionService.deleteById(id);
            return ResponseEntity.ok(TranscriptionDTO.ApiResponse.success("Deleted successfully.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── GET /api/download/{id} ───────────────────────────────────────────────────
    // Download a transcript as a .txt file
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        try {
            TranscriptionDTO.TranscriptionResponse item = transcriptionService.getById(id);
            byte[] content = item.getTranscribedText().getBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"transcript-" + id + ".txt\"")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── GET /api/stats ───────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<TranscriptionDTO.ApiResponse<TranscriptionDTO.StatsResponse>> getStats() {
        return ResponseEntity.ok(
                TranscriptionDTO.ApiResponse.success(transcriptionService.getStats()));
    }

    // ─── GET /api/health ─────────────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "VoiceScribe API"));
    }
}
