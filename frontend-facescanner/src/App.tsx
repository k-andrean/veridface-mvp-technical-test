import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, CheckCircle, XCircle, AlertCircle, QrCode, MapPin, User, Clock, Target, RefreshCw
} from 'lucide-react';

type DetectionState = 'not-detected' | 'access-granted' | 'not-recognized' | 'scanning' | 'camera-denied';

type AccessResult = {
  digitalId: string;
  timestamp: string;
  confidence: number;
  userName: string;
};

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectionState, setDetectionState] = useState<DetectionState>('scanning');
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null);
  const [manualId, setManualId] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('BIL Workshop Room');
  const [isScanning, setIsScanning] = useState(false);

  const venues = [
    'BIL Workshop Room',
    'BIL Amphitheatre',
    'Executive Boardroom',
    'Yayasan An-Naura Hall',
    'Innovation Lab'
  ];

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (stream && detectionState === 'scanning') {
      const interval = setInterval(() => {
        captureAndMatchFace();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [stream, detectionState]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setDetectionState('camera-denied');
      }
    }
  };

  const captureAndMatchFace = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg');

    fetch('https://40d6-119-160-190-151.ngrok-free.app/facescanner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, venue: selectedVenue })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.match) {
          setAccessResult({
            digitalId: data.user_id,
            timestamp: new Date().toLocaleString(),
            confidence: Math.round(data.confidence * 100),
            userName: 'Verified User'
          });
          setDetectionState('access-granted');
          setTimeout(() => {
            setDetectionState('scanning');
            setAccessResult(null);
          }, 4000);
        } else {
          setDetectionState('not-recognized');
          setTimeout(() => setDetectionState('scanning'), 4000);
        }
      })
      .catch(err => {
        console.error('Match error:', err);
        setDetectionState('not-detected');
      });
  };

  const handleRetryCamera = () => {
    setDetectionState('scanning');
    startCamera();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      setAccessResult({
        digitalId: manualId,
        timestamp: new Date().toLocaleString(),
        confidence: 100,
        userName: 'Manual Check-In'
      });
      setDetectionState('access-granted');
      setManualId('');
      setTimeout(() => {
        setDetectionState('scanning');
        setAccessResult(null);
      }, 4000);
    }
  };

  const handleQRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setAccessResult({
        digitalId: 'QR-MATCH-2024',
        timestamp: new Date().toLocaleString(),
        confidence: 100,
        userName: 'QR Code User'
      });
      setDetectionState('access-granted');
      setIsScanning(false);
      setTimeout(() => {
        setDetectionState('scanning');
        setAccessResult(null);
      }, 4000);
    }, 2000);
  };

  const getStatusConfig = () => {
    switch (detectionState) {
      case 'access-granted':
        return { icon: CheckCircle, title: 'Access Granted', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300' };
      case 'not-recognized':
        return { icon: XCircle, title: 'Face Not Recognized', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-300' };
      case 'not-detected':
        return { icon: AlertCircle, title: 'Face Not Detected', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-300' };
      case 'camera-denied':
        return { icon: XCircle, title: 'Camera Access Denied', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-300' };
      default:
        return { icon: Target, title: 'Scanning for Face...', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-300' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Keep your original JSX layout below this point exactly as it was
  // (from header to footer, with all divs and UI blocks)

  return (
    // Paste your full JSX return here (as per original working version)
    // You can now safely keep your full UI with dynamic logic integrated above
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-bold text-xl">VerIDFace</span>
              <p className="text-gray-500 text-xs">Contactless Access</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <select 
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {venues.map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Camera View */}
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-6 ring-1 ring-gray-700">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />
          
          {/* Face Detection Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-48 h-64 rounded-full border-4 ${
              detectionState === 'access-granted' ? 'border-emerald-400 shadow-emerald-400/50' :
              detectionState === 'not-recognized' ? 'border-rose-400 shadow-rose-400/50' :
              detectionState === 'not-detected' ? 'border-amber-400 shadow-amber-400/50' :
              detectionState === 'camera-denied' ? 'border-rose-400 shadow-rose-400/50' :
              'border-cyan-400 shadow-cyan-400/50'
            } ${detectionState === 'scanning' ? 'animate-pulse' : ''} shadow-lg`}>
              <div className="w-full h-full rounded-full bg-transparent border-2 border-dashed border-white/40" />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 left-4 right-4">
            <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-xl p-4 backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center space-x-3">
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                <span className={`font-semibold text-lg ${statusConfig.color}`}>
                  {statusConfig.title}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Access Result */}
        {detectionState === 'access-granted' && accessResult && (
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6 border-2 border-emerald-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-800">Welcome!</h3>
                <p className="text-emerald-600 text-lg font-medium">{accessResult.userName}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Digital ID:</span>
                <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded">{accessResult.digitalId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Confidence:</span>
                <span className="font-bold text-emerald-600 text-lg">{accessResult.confidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Time:</span>
                <span className="text-gray-900">{accessResult.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Options */}
        {(detectionState === 'not-recognized' || detectionState === 'camera-denied') && (
          <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-rose-800 mb-2">
                {detectionState === 'camera-denied' ? 'Camera Access Required' : 'Face Not Recognized'}
              </h3>
              <p className="text-gray-600">
                {detectionState === 'camera-denied' 
                  ? 'Please allow camera access to use face recognition'
                  : 'Please try an alternative method below'
                }
              </p>
            </div>

            {/* Retry Camera Button for camera-denied state */}
            {detectionState === 'camera-denied' && (
              <button
                onClick={handleRetryCamera}
                className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 focus:ring-4 focus:ring-cyan-200 transition-all duration-200 shadow-lg font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Retry Camera Access</span>
              </button>
            )}

            {/* Manual ID Entry */}
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Digital ID Manually
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      placeholder="BIL-2024 or Name"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl hover:from-slate-700 hover:to-gray-800 focus:ring-4 focus:ring-slate-200 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500 font-medium">OR</span>
              </div>
            </div>

            {/* QR Code Option */}
            <button
              onClick={handleQRScan}
              disabled={isScanning}
              className="w-full flex items-center justify-center space-x-3 py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200 disabled:opacity-50 group"
            >
              <QrCode className={`w-6 h-6 ${isScanning ? 'animate-spin text-cyan-500' : 'text-gray-500 group-hover:text-cyan-500'} transition-colors`} />
              <span className="font-semibold text-gray-700 group-hover:text-cyan-700 transition-colors">
                {isScanning ? 'Scanning QR Code...' : 'Scan QR Code Instead'}
              </span>
            </button>
          </div>
        )}

        {/* Instructions */}
        {detectionState === 'scanning' || detectionState === 'not-detected' ? (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 text-gray-700 shadow-lg border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-2 text-gray-900">Position Your Face</p>
                <p className="text-gray-600 leading-relaxed">
                  Look directly at the camera and align your face within the oval guide. 
                  Keep your face well-lit and avoid shadows for best results.
                </p>
              </div>
            </div>
          </div>
        ) : detectionState === 'camera-denied' ? (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 text-gray-700 shadow-lg border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-2 text-gray-900">Camera Permission Required</p>
                <p className="text-gray-600 leading-relaxed">
                  To use face recognition, please click the camera icon in your browser's address bar 
                  and allow camera access. Then click the "Retry Camera Access" button above.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-center space-x-6 text-gray-500 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="font-medium">Contactless Access System</span>
          <span className="text-gray-300">•</span>
          <span className="font-medium text-cyan-600">Secure & Fast</span>
        </div>
      </div>
    </div>
  );
}

export default App;
