
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsentDialogProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

export const ConsentDialog: React.FC<ConsentDialogProps> = ({
  open,
  onConsent,
  onDecline
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleConsent = () => {
    if (hasAgreed) {
      onConsent();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="mx-4 max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Consent Required - Read Before Proceeding
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Before we proceed with face verification, please review and confirm:
          </DialogDescription>
        </DialogHeader>
        
        {!showTerms ? (
          <>
            <div className="space-y-3 my-4">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Consent to have your facial image captured and processed for identity verification
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Your image will be securely stored for verification purposes only
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <p className="text-sm text-gray-700">
                  Data processing complies with privacy regulations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms-agreement" 
                  checked={hasAgreed}
                  onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                />
                <label htmlFor="terms-agreement" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Terms & Conditions and Privacy Policy
                  </button>
                </label>
              </div>
            </div>

            <DialogFooter className="flex flex-col space-y-2 sm:flex-col sm:space-y-2 sm:space-x-0">
              <Button 
                onClick={handleConsent}
                disabled={!hasAgreed}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                I Consent & Continue
              </Button>
              <Button 
                onClick={onDecline}
                variant="outline"
                className="w-full"
              >
                Decline
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-80 w-full rounded-md border p-4">
                <div className="space-y-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>
                  <p>
                    By using VerIDFace, you agree to allow us to capture and process your facial biometric data for identity verification purposes.
                  </p>
                  <p>
                    Your biometric data will be encrypted and stored securely. We do not share your data with third parties without your explicit consent.
                  </p>
                  <p>
                    You have the right to request deletion of your data at any time by contacting our support team.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900 pt-4">Privacy Policy</h3>
                  <p>
                    We collect facial biometric data solely for identity verification. This data is processed locally and stored with enterprise-grade encryption.
                  </p>
                  <p>
                    We comply with GDPR, CCPA, and other applicable privacy regulations. Your data is never used for marketing or sold to third parties.
                  </p>
                  <p>
                    For questions about data processing, contact privacy@veridface.com
                  </p>
                </div>
              </ScrollArea>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                onClick={() => setShowTerms(false)}
                variant="outline"
                className="w-full"
              >
                ← Back to Consent
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
