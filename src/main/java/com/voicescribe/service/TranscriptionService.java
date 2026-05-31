package com.voicescribe.service;

import com.voicescribe.dto.TranscriptionDTO;
import com.voicescribe.model.Transcription;
import com.voicescribe.repository.TranscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TranscriptionService {

    private final TranscriptionRepository transcriptionRepository;
    private final DeepgramService deepgramService;

    /**
     * Transcribes an uploaded audio file via Deepgram and saves result to DB.
     */
    public TranscriptionDTO.TranscriptionResponse transcribeFile(MultipartFile file)
            throws IOException, InterruptedException {

        log.info("Transcribing file: {}", file.getOriginalFilename());

        // Call Deepgram API
        TranscriptionDTO.DeepgramResponse deepgramResponse = deepgramService.transcribeAudio(file);

        String transcript = deepgramService.extractTranscript(deepgramResponse);
        Double confidence = deepgramService.extractConfidence(deepgramResponse);

        if (transcript == null || transcript.isBlank()) {
            throw new RuntimeException("No speech detected in the audio file.");
        }

        int wordCount = transcript.split("\\s+").length;

        // Save to database
        Transcription entity = new Transcription();
        entity.setTranscribedText(transcript);
        entity.setSourceType("file");
        entity.setFileName(file.getOriginalFilename());
        entity.setWordCount(wordCount);
        entity.setConfidence(confidence);
        entity.setLanguage("en-US");

        Transcription saved = transcriptionRepository.save(entity);
        log.info("Saved transcription id={} words={}", saved.getId(), wordCount);

        return toResponse(saved);
    }

    /**
     * Saves a transcript received from browser's Web Speech API (microphone).
     */
    public TranscriptionDTO.TranscriptionResponse saveMicrophoneTranscript(
            String text, Integer durationSeconds) {

        log.info("Saving microphone transcript, length={}", text.length());

        int wordCount = text.split("\\s+").length;

        Transcription entity = new Transcription();
        entity.setTranscribedText(text);
        entity.setSourceType("microphone");
        entity.setDurationSeconds(durationSeconds);
        entity.setWordCount(wordCount);
        entity.setLanguage("en-US");

        Transcription saved = transcriptionRepository.save(entity);
        return toResponse(saved);
    }

    /**
     * Returns all transcriptions ordered by newest first.
     */
    public List<TranscriptionDTO.TranscriptionResponse> getAllTranscriptions() {
        return transcriptionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single transcription by id.
     */
    public TranscriptionDTO.TranscriptionResponse getById(Long id) {
        Transcription t = transcriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transcription not found with id: " + id));
        return toResponse(t);
    }

    /**
     * Deletes a transcription by id.
     */
    public void deleteById(Long id) {
        if (!transcriptionRepository.existsById(id)) {
            throw new RuntimeException("Transcription not found with id: " + id);
        }
        transcriptionRepository.deleteById(id);
        log.info("Deleted transcription id={}", id);
    }

    /**
     * Returns overall usage statistics.
     */
    public TranscriptionDTO.StatsResponse getStats() {
        long total = transcriptionRepository.count();
        long words = transcriptionRepository.sumTotalWords();
        long chars = transcriptionRepository.sumTotalChars();
        return new TranscriptionDTO.StatsResponse(total, words, chars);
    }

    /**
     * Maps entity to response DTO.
     */
    private TranscriptionDTO.TranscriptionResponse toResponse(Transcription t) {
        return new TranscriptionDTO.TranscriptionResponse(
                t.getId(),
                t.getTranscribedText(),
                t.getSourceType(),
                t.getFileName(),
                t.getDurationSeconds(),
                t.getWordCount(),
                t.getConfidence(),
                t.getLanguage(),
                t.getCreatedAt()
        );
    }
}
