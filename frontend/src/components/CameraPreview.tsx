import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

import {
  AlertCircle,
  Camera,
  CameraOff,
  Eye,
  ShieldCheck,
} from "lucide-react";

interface CameraPreviewProps {
  enabled: boolean;

  onPermissionChange?: (
    allowed: boolean
  ) => void;

  onAnalysisUpdate?: (metrics: {
      faceDetected: boolean;
      facePresenceScore: number;
      headCentered: boolean;
      cameraAttentionScore: number;
      postureGood: boolean;
      postureScore: number;
    }) => void;

}

export const CameraPreview: React.FC<
  CameraPreviewProps
  > = ({
    enabled,
    onPermissionChange,
    onAnalysisUpdate,
  }) => {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const [hasPermission, setHasPermission] =
    useState<boolean | null>(null);

  const faceLandmarkerRef =
    useRef<FaceLandmarker | null>(null);
  
  const poseLandmarkerRef =
    useRef<PoseLandmarker | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const totalFramesRef =
    useRef(0);

  const faceFramesRef =
    useRef(0);

  const [faceDetected, setFaceDetected] =
    useState(false);

  const [facePresenceScore, setFacePresenceScore] =
    useState(0);

  const centeredFramesRef =
    useRef(0);

  const [headCentered, setHeadCentered] =
      useState(false);

  const [cameraAttentionScore, setCameraAttentionScore] =
    useState(0);

  const postureFramesRef =
    useRef(0);

  const [postureGood, setPostureGood] =
    useState(false);

  const [postureScore, setPostureScore] =
    useState(0);

  const lastAnalysisEmitRef =
    useRef(0);

  const lastFrameTimeRef =
    useRef(0);

  const lastStateUpdateRef =
    useRef(0);

  const streamRef =
    useRef<MediaStream | null>(null);


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initializeFaceLandmarker = async () => {
        try {
          const vision =
            await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
            );

          const faceLandmarker =
            await FaceLandmarker.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath:
                    "/models/face_landmarker.task",
                },
                runningMode: "VIDEO",
                numFaces: 1,
                minFaceDetectionConfidence: 0.5,
                minFacePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
              }
            );

          faceLandmarkerRef.current =
            faceLandmarker;

        } catch (error) {
          console.error(
            "Face Landmarker initialization failed:",
            error
          );
        }
      };

      const initializePoseLandmarker = async () => {
        try {
          const vision =
            await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
            );

          const poseLandmarker =
            await PoseLandmarker.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath:
                    "/models/pose_landmarker.task",
                },
                runningMode: "VIDEO",
                numPoses: 1,
                minPoseDetectionConfidence: 0.5,
                minPosePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
              }
            );

          poseLandmarkerRef.current =
            poseLandmarker;

        } catch (error) {
          console.error(
            "Pose Landmarker initialization failed:",
            error
          );
        }
      };

    const analyzeFrame = () => {
      const video = videoRef.current;

      const faceLandmarker =
        faceLandmarkerRef.current;

      const poseLandmarker =
        poseLandmarkerRef.current;

      if (
        !video ||
        !faceLandmarker ||
        !poseLandmarker ||
        video.readyState < 2
      ) {
        animationFrameRef.current =
          requestAnimationFrame(
            analyzeFrame
          );

        return;
      }

      const timestamp = performance.now();

      // Throttle MediaPipe inference to ~15 FPS (66ms) to prevent CPU hogging
      if (timestamp - lastFrameTimeRef.current < 66) {
        animationFrameRef.current =
          requestAnimationFrame(analyzeFrame);
        return;
      }

      lastFrameTimeRef.current = timestamp;

      try {
        const result =
          faceLandmarker.detectForVideo(
            video,
            timestamp
          );

        const poseResult =
          poseLandmarker.detectForVideo(
            video,
            timestamp
          );

        totalFramesRef.current += 1;

        const detected =
          result.faceLandmarks &&
          result.faceLandmarks.length > 0;

        if (detected) {
          faceFramesRef.current += 1;
        }

        let centered = false;

        if (detected) {
          const landmarks =
            result.faceLandmarks[0];

          const leftEye =
            landmarks[33];

          const rightEye =
            landmarks[263];

          const nose =
            landmarks[1];

          if (
            leftEye &&
            rightEye &&
            nose
          ) {
            const eyeCenterX =
              (leftEye.x + rightEye.x) / 2;

            const horizontalOffset =
              Math.abs(
                nose.x - eyeCenterX
              );

            centered =
              horizontalOffset < 0.035;
          }
        }

        if (centered) {
          centeredFramesRef.current += 1;
        }

        const attentionScore =
          totalFramesRef.current > 0
            ? Math.round(
                (
                  centeredFramesRef.current /
                  totalFramesRef.current
                ) * 100
              )
            : 0;

        const score =
          totalFramesRef.current > 0
            ? Math.round(
                (
                  faceFramesRef.current /
                  totalFramesRef.current
                ) * 100
              )
            : 0;

        let goodPosture = false;

          if (
            poseResult.landmarks &&
            poseResult.landmarks.length > 0
          ) {
            const pose =
              poseResult.landmarks[0];

            const leftShoulder =
              pose[11];

            const rightShoulder =
              pose[12];

            const leftHip =
              pose[23];

            const rightHip =
              pose[24];

            if (
              leftShoulder &&
              rightShoulder &&
              leftHip &&
              rightHip
            ) {
              const shoulderTilt =
                Math.abs(
                  leftShoulder.y -
                  rightShoulder.y
                );

              const hipTilt =
                Math.abs(
                  leftHip.y -
                  rightHip.y
                );

              const shoulderCenterX =
                (
                  leftShoulder.x +
                  rightShoulder.x
                ) / 2;

              const hipCenterX =
                (
                  leftHip.x +
                  rightHip.x
                ) / 2;

              const bodyLean =
                Math.abs(
                  shoulderCenterX -
                  hipCenterX
                );

              goodPosture =
                shoulderTilt < 0.06 &&
                hipTilt < 0.06 &&
                bodyLean < 0.08;
            }
          }

          if (goodPosture) {
            postureFramesRef.current += 1;
          }

          const currentPostureScore =
            totalFramesRef.current > 0
              ? Math.round(
                  (
                    postureFramesRef.current /
                    totalFramesRef.current
                  ) * 100
                )
              : 0;

        // Throttle React UI State updates to ~300ms to avoid 60FPS re-render lag
        if (timestamp - lastStateUpdateRef.current >= 300) {
          lastStateUpdateRef.current = timestamp;
          setFaceDetected(detected);
          setHeadCentered(centered);
          setCameraAttentionScore(attentionScore);
          setFacePresenceScore(score);
          setPostureGood(goodPosture);
          setPostureScore(currentPostureScore);
        }

      const now =
        performance.now();

      if (
        now - lastAnalysisEmitRef.current >= 500
      ) {
        lastAnalysisEmitRef.current = now;

        onAnalysisUpdate?.({
          faceDetected: detected,
          facePresenceScore: score,
          headCentered: centered,
          cameraAttentionScore:
            attentionScore,
          postureGood:
            goodPosture,
          postureScore:
            currentPostureScore,
        });
      }

      } catch (error) {
        console.warn(
          "Face analysis error:",
          error
        );
      }

      animationFrameRef.current =
        requestAnimationFrame(
          analyzeFrame
        );
    };

    const startCamera = async () => {
      if (!enabled) {
        stopCamera();
        setHasPermission(null);
        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setHasPermission(false);
        onPermissionChange?.(false);
        return;
      }

      try {
        stopCamera();

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: "user",
            },
            audio: false,
          });

        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          try {
            await videoRef.current.play();
          } catch (playError) {
            console.warn(
              "Video could not start playing:",
              playError
            );
          }
        }

        await initializeFaceLandmarker();
        await initializePoseLandmarker();

        if (!cancelled) {
          analyzeFrame();
        }

        setHasPermission(true);
        onPermissionChange?.(true);
      } catch (error) {
        console.warn(
          "Camera permission/error:",
          error
        );

        stopCamera();

        setHasPermission(false);
        onPermissionChange?.(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      faceLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;

      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;

      stopCamera();
    };
  }, [
  enabled,
    onPermissionChange,
    onAnalysisUpdate,
  ]);

  if (!enabled) {
    return (
      <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
        <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
          <CameraOff className="w-10 h-10 text-slate-600" />

          <p className="mt-3 text-sm font-bold text-slate-300">
            Camera analysis is disabled
          </p>

          <p className="mt-2 text-xs text-slate-500 leading-5">
            You can continue the interview normally.
            Only eye-contact, posture and facial
            engagement analysis will be unavailable.
          </p>
        </div>

        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          Interview works without camera
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
      <div className="relative bg-black h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px]">
        {hasPermission !== false && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
        )}

        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />

            <p className="text-xs text-slate-400">
              Waiting for camera permission...
            </p>
          </div>
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3">
            <AlertCircle className="w-9 h-9 text-rose-400" />

            <p className="text-sm font-bold text-slate-200">
              Camera permission was not granted
            </p>

            <p className="text-xs text-slate-400 leading-5">
              You can still complete the interview
              without camera analysis.
            </p>
          </div>
        )}

        {hasPermission === true && (
        <div className="absolute top-2 left-2 right-2 flex flex-row flex-wrap gap-1.5 z-10">

          <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[9px] sm:text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

            <Eye className="w-3.5 h-3.5" />

            Camera analysis active
          </div>

          <div
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border text-[9px] sm:text-xs font-bold ${
              faceDetected
                ? "border-emerald-500/40 text-emerald-400"
                : "border-rose-500/40 text-rose-400"
            }`}
          >
            {faceDetected
              ? "✓ Face Detected"
              : "✕ Face Not Detected"}
          </div>

          <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-indigo-500/40 text-[9px] sm:text-xs font-bold text-indigo-300">
            Face Presence: {facePresenceScore}%
          </div>

        </div>
      )}
      </div>

      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          Camera used during this session only
        </span>

        <span>
          {hasPermission === true
            ? "Active"
            : "Not active"}
        </span>
      </div>
    </div>
  );
};
