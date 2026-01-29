import React from 'react';

import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import PropTypes from 'prop-types';

import '../styles/custom-progress-tracker.css';

export default function Timeline({ activeStep, statusHistory }) {
  const { t } = useTranslation();
  const [expandedNote, setExpandedNote] = React.useState(null);

  const getHistoryForStatus = targetStatus => {
    if (!statusHistory || statusHistory.length === 0) return null;
    return statusHistory.find(h => h.newStatus === targetStatus);
  };

  const firstStep = {
    key: 'pending',
    label: t('carriera.tesi.thesis_progress.pending'),
    description: t('carriera.tesi.thesis_progress.pending_description'),
  };

  // Step 2: Outcome della application (dipende da applicationStatus)
  const getSecondStep = () => {
    switch (activeStep) {
      case 'approved':
      case 'ongoing':
      case 'conclusion_request':
      case 'almalaurea':
      case 'final_exam':
      case 'final_thesis':
        return {
          key: 'approved',
          label: t('carriera.tesi.thesis_progress.approved'),
          description: t('carriera.tesi.thesis_progress.approved_description'),
          date: activeStep !== 'approved',
        };
      case 'rejected':
        return {
          key: 'rejected',
          label: t('carriera.tesi.thesis_progress.rejected'),
          description: t('carriera.tesi.thesis_progress.rejected_description'),
        };
      case 'cancelled':
        return {
          key: 'cancelled',
          label: t('carriera.tesi.thesis_progress.cancelled'),
          description: t('carriera.tesi.thesis_progress.cancelled_description'),
        };
      default:
        return {
          key: 'outcome',
          label: t('carriera.tesi.thesis_progress.outcome'),
          description: t('carriera.tesi.thesis_progress.outcome_description'),
        };
    }
  };

  // Step 3+: Thesis workflow (dipende da activeStatus)
  const getThesisSteps = () => {
    return [
      {
        key: 'ongoing',
        label: t('carriera.tesi.thesis_progress.ongoing_title'),
        description: t('carriera.tesi.thesis_progress.ongoing'),
      },
      {
        key: 'conclusion_request',
        label: t('carriera.tesi.thesis_progress.conclusion_request_title'),
        description: t('carriera.tesi.thesis_progress.conclusion_request'),
      },
      {
        key: 'almalaurea',
        label: t('carriera.tesi.thesis_progress.almalaurea_title'),
        description: t('carriera.tesi.thesis_progress.almalaurea'),
      },
      {
        key: 'final_exam',
        label: t('carriera.tesi.thesis_progress.final_exam_title'),
        description: t('carriera.tesi.thesis_progress.final_exam'),
      },
      {
        key: 'final_thesis',
        label: t('carriera.tesi.thesis_progress.final_thesis_title'),
        description: t('carriera.tesi.thesis_progress.final_thesis'),
      },
    ];
  };

  const secondStep = getSecondStep();
  const thesisSteps = getThesisSteps();
  const steps = [firstStep, secondStep, ...thesisSteps];

  const renderStep = (step, activeStep) => {
    const { key, label, description } = step;

    const isActive = activeStep === key;

    let circleClass;
    let titleClass;
    let historyEntry = null;

    switch (key) {
      case 'pending':
      case 'rejected':
      case 'cancelled':
      case 'approved':
        historyEntry = statusHistory ? getHistoryForStatus(key) : null;
        circleClass = isActive ? key : 'inactive';
        titleClass = isActive ? `active active-${key}` : '';
        break;
      default:
        circleClass = isActive ? 'pending' : 'inactive';
        titleClass = titleClass = isActive ? `active active-${key}` : '';
        historyEntry = null;
    }

    return (
      <div key={key} className="progress-step">
        <div className="progress-step-marker">
          <div className={`progress-step-circle ${circleClass}`}>
            {isActive && key === 'approved' && <i className="fa-solid fa-check align-vertical-center" />}
            {isActive && key === 'rejected' && <i className="fa-solid fa-xmark" />}
            {isActive && key === 'cancelled' && <i className="fa-solid fa-ban" />}
          </div>
        </div>
        <div className="progress-step-content">
          <h6 className={`progress-step-title ${titleClass}`}>{label}</h6>
          <p className="progress-step-description">{description}</p>
          {historyEntry && (
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
                    onClick={() => setExpandedNote(expandedNote === key ? null : key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedNote(expandedNote === key ? null : key);
                      }
                    }}
                  >
                    <i className="fa-solid fa-comment me-2" />
                    {key !== 'cancelled'
                      ? expandedNote === key
                        ? t('carriera.tesi.thesis_progress.hide_supervisor_note')
                        : t('carriera.tesi.thesis_progress.show_supervisor_note')
                      : expandedNote === key
                        ? t('carriera.tesi.thesis_progress.hide_note')
                        : t('carriera.tesi.thesis_progress.show_note')}
                    <i className={`fa-solid fa-chevron-${expandedNote === key ? 'up' : 'down'} ms-2`} />
                  </div>
                  {expandedNote === key && (
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

  return (
    <Card className="mb-3 roundCard py-2 ">
      <Card.Header className="border-0">
        <h3 className="thesis-topic">
          <i className="fa-solid fa-timeline fa-sm pe-2" />
          {t('carriera.tesi.timeline')}
        </h3>
      </Card.Header>
      <Card.Body>
        <div className="progress-tracker-container">{steps.map(step => renderStep(step, activeStep))}</div>
      </Card.Body>
    </Card>
  );
}

Timeline.propTypes = {
  activeStep: PropTypes.oneOf([
    'pending',
    'approved',
    'rejected',
    'cancelled',
    'ongoing',
    'conclusion_request',
    'almalaurea',
    'final_exam',
    'final_thesis',
  ]).isRequired,
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      oldStatus: PropTypes.string,
      newStatus: PropTypes.string.isRequired,
      note: PropTypes.string,
      changeDate: PropTypes.string.isRequired,
    }),
  ),
  startDate: PropTypes.string,
};
