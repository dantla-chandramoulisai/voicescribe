package com.voicescribe.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "transcriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transcription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transcribed_text", columnDefinition = "TEXT", nullable = false)
    private String transcribedText;

    @Column(name = "source_type", nullable = false)
    private String sourceType; // "microphone" or "file"

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "language", length = 10)
    private String language = "en-US";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
