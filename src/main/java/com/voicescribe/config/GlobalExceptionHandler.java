package com.voicescribe.config;

import com.voicescribe.dto.TranscriptionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<TranscriptionDTO.ApiResponse<Void>> handleMaxSize(MaxUploadSizeExceededException e) {
        return ResponseEntity.badRequest()
                .body(TranscriptionDTO.ApiResponse.error("File too large. Maximum size is 50MB."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<TranscriptionDTO.ApiResponse<Void>> handleRuntime(RuntimeException e) {
        log.error("Runtime error: {}", e.getMessage());
        return ResponseEntity.internalServerError()
                .body(TranscriptionDTO.ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<TranscriptionDTO.ApiResponse<Void>> handleGeneral(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError()
                .body(TranscriptionDTO.ApiResponse.error("An unexpected error occurred."));
    }
}
