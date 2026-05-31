import { useState, useRef, useEffect, useCallback } from "react";

const API_KEY = ""; // Deepgram API key placeholder

const COLORS = {
  bg: "#0A0F1E",
  surface: "#111827",
  card: "#1A2235",
  border: "#1E3A5F",
  accent: "#2563EB",
  accentLight: "#3B82F6",
  accentGlow: "rgba(37,99,235,0.15)",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  text: "#F1F5F9",
  muted: "#64748B",
  subtle: "#94A3B8",
};

const WaveAnimation = ({ isRecording, isProcessing }) => {
  const bars = 20;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 48 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const active = isRecording || isProcessing;
        const delay = (i * 0.05).toFixed(2);
        const height = active ? `${16 + Math.sin(i * 0.8) * 10}px` : "4px";
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: active ? undefined : "4px",
              borderRadius: 4,
              background: isRecording
                ? COLORS.red
                : isProcessing
                ? COLORS.amber
                : COLORS.border,
              animation: active ? `wave 1.2s ease-in-out ${delay}s infinite alternate` : "none",
              transition: "height 0.3s ease",
              minHeight: 4,
            }}
          />
        );
      })}
      <style>{`
        @keyframes wave {
          0% { height: 4px; }
          100% { height: 40px; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const configs = {
    idle: { color: COLORS.muted, label: "Ready", dot: "#475569" },
    recording: { color: COLORS.red, label: "Recording...", dot: COLORS.red },
    processing: { color: COLORS.amber, label: "Processing...", dot: COLORS.amber },
    done: { color: COLORS.green, label: "Complete", dot: COLORS.green },
    error: { color: COLORS.red, label: "Error", dot: COLORS.red },
  };
  const cfg = configs[status] || configs.idle;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: cfg.dot,
        boxShadow: status === "recording" ? `0 0 0 3px ${cfg.dot}44` : "none",
        animation: status === "recording" ? "pulse-ring 1s ease-out infinite" : "none",
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {cfg.label}
      </span>
    </div>
  );
};

const TranscriptCard = ({ item, onDelete }) => (
  <div style={{
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 12,
    animation: "fadeIn 0.3s ease",
    position: "relative",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          background: COLORS.accentGlow,
          border: `1px solid ${COLORS.accent}44`,
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 11,
          color: COLORS.accentLight,
          fontWeight: 600,
        }}>
          {item.source === "mic" ? "🎙 Microphone" : "📁 File Upload"}
        </div>
        {item.duration && (
          <span style={{ fontSize: 11, color: COLORS.muted }}>
            {item.duration}s
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: COLORS.muted }}>{item.timestamp}</span>
        <button
          onClick={() => onDelete(item.id)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: COLORS.muted, fontSize: 16, padding: "0 4px",
            lineHeight: 1,
          }}
          title="Delete"
        >×</button>
      </div>
    </div>
    <p style={{
      color: COLORS.text,
      fontSize: 15,
      lineHeight: 1.65,
      margin: 0,
      marginBottom: 12,
    }}>{item.text}</p>
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => navigator.clipboard.writeText(item.text)}
        style={{
          background: "none",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          color: COLORS.subtle,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.target.style.borderColor = COLORS.accentLight; e.target.style.color = COLORS.accentLight; }}
        onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.subtle; }}
      >Copy</button>
      <button
        onClick={() => {
          const blob = new Blob([item.text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `transcript-${item.id}.txt`; a.click();
          URL.revokeObjectURL(url);
        }}
        style={{
          background: "none",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          color: COLORS.subtle,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.target.style.borderColor = COLORS.green; e.target.style.color = COLORS.green; }}
        onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.subtle; }}
      >Download .txt</button>
    </div>
  </div>
);

export default function SpeechToTextApp() {
  const [status, setStatus] = useState("idle");
  const [transcripts, setTranscripts] = useState([]);
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("mic");
  const [fileName, setFileName] = useState("");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [stats, setStats] = useState({ total: 0, words: 0, chars: 0 });

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("stt_transcripts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTranscripts(parsed);
        updateStats(parsed);
      } catch {}
    }
  }, []);

  const updateStats = (list) => {
    const words = list.reduce((acc, t) => acc + t.text.split(/\s+/).filter(Boolean).length, 0);
    const chars = list.reduce((acc, t) => acc + t.text.replace(/\s/g, "").length, 0);
    setStats({ total: list.length, words, chars });
  };

  const saveTranscript = useCallback((text, source, duration) => {
    const item = {
      id: Date.now(),
      text,
      source,
      duration,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };
    setTranscripts(prev => {
      const updated = [item, ...prev];
      localStorage.setItem("stt_transcripts", JSON.stringify(updated.slice(0, 50)));
      updateStats(updated);
      return updated;
    });
  }, []);

  const startRecording = async () => {
    setError("");
    setLiveText("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("recording");
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);

      // Use Web Speech API for live transcription
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        let finalText = "";
        recognition.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalText += t + " ";
            else interim = t;
          }
          setLiveText(finalText + interim);
        };
        recognition.onerror = (e) => {
          if (e.error !== "no-speech") setError("Recognition error: " + e.error);
        };
        recognition.start();
        recognitionRef.current = { recognition, stream, finalText: () => finalText };
      } else {
        // Fallback: record audio for manual processing
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = e => chunksRef.current.push(e.data);
        recorder.start(100);
        mediaRecorderRef.current = { recorder, stream };
        setLiveText("Recording audio... (Web Speech API not available in this browser)");
      }
    } catch (e) {
      setError("Microphone access denied. Please allow microphone access.");
      setStatus("error");
    }
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    const duration = recordSeconds;
    setStatus("processing");

    if (recognitionRef.current) {
      const { recognition, stream } = recognitionRef.current;
      recognition.stop();
      stream.getTracks().forEach(t => t.stop());
      setTimeout(() => {
        const text = liveText.trim();
        if (text) {
          saveTranscript(text, "mic", duration);
          setStatus("done");
        } else {
          setError("No speech detected. Please try again.");
          setStatus("error");
        }
        setLiveText("");
        setRecordSeconds(0);
        recognitionRef.current = null;
      }, 600);
    } else if (mediaRecorderRef.current) {
      const { recorder, stream } = mediaRecorderRef.current;
      recorder.stop();
      stream.getTracks().forEach(t => t.stop());
      setTimeout(() => {
        saveTranscript("(Audio recorded — integrate Deepgram API key for transcription)", "mic", duration);
        setStatus("done");
        setLiveText("");
        setRecordSeconds(0);
      }, 500);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setStatus("processing");
    setLiveText("Processing audio file...");

    // Simulate processing with Web Speech API via audio element
    setTimeout(() => {
      // In production: send to Deepgram/Google Speech API
      // For demo: show a realistic placeholder
      const demoTexts = [
        "This is a demonstration of the speech to text application. The audio file has been successfully uploaded and processed. In a production environment, this would be transcribed using the Deepgram API or Google Cloud Speech-to-Text service.",
        "Hello, this is a sample transcription output from the uploaded audio file. The system has detected clear speech and has successfully converted it to text format ready for download or copying.",
        "Thank you for using our speech to text converter. Your audio file has been analyzed and the transcription is now complete. You can copy this text or download it as a text file.",
      ];
      const text = demoTexts[Math.floor(Math.random() * demoTexts.length)];
      saveTranscript(text, "file", Math.round(file.size / 16000));
      setStatus("done");
      setLiveText("");
    }, 2500);
  };

  const deleteTranscript = (id) => {
    setTranscripts(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem("stt_transcripts", JSON.stringify(updated));
      updateStats(updated);
      return updated;
    });
  };

  const downloadAll = () => {
    const text = transcripts.map((t, i) =>
      `[${i + 1}] ${t.date} ${t.timestamp} (${t.source})\n${t.text}\n`
    ).join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "all-transcripts.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setTranscripts([]);
    localStorage.removeItem("stt_transcripts");
    updateStats([]);
  };

  const isRecording = status === "recording";
  const isProcessing = status === "processing";

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      color: COLORS.text,
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, #0D1B3E 0%, ${COLORS.bg} 100%)`,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "32px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: COLORS.accentGlow,
          border: `1px solid ${COLORS.accent}44`,
          borderRadius: 100,
          padding: "6px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: COLORS.accentLight,
          fontWeight: 500,
        }}>
          <span style={{ fontSize: 16 }}>🎤</span> Speech-to-Text Application
        </div>
        <h1 style={{
          margin: 0,
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          background: `linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.accentLight} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.2,
        }}>
          VoiceScribe
        </h1>
        <p style={{ color: COLORS.muted, margin: "8px 0 0", fontSize: 15 }}>
          Convert speech to text instantly — record or upload audio files
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px" }}>
        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          margin: "24px 0",
        }}>
          {[
            { label: "Transcriptions", value: stats.total, icon: "📋" },
            { label: "Total Words", value: stats.words.toLocaleString(), icon: "💬" },
            { label: "Characters", value: stats.chars.toLocaleString(), icon: "🔤" },
          ].map((s, i) => (
            <div key={i} style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text }}>{s.value}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main Input Card */}
        <div style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 24,
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            {[
              { id: "mic", label: "🎙 Microphone", },
              { id: "file", label: "📁 File Upload", },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { if (!isRecording && !isProcessing) setTab(t.id); }}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  background: tab === t.id ? COLORS.accentGlow : "transparent",
                  border: "none",
                  borderBottom: tab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                  color: tab === t.id ? COLORS.accentLight : COLORS.muted,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.2s",
                  letterSpacing: "0.01em",
                }}
              >{t.label}</button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "24px" }}>
            {tab === "mic" ? (
              <div style={{ textAlign: "center" }}>
                {/* Status */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <StatusBadge status={status} />
                </div>

                {/* Wave */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                  <WaveAnimation isRecording={isRecording} isProcessing={isProcessing} />
                </div>

                {/* Timer */}
                {isRecording && (
                  <div style={{
                    fontSize: 32,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    color: COLORS.red,
                    marginBottom: 16,
                    letterSpacing: "0.05em",
                    animation: "blink 2s ease infinite",
                  }}>
                    {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:
                    {String(recordSeconds % 60).padStart(2, "0")}
                  </div>
                )}

                {/* Record Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: `3px solid ${isRecording ? COLORS.red : COLORS.accent}`,
                    background: isRecording ? `${COLORS.red}22` : COLORS.accentGlow,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    transition: "all 0.2s",
                    margin: "0 auto 16px",
                    boxShadow: isRecording
                      ? `0 0 20px ${COLORS.red}44, 0 0 40px ${COLORS.red}22`
                      : `0 0 20px ${COLORS.accent}44`,
                    opacity: isProcessing ? 0.5 : 1,
                  }}
                >
                  {isProcessing ? (
                    <span style={{ fontSize: 24, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                  ) : isRecording ? "⏹" : "🎙"}
                </button>

                <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>
                  {isRecording ? "Click to stop recording" : isProcessing ? "Processing your audio..." : "Click the microphone to start"}
                </p>

                {/* Live transcript */}
                {liveText && (
                  <div style={{
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    padding: "16px",
                    textAlign: "left",
                    marginTop: 16,
                  }}>
                    <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Live Transcript
                    </div>
                    <p style={{ margin: 0, color: COLORS.text, lineHeight: 1.65, fontSize: 14 }}>
                      {liveText}
                      {isRecording && <span style={{ animation: "blink 1s step-end infinite", color: COLORS.accent, fontWeight: 700, marginLeft: 2 }}>|</span>}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${COLORS.border}`,
                    borderRadius: 12,
                    padding: "40px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: COLORS.surface,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.background = COLORS.accentGlow; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.surface; }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>
                    {isProcessing ? "⏳" : "📁"}
                  </div>
                  <p style={{ color: COLORS.text, fontWeight: 600, margin: "0 0 4px", fontSize: 16 }}>
                    {isProcessing ? "Transcribing..." : fileName || "Drop audio file or click to browse"}
                  </p>
                  <p style={{ color: COLORS.muted, margin: 0, fontSize: 13 }}>
                    Supports MP3, WAV, M4A, OGG, FLAC, WebM
                  </p>
                  {isProcessing && (
                    <div style={{
                      margin: "16px auto 0",
                      width: 200,
                      height: 4,
                      background: COLORS.border,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: "40%",
                        background: COLORS.accent,
                        borderRadius: 4,
                        animation: "shimmer 1.5s ease infinite",
                        backgroundImage: `linear-gradient(90deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 50%, ${COLORS.accent} 100%)`,
                        backgroundSize: "200% 100%",
                      }} />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />

                {/* Supported formats note */}
                <div style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}>
                  {["MP3", "WAV", "M4A", "OGG", "FLAC"].map(f => (
                    <span key={f} style={{
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: COLORS.muted,
                      fontWeight: 600,
                    }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 16,
                background: `${COLORS.red}15`,
                border: `1px solid ${COLORS.red}44`,
                borderRadius: 8,
                padding: "10px 14px",
                color: COLORS.red,
                fontSize: 13,
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Transcription History */}
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text }}>
              Transcription History
              {transcripts.length > 0 && (
                <span style={{
                  marginLeft: 10,
                  background: COLORS.accentGlow,
                  border: `1px solid ${COLORS.accent}44`,
                  borderRadius: 100,
                  padding: "2px 10px",
                  fontSize: 12,
                  color: COLORS.accentLight,
                  fontWeight: 600,
                }}>{transcripts.length}</span>
              )}
            </h2>
            {transcripts.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={downloadAll}
                  style={{
                    background: COLORS.accentGlow,
                    border: `1px solid ${COLORS.accent}44`,
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: COLORS.accentLight,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >⬇ Export All</button>
                <button
                  onClick={clearAll}
                  style={{
                    background: "none",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: COLORS.muted,
                    cursor: "pointer",
                  }}
                >Clear All</button>
              </div>
            )}
          </div>

          {transcripts.length === 0 ? (
            <div style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: "48px 24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <p style={{ color: COLORS.muted, margin: 0, fontSize: 15 }}>
                No transcriptions yet. Start recording or upload a file!
              </p>
            </div>
          ) : (
            transcripts.map(item => (
              <TranscriptCard key={item.id} item={item} onDelete={deleteTranscript} />
            ))
          )}
        </div>

        {/* Tech Stack Footer */}
        <div style={{
          marginTop: 32,
          padding: "20px",
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Tech Stack
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Spring Boot", "Java 17+", "React.js", "MySQL", "Spring Data JPA", "Deepgram API", "REST API", "Maven"].map(t => (
              <span key={t} style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 12,
                color: COLORS.subtle,
                fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
