import React, { useState } from 'react';
import { PersonalInfoStep } from './PersonalInfoStep';
import { FaceVerificationStep } from './FaceVerificationStep';
import { SuccessStep } from './SuccessStep';
import { ProgressIndicator } from './ProgressIndicator';

export interface FormData {
  name: string;
  email: string;
  phone: string;
}

export interface RegistrationProps {
  onRegister?: (formData: FormData, faceImage: string) => Promise<string>;
}

export const RegistrationFlow: React.FC<RegistrationProps> = ({
  onRegister = async () =>
    `BIL-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [faceImage, setFaceImage] = useState<string>('');
  const [digitalId, setDigitalId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Handle personal info submission
  const handlePersonalInfoSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentStep(2);
  };

  // STEP 2: Just store face image, do not submit yet
  const handleFaceCapture = (imageData: string) => {
    setFaceImage(imageData);
    setCurrentStep(3); // Go to confirmation step
  };

  // STEP 3: Actual POST to backend and Airtable here
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://40d6-119-160-190-151.ngrok-free.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: faceImage,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setDigitalId(data.digital_id);
        console.log('✅ Registration completed:', {
          formData,
          digitalId: data.digital_id,
        });
      } else {
        alert('Registration failed: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error submitting registration:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            initialData={formData}
            onSubmit={handlePersonalInfoSubmit}
          />
        );
      case 2:
        return (
          <FaceVerificationStep
            onCapture={handleFaceCapture}
            onBack={() => setCurrentStep(1)}
            form={formData}
          />
        );
      case 3:
        return (
          <SuccessStep
            formData={formData}
            faceImage={faceImage}
            isSubmitting={isSubmitting}
            onSubmit={handleFinalSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VerIDFace
          </h1>
          <p className="text-gray-600 mt-2">Digital Identity Registration</p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={3} />

        {/* Step Content */}
        <div className="flex-1 flex flex-col justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
