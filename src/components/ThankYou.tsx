import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import FormCard from './FormCard';

interface ThankYouProps {
  onStartOver: () => void;
}

const ThankYou: React.FC<ThankYouProps> = ({ onStartOver }) => {
  return (
    <FormCard
      title="Thank You!"
      description="Your consultation has been scheduled successfully."
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            We've sent you an email with:
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Meeting details and calendar invite</li>
            <li>• Next steps and what to expect</li>
            <li>• Information to help you prepare</li>
          </ul>
        </div>
        
        <div className="pt-6">
          <Button 
            onClick={onStartOver}
            size="lg"
          >
            Start New Form
          </Button>
        </div>
      </div>
    </FormCard>
  );
};

export default ThankYou;