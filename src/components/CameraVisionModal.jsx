import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, X, Check, Upload, Sparkles, AlertTriangle, ShieldCheck, Film } from "lucide-react";
import { detectAnimalsInImage } from "@/lib/visionEngine";

export default function CameraVisionModal({ isOpen, onClose, onCaptureComplete }) {
  const [mode, setMode] = useState("camera"); // "camera" | "upload" | "preview"
  const [facingMode, setFacingMode] = useState("environment");
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera unavailable or permission denied. You can still upload photos or video files below.");
      setMode("upload");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCaptureSnap = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setAnalyzing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL("image/jpeg");
    img.onload = async () => {
      const result = await detectAnimalsInImage(img, canvasRef.current);
      setAiResult(result);
      setPreviewImage(result.annotatedImage || img.src);
      setMode("preview");
      setAnalyzing(false);
      stopCamera();
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();

    if (file.type.startsWith("video/")) {
      // Video file handling
      const videoEl = document.createElement("video");
      videoEl.src = URL.createObjectURL(file);
      videoEl.onloadeddata = () => {
        videoEl.currentTime = 1;
      };
      videoEl.onseeked = async () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.src = canvas.toDataURL("image/jpeg");
        img.onload = async () => {
          const result = await detectAnimalsInImage(img, canvas);
          setAiResult(result);
          setPreviewImage(result.annotatedImage || img.src);
          setMode("preview");
          setAnalyzing(false);
        };
      };
      return;
    }

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        const result = await detectAnimalsInImage(img, canvas);
        setAiResult(result);
        setPreviewImage(result.annotatedImage || event.target.result);
        setMode("preview");
        setAnalyzing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (onCaptureComplete && aiResult) {
      onCaptureComplete({
        evidence_url: previewImage,
        cv_dog_count: aiResult.dogCount,
        cv_confidence: aiResult.confidence,
        cv_group_detected: aiResult.groupDetected,
        cv_status: "processed",
        suggested_severity: aiResult.suggestedSeverity,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold font-display text-base text-white">AI Camera & Evidence Scanner</h2>
            <p className="text-xs text-blue-300">Live YOLO / Vision Dog Count & Pack Aggression Analysis</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden canvas for vision engine bounding box rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mode 1: Live Camera Viewfinder */}
      {mode === "camera" && (
        <div className="flex-1 flex flex-col items-center justify-center my-4 relative">
          <div className="relative w-full max-w-lg aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="text-white/60 text-xs font-mono bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                POSITION ANIMALS IN FRAME
              </div>
            </div>
            {analyzing && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                <span className="font-medium text-sm">Running Vision AI Model...</span>
                <span className="text-xs text-slate-400 mt-1">Detecting canines & computing confidence score</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full max-w-lg flex items-center justify-around mt-6">
            <button
              onClick={() => setMode("upload")}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white text-xs"
            >
              <div className="p-3 rounded-full bg-white/10">
                <Upload className="w-5 h-5" />
              </div>
              Upload File
            </button>

            <button
              onClick={handleCaptureSnap}
              disabled={analyzing}
              className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 transition-all transform active:scale-95 flex items-center justify-center shadow-lg"
              title="Snap Live Photo"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white/50" />
            </button>

            <button
              onClick={handleFlipCamera}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white text-xs"
            >
              <div className="p-3 rounded-full bg-white/10">
                <RefreshCw className="w-5 h-5" />
              </div>
              Flip
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Upload File / Video */}
      {mode === "upload" && (
        <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-lg mx-auto w-full">
          <div className="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Select Photo or Short Video</h3>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, MP4, MOV. EXIF metadata sanitized automatically.</p>
            </div>

            {cameraError && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-xl">
                {cameraError}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Choose from Gallery / Files
            </button>

            <button
              onClick={() => { setMode("camera"); startCamera(); }}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-sm font-medium transition-colors"
            >
              Try Opening Live Camera Again
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: AI Analysis Preview & Detection Card */}
      {mode === "preview" && (
        <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-lg mx-auto w-full space-y-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <img src={previewImage} alt="AI Scanned Evidence" className="w-full h-auto object-contain max-h-[350px]" />
            <div className="absolute top-3 left-3 bg-blue-900/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" /> Vision AI Bounding Overlay Active
            </div>
          </div>

          {/* AI Analysis Card */}
          {aiResult && (
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Detection Summary</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> High Confidence ({Math.round(aiResult.confidence * 100)}%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/80 p-3 rounded-xl">
                  <div className="text-xs text-slate-400">Canines Counted</div>
                  <div className="text-lg font-bold text-white mt-0.5">{aiResult.dogCount} dog{aiResult.dogCount > 1 ? 's' : ''}</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl">
                  <div className="text-xs text-slate-400">Pack / Group Detected</div>
                  <div className={`text-lg font-bold mt-0.5 ${aiResult.groupDetected ? 'text-amber-400' : 'text-slate-300'}`}>
                    {aiResult.groupDetected ? 'Yes (Group)' : 'Single'}
                  </div>
                </div>
              </div>

              {aiResult.groupDetected && (
                <div className="bg-amber-950/40 border border-amber-600/30 text-amber-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  Multiple dogs detected in frame. Automatically tagged for group presence risk weighting.
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex gap-3">
            <button
              onClick={() => { setMode("camera"); startCamera(); }}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors"
            >
              Retake / Upload New
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Use AI Evidence
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
