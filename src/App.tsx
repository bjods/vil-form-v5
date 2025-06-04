import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { useFormStore } from './store/formStore';
import FormCard from './components/FormCard';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ServiceSelection from './components/ServiceSelection';
import AddressCollection from './components/AddressCollection';
import MaintenanceForm from './components/MaintenanceForm';
import ProjectsForm from './components/ProjectsForm';
import BothForm from './components/BothForm';
import OtherForm from './components/OtherForm';
import OutOfServiceArea from './components/OutOfServiceArea';
import StartPage from './components/StartPage';
import ThankYou from './components/ThankYou';
import UploadPage from './components/UploadPage';
import UploadComplete from './components/UploadComplete';
import { formSteps } from './data/formSteps';
import { getServiceSpecificTitle } from './components/BothForm';
import './index.css';

const UploadPageWrapper: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (!sessionId) return null;
  return <UploadPage sessionId={sessionId} />;
};

function App() {
  const { state, initializeSession, setStep, setSubStep, clearErrors, resetForm } = useFormStore();
  const [isStarted, setIsStarted] = useState(false);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      await initializeSession();
      setIsStarted(state.step > 0);
      setIsInitialized(true);
    };
    init();
  }, []);
  
  // Don't render anything until we've initialized
  if (!isInitialized) {
    return null;
  }

  const handleValidationChange = (isValid: boolean) => {
    console.log('App received validation change:', isValid);
    setIsCurrentStepValid(isValid);
  };
  
  const handleStart = () => {
    setIsStarted(true);
  };

  const handleBackToStart = () => {
    setIsStarted(false);
    setStep(0);
    resetForm();
    clearErrors();
  };
  
  // Show thank you page if form is submitted and meeting is booked
  if (state.meetingBooked && state.formSubmitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <ThankYou onStartOver={handleBackToStart} />
      </div>
    );
  }
  
  // Find the current step
  const currentStep = formSteps.find((_, index) => index === state.step);
  
  if (!isStarted) {
    return (
      <div className="flex items-center justify-center p-4">
        <StartPage onStart={handleStart} />
      </div>
    );
  }
  
  // Determine which component to render based on the current step
  let StepComponent;
  let currentSubSteps;
  
  if (state.step === 0) {
    StepComponent = ServiceSelection;
  } else if (state.step === 1) {
    StepComponent = AddressCollection;
  } else if (!state.insideServiceArea && state.formPath === 'maintenance') {
    StepComponent = OutOfServiceArea;
  } else {
    switch (state.formPath) {
      case 'maintenance':
        StepComponent = MaintenanceForm;
        currentSubSteps = MaintenanceForm.subSteps;
        break;
      case 'projects':
        StepComponent = ProjectsForm;
        currentSubSteps = ProjectsForm.subSteps;
        break;
      case 'both':
        StepComponent = BothForm;
        currentSubSteps = BothForm.subSteps;
        break;
      case 'other':
        StepComponent = OtherForm;
        currentSubSteps = OtherForm.subSteps;
        break;
      default:
        StepComponent = null;
    }
  }
  
  if (!currentStep || !StepComponent) {
    return null;
  }

  const handleNext = () => {
    if (state.step === 2 && currentSubSteps) {
      if (state.currentSubStep < currentSubSteps.length - 1) {
        setSubStep(state.currentSubStep + 1);
        setIsCurrentStepValid(false);
      }
    } else {
      setStep(state.step + 1);
      setIsCurrentStepValid(false);
    }
  };

  const handleBack = () => {
    if (state.step === 2 && state.currentSubStep > 0) {
      setSubStep(state.currentSubStep - 1);
      setIsCurrentStepValid(false);
    } else if (state.step === 0) {
      handleBackToStart();
    } else {
      setStep(state.step - 1);
    }
  };

  const renderNavigation = () => {
    if (state.step === 2 && currentSubSteps && state.currentSubStep === currentSubSteps.length - 1) {
      return null;
    }

    return (
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isCurrentStepValid}
        >
          Continue
        </Button>
      </div>
    );
  };
  
  // Get the current title and description
  let title = currentStep.title;
  let description = currentStep.description;

  if (state.step === 2 && currentSubSteps) {
    const currentSubStep = currentSubSteps[state.currentSubStep];
    if (currentSubStep) {
      if (state.formPath === 'both') {
        title = getServiceSpecificTitle(
          currentSubStep.title,
          state.services,
          currentSubStep.type || null
        );
      } else {
        title = currentSubStep.title;
      }
      description = currentSubStep.description;
    }
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/upload/:sessionId" element={<UploadPageWrapper />} />
        <Route path="/upload-complete" element={<UploadComplete />} />
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center p-4">
              <FormCard 
                title={title}
                description={description}
                footerContent={renderNavigation()}
              > 
                <StepComponent onValidationChange={handleValidationChange} />
              </FormCard>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;