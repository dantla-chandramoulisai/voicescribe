package com.voicescribe.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voicescribe.dto.TranscriptionDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class DeepgramService {

    @Value("${deepgram.api.key}")
    private String deepgramApiKey;

    private static final String DEEPGRAM_URL =
            "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=false";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Transcribes an audio file using Deepgram Nova-2 model.
     */
    public TranscriptionDTO.DeepgramResponse transcribeAudio(MultipartFile audioFile)
            throws IOException, InterruptedException {

        byte[] audioBytes = audioFile.getBytes();
        String contentType = resolveContentType(audioFile.getOriginalFilename());

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(DEEPGRAM_URL))
                .header("Authorization", "Token " + deepgramApiKey)
                .header("Content-Type", contentType)
                .POST(HttpRequest.BodyPublishers.ofByteArray(audioBytes))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Deepgram API error: " + response.statusCode() + " - " + response.body());
        }

        return objectMapper.readValue(response.body(), TranscriptionDTO.DeepgramResponse.class);
    }

    /**
     * Extracts the transcript text from the Deepgram response.
     */
    public String extractTranscript(TranscriptionDTO.DeepgramResponse response) {
        if (response == null
                || response.getResults() == null
                || response.getResults().getChannels() == null
                || response.getResults().getChannels().isEmpty()) {
            return "";
        }
        var channel = response.getResults().getChannels().get(0);
        if (channel.getAlternatives() == null || channel.getAlternatives().isEmpty()) {
            return "";
        }
        return channel.getAlternatives().get(0).getTranscript();
    }

    /**
     * Extracts the confidence score from the Deepgram response.
     */
    public Double extractConfidence(TranscriptionDTO.DeepgramResponse response) {
        try {
            return response.getResults().getChannels().get(0)
                    .getAlternatives().get(0).getConfidence();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Resolves content type based on file extension.
     */
    private String resolveContentType(String filename) {
        if (filename == null) return "audio/wav";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".mp3"))  return "audio/mp3";
        if (lower.endsWith(".wav"))  return "audio/wav";
        if (lower.endsWith(".m4a"))  return "audio/m4a";
        if (lower.endsWith(".ogg"))  return "audio/ogg";
        if (lower.endsWith(".flac")) return "audio/flac";
        if (lower.endsWith(".webm")) return "audio/webm";
        return "audio/wav";
    }
}
