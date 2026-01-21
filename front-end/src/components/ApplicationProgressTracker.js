import React from 'react';

import { useTranslation } from 'react-i18next';

import moment from 'moment';
import PropTypes from 'prop-types';

import '../styles/custom-progress-tracker.css';

export default function ApplicationProgressTracker({ status, statusHistory }) {
  const { t } = useTranslation();
  const [expandedNote, setExpandedNote] = React.useState(null);

  const getHistoryForStatus = targetStatus => {
    if (!statusHistory || statusHistory.length === 0) return null;
    return statusHistory.find(h => h.newStatus === targetStatus);
  };
  // Primo step sempre uguale
  const firstStep = {
    key: 'pending',
    label: t('carriera.tesi.progress_application.pending'),
    description: t('carriera.tesi.progress_application.pending_description'),
  };

  // Secondo step dinamico in base allo stato
  const getSecondStep = () => {
    switch (status) {
      case 'approved':
        return {
          key: 'approved',
          label: t('carriera.tesi.progress_application.approved'),
          description: t('carriera.tesi.progress_application.approved_description'),
        };
      case 'rejected':
        return {
          key: 'rejected',
          label: t('carriera.tesi.progress_application.rejected'),
          description: t('carriera.tesi.progress_application.rejected_description'),
        };
      case 'canceled':
        return {
          key: 'canceled',
          label: t('carriera.tesi.progress_application.canceled'),
          description: t('carriera.tesi.progress_application.canceled_description'),
        };
      default: // pending
        return {
          key: 'outcome',
          label: t('carriera.tesi.progress_application.outcome'),
          description: t('carriera.tesi.progress_application.outcome_description'),
        };
    }
  };

  const secondStep = getSecondStep();
  const steps = [firstStep, secondStep];

  const renderStep = (step, index) => {
    const isActive = (index === 0 && status === 'pending') || (index === 1 && status !== 'pending');

    let circleClass = 'inactive';
    if (isActive) {
      circleClass = step.key;
    }

    const historyEntry = getHistoryForStatus(step.key);

    return (
      <div key={step.key} className="progress-step">
        <div className="progress-step-marker">
          <div className={`progress-step-circle ${circleClass}`}>
            {isActive && step.key === 'approved' && <i className="fa-solid fa-check" />}
            {isActive && step.key === 'rejected' && <i className="fa-solid fa-xmark" />}
            {isActive && step.key === 'canceled' && <i className="fa-solid fa-ban" />}
          </div>
        </div>
        <div className="progress-step-content">
          <h6 className={`progress-step-title ${isActive ? `active active-${step.key}` : ''}`}>{step.label}</h6>
          <p className="progress-step-description">{step.description}</p>
          {historyEntry && historyEntry.newStatus !== 'pending' && (
            <>
              <div className="progress-step-date">
                <i className="fa-solid fa-clock me-1" />
                {moment(historyEntry.changeDate).format('DD/MM/YYYY - HH:mm')}
              </div>
              {historyEntry.note && (
                <>
                  <div
                    className="progress-step-note-toggle"
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedNote(expandedNote === step.key ? null : step.key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedNote(expandedNote === step.key ? null : step.key);
                      }
                    }}
                  >
                    <i className="fa-solid fa-comment me-2" />
                    {step.key !== 'canceled' &&
                      (expandedNote === step.key
                        ? t('carriera.tesi.progress_application.hide_supervisor_note')
                        : t('carriera.tesi.progress_application.show_supervisor_note'))}
                    {step.key === 'canceled' &&
                      (expandedNote === step.key
                        ? t('carriera.tesi.progress_application.hide_note')
                        : t('carriera.tesi.progress_application.show_note'))}
                    <i className={`fa-solid fa-chevron-${expandedNote === step.key ? 'up' : 'down'} ms-2`} />
                  </div>
                  {expandedNote === step.key && (
                    <div className="progress-step-note">
                      <p style={{ whiteSpace: 'pre-line' }}>{historyEntry.note}</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return <div className="progress-tracker-container">{steps.map((step, index) => renderStep(step, index))}</div>;
}

ApplicationProgressTracker.propTypes = {
  status: PropTypes.oneOf(['pending', 'approved', 'rejected', 'canceled']).isRequired,
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      oldStatus: PropTypes.string,
      newStatus: PropTypes.string.isRequired,
      note: PropTypes.string,
      changeDate: PropTypes.string.isRequired,
    }),
  ),
};
