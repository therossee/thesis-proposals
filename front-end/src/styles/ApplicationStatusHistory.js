import React from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import moment from 'moment';
import '../styles/status-history.css';

export default function ApplicationStatusHistory({ statusHistory }) {
  const { t } = useTranslation();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'approved':
        return 'circle-check';
      case 'rejected':
        return 'circle-xmark';
      case 'canceled':
        return 'ban';
      default:
        return 'circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'canceled':
        return 'status-canceled';
      default:
        return 'status-default';
    }
  };

  return (
    <Card className="status-history-card">
      <Card.Body>
        <h5 className="status-history-title">
          <i className="fa-solid fa-clock-rotate-left me-2" />
          {t('carriera.tesi.status_history.title')}
        </h5>
        
        <div className="status-history-timeline">
          {statusHistory.map((entry, index) => (
            <div key={index} className={`status-history-item ${index === statusHistory.length - 1 ? 'last' : ''}`}>
              <div className="status-history-marker">
                <div className={`status-history-icon ${getStatusColor(entry.status)}`}>
                  <i className={`fa-solid fa-${getStatusIcon(entry.status)}`} />
                </div>
                {index < statusHistory.length - 1 && <div className="status-history-line" />}
              </div>
              
              <div className="status-history-content">
                <div className="status-history-status">
                  <strong>{t(`carriera.tesi.status.${entry.status}`)}</strong>
                </div>
                <div className="status-history-date">
                  {moment(entry.timestamp).format('DD/MM/YYYY - HH:mm')}
                </div>
                {entry.note && (
                  <div className="status-history-note">
                    <i className="fa-solid fa-comment me-1" />
                    {entry.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

ApplicationStatusHistory.propTypes = {
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      note: PropTypes.string,
    })
  ).isRequired,
};