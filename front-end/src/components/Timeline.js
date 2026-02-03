import React, { useContext } from 'react';

import { Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import PropTypes from 'prop-types';

import { ThemeContext } from '../App';
import '../styles/custom-progress-tracker.css';
import { getSystemTheme } from '../utils/utils';
import InfoTooltip from './InfoTooltip';

export default function Timeline({ activeStep, statusHistory, deadlines }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;

  const validSteps = new Set([
    'pending',
    'approved',
    'rejected',
    'cancelled',
    'ongoing',
    'conclusion_request',
    'almalaurea',
    'final_exam',
    'final_thesis',
  ]);
  console.log(deadlines);
  const hasStatusHistory = Array.isArray(statusHistory) && statusHistory.length > 0;
  const inferredStatus = hasStatusHistory ? statusHistory[statusHistory.length - 1].newStatus : null;
  const normalizedActiveStep = validSteps.has(activeStep)
    ? activeStep
    : validSteps.has(inferredStatus)
      ? inferredStatus
      : null;
  const hasNoData = !normalizedActiveStep && !hasStatusHistory;
  const isDisabled = !normalizedActiveStep || !statusHistory;

  const getHistoryForStatus = targetStatus => {
    if (!statusHistory || statusHistory.length === 0) return null;
    return statusHistory.find(h => h.newStatus === targetStatus);
  };

  const firstStep = {
    key: 'pending',
    label: t('carriera.tesi.thesis_progress.pending'),
    description: t('carriera.tesi.thesis_progress.pending_description'),
  };

  const getSecondStep = () => {
    switch (normalizedActiveStep) {
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
          date: normalizedActiveStep !== 'approved',
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

    const stepKeys = steps.map(s => s.key);
    const fallbackActiveStep = hasNoData ? 'pending' : activeStep;
    const isPendingOnly = fallbackActiveStep === 'pending' && !hasNoData;
    const effectiveActiveStep = isPendingOnly ? 'outcome' : fallbackActiveStep;
    const activeIndex = stepKeys.indexOf(effectiveActiveStep);
    const thisIndex = stepKeys.indexOf(key);

    const isActive = effectiveActiveStep === key;
    const isCompleted = thisIndex < activeIndex;
    const isFuture = thisIndex > activeIndex;

    let circleClass;
    let titleClass;
    let historyEntry = null;

    switch (key) {
      case 'pending':
      case 'rejected':
      case 'cancelled':
      case 'approved':
        historyEntry = statusHistory ? getHistoryForStatus(key) : null;
        break;
      default:
        historyEntry = null;
    }

    if (isActive) {
      if (['approved', 'rejected', 'cancelled'].includes(key)) {
        circleClass = key;
      } else if (hasNoData && key === 'pending') {
        circleClass = 'waiting';
      } else if (key === 'outcome') {
        circleClass = 'waiting';
      } else {
        circleClass = 'pending';
      }
      titleClass = 'active';
    } else if (isCompleted) {
      circleClass = 'approved';
      titleClass = 'completed';
    } else {
      circleClass = 'inactive';
      titleClass = '';
    }

    return (
      <div
        key={key}
        className={[
          'progress-step',
          isDisabled && !(hasNoData && key === 'pending') ? 'disabled' : '',
          isFuture ? 'faded' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="progress-step-marker">
          <div className={`progress-step-circle ${circleClass}`}>
            {isActive && key === 'approved' && <i className="fa-solid fa-check align-vertical-center" />}
            {isActive && key === 'rejected' && <i className="fa-solid fa-xmark" />}
            {isActive && key === 'cancelled' && <i className="fa-solid fa-ban" />}
            {isCompleted && <i className="fa-solid fa-check align-vertical-center" />}
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
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`mb-3 roundCard py-2${isDisabled ? ' timeline-disabled' : ''}`}>
      <Card.Header className="border-0">
        <div className="d-flex align-items-center">
          <h3 className="thesis-topic">
            <i className="fa-regular fa-books fa-sm pe-2" />
            {t('carriera.tesi.timeline')}
          </h3>
          <InfoTooltip tooltipText={t('carriera.tesi.timeline_tooltip')} placement="top" id="timeline-tooltip" />
          <Button
            className={`btn btn-${appliedTheme} btn-header ms-auto`}
            onClick={() => {
              window.location.reload();
            }}
          >
            <i className="fa-regular fa-calendar-clock fa-lg me-1" /> {t('carriera.tesi.show_deadlines')}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="progress-tracker-container">{steps.map(step => renderStep(step, normalizedActiveStep))}</div>
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
    'none',
    'ongoing',
    'conclusion_request',
    'almalaurea',
    'final_exam',
    'final_thesis',
  ]),
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      oldStatus: PropTypes.string,
      newStatus: PropTypes.string.isRequired,
      note: PropTypes.string,
      changeDate: PropTypes.string.isRequired,
    }),
  ),
  startDate: PropTypes.string,
  deadlines: PropTypes.arrayOf(
    PropTypes.shape({
      deadline_type: PropTypes.string.isRequired,
      graduation_session_id: PropTypes.number.isRequired,
      deadline_date: PropTypes.string.isRequired,
    }),
  ),
};
