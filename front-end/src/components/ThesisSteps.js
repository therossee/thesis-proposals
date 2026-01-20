import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import '../styles/custom-progress-tracker.css';

export default function ThesisSteps({ activeStep }) {
  const { t } = useTranslation();

const steps = [
  {
    key: 'ongoing',
    label: t('carriera.tesi.next_steps.step_1_title'), // "Thesis in progress"
    description: t('carriera.tesi.next_steps.step_1') // "Your thesis is currently in progress under the supervision of the assigned supervisor."
  },
  {
    key: 'next',
    label: t('carriera.tesi.next_steps.step_2_title'), // "Thesis conclusion confirmation"
    description: t('carriera.tesi.next_steps.step_2') // "Request confirmation of the thesis conclusion from the supervisor once the work is completed."
  },
  {
    key: 'questionnaire',
    label: t('carriera.tesi.next_steps.step_3_title'), // "AlmaLaurea questionnaire"
    description: t('carriera.tesi.next_steps.step_3') // "Complete the AlmaLaurea questionnaire by the established deadline. The link to access the questionnaire will be available in this section."
  },
  {
    key: 'final_exam',
    label: t('carriera.tesi.next_steps.step_4_title'), // "Final exam registration"
    description: t('carriera.tesi.next_steps.step_4') // "Register for the final exam through this page once you have obtained confirmation of the thesis conclusion."
  },
  {
    key: 'final_thesis',
    label: t('carriera.tesi.next_steps.step_5_title'), // "Final thesis"
    description: t('carriera.tesi.next_steps.step_5') // "Upload the final version of the thesis following the instructions provided by the supervisor and the regulations."
  }
];

const renderStep = (step, index) => {
  const isActive = step.key === activeStep;
  console.log(`Step: ${step.key}, Active: ${isActive}`); // Debugging line
  
  return (
    <div 
      key={step.key}
      className="progress-step"
    >
      <div className="progress-step-marker">
        <div className={`progress-step-circle ${isActive ? 'pending' : 'inactive'}`}>
        </div>
      </div>
      <div className="progress-step-content">
        <h6 className={`progress-step-title ${isActive ? 'active' : 'inactive'}`}>
          {step.label}
        </h6>
        <p className="progress-step-description">
          {step.description}
        </p>
      </div>
    </div>
  );
};

  return (
    <div className="progress-tracker-container">
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  );
}

ThesisSteps.propTypes = {
  activeStep: PropTypes.string.isRequired
};