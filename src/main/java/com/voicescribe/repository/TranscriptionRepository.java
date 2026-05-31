package com.voicescribe.repository;

import com.voicescribe.model.Transcription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranscriptionRepository extends JpaRepository<Transcription, Long> {

    // Find all ordered by newest first
    List<Transcription> findAllByOrderByCreatedAtDesc();

    // Find by source type
    List<Transcription> findBySourceTypeOrderByCreatedAtDesc(String sourceType);

    // Count total words across all transcriptions
    @Query("SELECT COALESCE(SUM(t.wordCount), 0) FROM Transcription t")
    Long sumTotalWords();

    // Count total characters
    @Query("SELECT COALESCE(SUM(LENGTH(t.transcribedText)), 0) FROM Transcription t")
    Long sumTotalChars();
}
