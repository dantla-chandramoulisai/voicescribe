package com.voicescribe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class TranscriptionDTO {

    // ─── Response DTO ────────────────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranscriptionResponse {
        private Long id;
        private String transcribedText;
        private String sourceType;
        private String fileName;
        private Integer durationSeconds;
        private Integer wordCount;
        private Double confidence;
        private String language;
        private LocalDateTime createdAt;
    }

    // ─── Stats Response ───────────────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsResponse {
        private long totalTranscriptions;
        private long totalWords;
        private long totalChars;
    }

    // ─── Deepgram API Response (internal mapping) ─────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeepgramResponse {
        private Results results;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Results {
            private List<Channel> channels;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Channel {
            private List<Alternative> alternatives;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Alternative {
            private String transcript;
            private Double confidence;
            private List<Word> words;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Word {
            private String word;
            private Double start;
            private Double end;
            private Double confidence;
        }
    }

    // ─── API Response Wrapper ─────────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data) {
            return new ApiResponse<>(true, "Success", data);
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }

        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(false, message, null);
        }
    }
}
