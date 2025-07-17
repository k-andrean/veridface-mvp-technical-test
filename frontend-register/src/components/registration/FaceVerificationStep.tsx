import React, { useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { ConsentDialog } from './ConsentDialog';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FaceVerificationStepProps {
  onCapture: (image: string) => void;
  onBack: () => void;
  form: FormData;
}

export const FaceVerificationStep: React.FC<FaceVerificationStepProps> = ({
  onCapture,
  onBack,
  form
}) => {
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [livenessStep, setLivenessStep] = useState<'ready' | 'countdown' | 'blink' | 'capture'>('ready');
  const [countdown, setCountdown] = useState<number>(3);

  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto
  } = useCamera();

  const handleConsent = () => {
    setHasConsented(true);
    setShowConsentDialog(false);
  };

  const handleDecline = () => {
    setShowConsentDialog(false);
    onBack();
  };

  const handleStartLivenessCheck = () => {
    setLivenessStep('countdown');
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLivenessStep('blink');

          // Begin blink capture after short pause
          setTimeout(() => {
            const frame1 = capturePhoto();
            if (frame1) {
              setTimeout(() => {
                const frame2 = capturePhoto();
                if (frame2) {
                  setCapturedImage(frame2); // use final frame
                  stopCamera(); // stop stream after capture
                  setLivenessStep('capture');
                }
              }, 1000);
            }
          }, 500);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCapture = () => {
    if (livenessStep === 'ready') {
      handleStartLivenessCheck();
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage); // only pass image to RegistrationFlow
    }
  };

  const handleRetake = () => {
    setCapturedImage('');
    setLivenessStep('ready');
    startCamera();
  };

  return (
    <>
      <ConsentDialog
        open={showConsentDialog}
        onConsent={handleConsent}
        onDecline={handleDecline}
      />

      <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Face Verification</h2>
          <p className="text-gray-600">Position your face within the guide and follow instructions</p>
        </div>

        <div className="space-y-4">
          {/* Camera Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square max-w-sm mx-auto">
            {!isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-gray-500">Camera preview will appear here</p>
                </div>
              </div>
            )}

            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
              />
            )}

            {/* Overlay Guide */}
            {isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-48 h-60 border-4 border-blue-500 rounded-full opacity-70"></div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    Align your face
                  </div>
                </div>
              </div>
            )}

            {/* Liveness Instructions */}
            {(livenessStep === 'countdown' || livenessStep === 'blink') && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center">
                  <h3 className="text-lg font-bold mb-2">Liveness Check</h3>
                  {livenessStep === 'countdown' ? (
                    <>
                      <p className="text-gray-600 mb-4">Please get ready to blink</p>
                      <div className="text-4xl font-bold text-blue-600">{countdown}</div>
                    </>
                  ) : (
                    <p className="text-gray-600">Blink now!</p>
                  )}
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {hasConsented && (
            <div className="space-y-3">
              {!isStreaming && !capturedImage && (
                <button
                  onClick={startCamera}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Camera
                </button>
              )}

              {isStreaming && !capturedImage && (
                <button
                  onClick={handleCapture}
                  disabled={livenessStep === 'blink'}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {livenessStep === 'ready' ? 'Start Verification' :
                    livenessStep === 'blink' ? 'Processing...' : 'Capturing...'}
                </button>
              )}

              {capturedImage && (
                <div className="space-y-3">
                  <button
                    onClick={handleConfirm}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Confirm & Continue →
                  </button>
                  <button
                    onClick={handleRetake}
                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                  >
                    Retake Photo
                  </button>
                </div>
              )}

              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                ← Back to Personal Info
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
