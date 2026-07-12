import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  User,
  Volume2,
  ShieldAlert,
} from "lucide-react";
import { User as UserType } from "../../types";

interface VideoCallOverlayProps {
  currentUser: UserType;
  partner: UserType;
  onClose: () => void;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  currentUser,
  partner,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Media streams refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [screenPermissionError, setScreenPermissionError] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Request Camera & Mic Stream
  const startCamera = async () => {
    try {
      setCameraPermissionError(false);
      // Terminate any existing stream first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVideoOff,
        audio: !isMuted,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Could not access camera/mic: ", err);
      setCameraPermissionError(true);
    }
  };

  // Request Screen Share Stream
  const startScreenShare = async () => {
    try {
      setScreenPermissionError(false);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      screenStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Handle user stopping screen share via browser bar
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
        }
      };
    } catch (err) {
      console.warn("Could not share screen: ", err);
      setScreenPermissionError(true);
      setIsScreenSharing(false);
    }
  };

  // Stop Screen Share Stream
  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  };

  // Manage Local Stream when Mute/Video states change
  useEffect(() => {
    if (!isVideoOff || !isMuted) {
      startCamera();
    } else {
      // If both are disabled, we can stop the track feeds to save power/hardware indicators
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isMuted, isVideoOff]);

  // Manage Screen Sharing
  useEffect(() => {
    if (isScreenSharing) {
      startScreenShare();
    } else {
      stopScreenShare();
    }

    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isScreenSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between text-white p-4 font-sans select-none animate-fade-in">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/5 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-error-500 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-300">
            Live WebRTC session
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white font-mono">
            {formatTime(callDuration)}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Connected with</span>
          <span className="font-semibold text-white">{partner.name}</span>
        </div>
      </div>

      {/* Main Video Arena */}
      <div className="flex-1 my-4 relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-inner flex items-center justify-center">
        {isScreenSharing && !screenPermissionError ? (
          // Screen Share Stream Main Panel
          <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold flex items-center space-x-2">
              <Monitor size={14} className="text-primary-500" />
              <span>Your Screen Share</span>
            </div>
          </div>
        ) : (
          // Remote Peer Stream main window (Mock stream backdrop)
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-primary-950">
            {/* Animated peer visual backdrop */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] pointer-events-none"></div>

            <div className="flex flex-col items-center space-y-4 z-10 text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                  {partner.avatarUrl ? (
                    <img
                      src={partner.avatarUrl}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-slate-400" />
                  )}
                </div>
                {/* Audio wave indicator mock */}
                {!isMuted && (
                  <div className="absolute -inset-2 rounded-full border border-primary-500/20 animate-ping pointer-events-none"></div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{partner.name}</h3>
                <p className="text-xs text-slate-400 mt-1 capitalize">
                  {partner.role}
                </p>
              </div>
            </div>

            {/* Remote audio label */}
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center space-x-1.5">
              <Volume2 size={14} className="text-slate-400" />
              <span>{partner.name}'s Audio (Active)</span>
            </div>
          </div>
        )}

        {/* Draggable/Floating Local Stream window (Picture-in-Picture) */}
        <div className="absolute right-4 bottom-4 w-44 sm:w-56 aspect-[4/3] rounded-xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950 z-20 transition-all hover:scale-105">
          {!isVideoOff && !cameraPermissionError ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Local video must be muted to avoid feedback loop
              className="w-full h-full object-cover transform -scale-x-100" // Mirror local stream
            />
          ) : (
            // Local preview fallback (when camera is off)
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-1">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate w-full">
                {currentUser.name} (You)
              </span>
              <span className="text-[8px] text-slate-500 uppercase mt-0.5">
                Camera Off
              </span>
            </div>
          )}

          {/* Label overlay on PiP */}
          <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-medium text-slate-200">
            You (Local Feed)
          </div>
        </div>

        {/* Warning messages if hardware capture fails */}
        {cameraPermissionError && (
          <div className="absolute top-4 left-4 right-4 bg-error-950/80 border border-error-500/30 backdrop-blur-md rounded-xl p-3 flex items-start space-x-3 text-error-200 text-xs shadow-lg max-w-md mx-auto z-30">
            <ShieldAlert
              size={16}
              className="text-error-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <h4 className="font-semibold">Camera/Mic Capture Blocked</h4>
              <p className="mt-0.5 text-error-300">
                Please grant camera and microphone permissions in your browser
                to view your live preview.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Glassmorphism Controls Panel */}
      <div className="flex justify-center items-center bg-slate-900/60 backdrop-blur-md py-4 px-8 rounded-2xl border border-white/5 shadow-2xl max-w-lg mx-auto w-full">
        <div className="flex items-center space-x-6">
          {/* Microphone Mute Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? "bg-error-600 hover:bg-error-500 text-white shadow-error-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Camera On/Off Toggle */}
          <button
            type="button"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoOff
                ? "bg-error-600 hover:bg-error-500 text-white shadow-error-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
            }`}
            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
          </button>

          {/* Screen Sharing Toggle */}
          <button
            type="button"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing
                ? "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
            }`}
            title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Spacer */}
          <div className="w-px h-8 bg-white/10"></div>

          {/* Terminate Call Trigger */}
          <button
            type="button"
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-error-600 hover:bg-error-500 text-white flex items-center justify-center shadow-lg shadow-error-500/20 hover:scale-105 transition-all"
            title="End Video Call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
