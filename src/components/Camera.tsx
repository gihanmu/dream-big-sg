'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraProps {
  onCapture: (imageDataUrl: string) => void;
  currentImage?: string;
}

export default function Camera({ onCapture, currentImage }: CameraProps) {
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(currentImage || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    console.log('🎥 [Camera] Starting camera initialization...');
    setIsCameraLoading(true);
    setCameraError(null);
    
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        console.warn('⚠️ [Camera] Not in secure context (HTTPS required)');
        setCameraError('Camera requires HTTPS. Please use npm run dev:https or access via https://localhost:3000');
        setIsCameraLoading(false);
        return;
      }
      
      // Check browser compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ [Camera] Browser does not support camera access');
        setCameraError('Your browser does not support camera access. Please use a modern browser.');
        setIsCameraLoading(false);
        return;
      }
      
      // Check camera permissions
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraPermission(result.state as 'prompt' | 'granted' | 'denied');
          console.log('🔐 [Camera] Permission state:', result.state);
        } catch {
          console.log('ℹ️ [Camera] Cannot query permissions, proceeding anyway');
        }
      }
      
      console.log('📡 [Camera] Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('✅ [Camera] Camera access granted, stream obtained');
      setStream(mediaStream);
      
      // Set up video element
      if (videoRef.current) {
        console.log('🎬 [Camera] Setting up video element...');
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('🎬 [Camera] Video metadata loaded');
          videoRef.current?.play()
            .then(() => {
              console.log('▶️ [Camera] Video playing successfully');
              setIsUsingCamera(true);
              setIsCameraLoading(false);
            })
            .catch((playError) => {
              console.error('❌ [Camera] Error playing video:', playError);
              setCameraError('Failed to start video preview');
              setIsCameraLoading(false);
            });
        };
      } else {
        console.warn('⚠️ [Camera] Video ref not available');
        setIsUsingCamera(true);
        setIsCameraLoading(false);
      }
    } catch (error: unknown) {
      console.error('❌ [Camera] Error accessing camera:', error);
      setIsCameraLoading(false);
      
      // Provide specific error messages
      const errorName = error instanceof Error ? error.name : '';
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings and try again.');
        setCameraPermission('denied');
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please ensure your device has a camera.');
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setCameraError('Camera is already in use by another application.');
      } else if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
        setCameraError('Camera does not support the requested settings.');
      } else if (errorName === 'TypeError') {
        setCameraError('Camera requires HTTPS. Use npm run dev:https or https://localhost:3000');
      } else {
        setCameraError(`Camera error: ${errorMessage}`);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    onCapture(imageDataUrl);
    stopCamera();
  }, [onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    // Log environment info on mount
    console.log('🔍 [Camera] Component mounted');
    console.log('🔒 [Camera] Secure context:', window.isSecureContext);
    console.log('🌐 [Camera] Protocol:', window.location.protocol);
    console.log('📍 [Camera] Host:', window.location.host);
    
    if (!window.isSecureContext) {
      console.warn('⚠️ [Camera] Camera requires HTTPS. Current protocol:', window.location.protocol);
      console.warn('💡 [Camera] To fix: Run "npm run dev:https" and access https://localhost:3000');
    }
    
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const hasImage = !!capturedImage;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Add Your Superhero Face! 📸
        </h3>
        <p className="text-gray-600">
          Take a selfie to appear in your poster
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Camera/Image Display Area */}
        <div className="relative w-80 h-60 bg-gray-100 rounded-xl overflow-hidden border-4 border-dashed border-gray-300">
          {(isUsingCamera || isCameraLoading) && !capturedImage && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                style={{ display: isCameraLoading ? 'none' : 'block' }}
              />
              {isCameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                  <div className="text-center text-white">
                    <motion.div
                      className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}
            </>
          )}

          {capturedImage && (
            <motion.img
              src={capturedImage}
              alt="Captured selfie"
              className="w-full h-full object-cover"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}


          {!isUsingCamera && !hasImage && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Camera preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <AnimatePresence mode="wait">
          {!isUsingCamera && !hasImage && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📸</span>
                <span>Take Selfie</span>
              </motion.button>
            </motion.div>
          )}

          {isUsingCamera && !capturedImage && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <motion.button
                onClick={captureImage}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📸 Capture!
              </motion.button>
              
              <motion.button
                onClick={stopCamera}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          )}

          {capturedImage && (
            <motion.div
              key="captured"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <motion.button
                onClick={retakePhoto}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📸 Retake
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Error Display */}
        {cameraError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl max-w-md"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span className="text-sm font-medium">{cameraError}</span>
              </div>
              {cameraError.includes('HTTPS') && (
                <div className="text-xs mt-2 p-2 bg-red-50 rounded">
                  <p className="font-semibold mb-1">To use camera:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Stop the current server (Ctrl+C)</li>
                    <li>Run: <code className="bg-red-200 px-1 rounded">npm run dev:https</code></li>
                    <li>Open: <code className="bg-red-200 px-1 rounded">https://localhost:3000</code></li>
                    <li>Accept the security warning</li>
                  </ol>
                </div>
              )}
              {cameraPermission === 'denied' && (
                <button
                  onClick={() => window.open('chrome://settings/content/camera', '_blank')}
                  className="text-xs underline hover:no-underline"
                >
                  Open browser camera settings
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="hidden"
        width={640}
        height={480}
      />
    </div>
  );
}