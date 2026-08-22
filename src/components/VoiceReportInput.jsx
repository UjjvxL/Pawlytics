/**
 * Pawlytics Multilingual Voice Incident Reporting Component
 * Converts spoken Hindi / English / Regional speech into structured report fields.
 */

import { useState } from "react";
import { Mic, MicOff, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

export default function VoiceReportInput({ onStructuredVoiceResult }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("hi-IN"); // Default Hindi (India)
  const [voiceParsed, setVoiceParsed] = useState(null);

  const startVoiceIngestion = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser version. You can type description manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log("Voice transcript:", spokenText);
        setTranscript(spokenText);
        parseSpokenTranscript(spokenText);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition init exception:", err);
      setIsListening(false);
    }
  };

  const parseSpokenTranscript = (text) => {
    const lower = text.toLowerCase();

    // Natural Language Field Extraction Logic
    let dogCount = 1;
    if (lower.includes("3") || lower.includes("तीन") || lower.includes("three")) dogCount = 3;
    else if (lower.includes("2") || lower.includes("दो") || lower.includes("two")) dogCount = 2;
    else if (lower.includes("4") || lower.includes("चार") || lower.includes("four")) dogCount = 4;
    else if (lower.includes("5") || lower.includes("पांच") || lower.includes("five")) dogCount = 5;

    let severityLevel = 1;
    let category = "sighting";

    if (lower.includes("काटा") || lower.includes("bite") || lower.includes("attack") || lower.includes("काट लिया")) {
      severityLevel = 5;
      category = "contact_bite";
    } else if (lower.includes("आक्रामक") || lower.includes("aggressive") || lower.includes("भौंक रहे") || lower.includes("barking")) {
      severityLevel = 4;
      category = "aggressive_interaction";
    } else if (lower.includes("पीछे भागा") || lower.includes("chasing") || lower.includes("chase") || lower.includes("भाग रहे")) {
      severityLevel = 3;
      category = "chase";
    }

    const parsed = {
      transcript: text,
      dogCount,
      severityLevel,
      category,
      context_tags: dogCount >= 2 ? ["group_presence"] : [],
    };

    setVoiceParsed(parsed);
    if (onStructuredVoiceResult) {
      onStructuredVoiceResult(parsed);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-slate-100">Multilingual Voice Assistant</span>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 outline-none"
        >
          <option value="hi-IN">🇮🇳 Hindi (हिंदी)</option>
          <option value="en-IN">🇬🇧 English (India)</option>
          <option value="mr-IN">🇮🇳 Marathi (मराठी)</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={startVoiceIngestion}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            isListening
              ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" /> Listening... Speak now
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-amber-300" /> Tap to Speak Report
            </>
          )}
        </button>
      </div>

      {transcript && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-xs space-y-2">
          <div className="text-slate-400 font-medium">Transcribed Speech:</div>
          <div className="text-slate-200 italic">"{transcript}"</div>

          {voiceParsed && (
            <div className="pt-2 border-t border-slate-700 flex flex-wrap items-center gap-2 text-amber-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Parsed: {voiceParsed.dogCount} dog(s)</span>
              <span>· Severity L{voiceParsed.severityLevel}</span>
              <span>· Category: {voiceParsed.category}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
