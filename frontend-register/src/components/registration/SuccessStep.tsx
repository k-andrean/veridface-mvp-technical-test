import React, { useEffect, useState } from 'react';
import { FormData } from './RegistrationFlow';
import QRCode from 'qrcode';

interface SuccessStepProps {
  formData: FormData;
  isSubmitting: boolean;
  onSubmit: () => void;
  faceImage: string;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
  formData,
  isSubmitting,
  onSubmit,
  faceImage
}) => {
  const [digitalId, setDigitalId] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleRegistration = async () => {
    try {
      const res = await fetch('https://40d6-119-160-190-151.ngrok-free.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: faceImage
        })
      });

      const data = await res.json();

      if (data.status === 'success') {
        setDigitalId(data.digital_id);
        setSubmitted(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration Error:', err);
      setError('Network error during registration.');
    }
  };

  useEffect(() => {
    if (submitted && digitalId) {
      const qrData = `https://veridface.com/verify/${digitalId}`;
      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR Code generation failed:', err));
    }
  }, [submitted, digitalId]);

  if (!submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Submit</h2>
          <p className="text-gray-600">Review your information and complete registration</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {formData.name}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Face Verification</h3>
            <p className="text-sm text-gray-600">✓ Face photo captured successfully</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleRegistration}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">✅</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-600 mb-6">Your digital identity has been created</p>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Digital ID</h3>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {digitalId}
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img src={qrCodeUrl} alt="Digital ID QR Code" className="w-32 h-32 mx-auto" />
              <p className="text-xs text-gray-500 mt-2">Scan to verify identity</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">📱 Backup Instructions</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>Screenshot this screen</strong> for future access</p>
            <p>• Save your Digital ID: <strong>{digitalId}</strong></p>
            <p>• Do not share your Digital ID publicly</p>
          </div>
        </div>

        <div className="text-left space-y-2 mb-6">
          <h4 className="font-medium text-gray-900">Next Steps:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use your Digital ID for identity verification</li>
            <li>• Check your email for confirmation</li>
            <li>• Present your QR code when needed</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Register Another User
        </button>
      </div>
    </div>
  );
};
