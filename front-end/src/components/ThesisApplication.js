import React, { useContext, useEffect, useState } from 'react';

import { Button, Card, Col, Modal, Row, Toast } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import PropTypes from 'prop-types';

import API from '../API';
import { ThemeContext } from '../App';
import '../styles/thesis-item.css';
import '../styles/utilities.css';
import { getSystemTheme } from '../utils/utils';
import ApplicationProgressTracker from './ApplicationProgressTracker';
import CustomBlock from './CustomBlock';
import TeacherContactCard from './TeacherContactCard';

export default function ThesisApplication({ thesisApplication }) {
  const [statusHistory, setStatusHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [note, setNote] = useState('');
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;
  const visible = thesisApplication.status !== 'canceled' && thesisApplication.status !== 'rejected';
  const { t } = useTranslation();

  useEffect(() => {
    if (!thesisApplication) return;
    API.getStatusHistoryApplication(thesisApplication.id)
      .then(data => {
        setStatusHistory(data);
      })
      .catch(error => {
        console.error('Error fetching status history:', error);
        setStatusHistory([]);
      });
  }, [thesisApplication, thesisApplication?.status]);

  const handleCancel = () => {
    API.cancelThesisApplication({ id: thesisApplication.id, note })
      .then(() => {
        setShowToast(true);
        setCanceled(true);
        thesisApplication.status = 'canceled';
      })
      .catch(() => {
        setShowToast(true);
      })
      .finally(() => {
        setShowModal(false);
      });
  };

  return (
    thesisApplication && (
      <>
        <div className="custom-toast-wrapper">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={5000}
            autohide
            className={`custom-toast ${canceled ? 'custom-toast--success' : 'custom-toast--error'}`}
          >
            <div className="d-flex align-items-start gap-2 w-100">
              <span className="custom-toast__icon">
                <i
                  className={canceled ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle-xmark'}
                  aria-hidden="true"
                />
              </span>
              <div className="custom-toast__content">
                <strong className="custom-toast__title">
                  {canceled
                    ? t('carriera.tesi.success_application_canceled')
                    : t('carriera.tesi.error_application_canceled')}
                </strong>
                <p className="custom-toast__message mb-0">
                  {canceled
                    ? t('carriera.tesi.success_application_canceled_content')
                    : t('carriera.tesi.error_application_canceled_content')}
                </p>
              </div>
              <button
                type="button"
                className="custom-toast__close"
                onClick={() => setShowToast(false)}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </Toast>
        </div>
        <div className="proposals-container">
          <Row className="mb-3">
            <Col>
              <Card className="mb-3 roundCard py-2">
                <Card.Header className="border-0">
                  <h3 className="thesis-topic">
                    <i className="fa-solid fa-timeline fa-sm pe-2" />
                    {t('carriera.tesi.progress_application.title')}
                  </h3>
                </Card.Header>
                <Card.Body>
                  <ApplicationProgressTracker status={thesisApplication.status} statusHistory={statusHistory} />
                  <div className="mt-3 d-flex justify-content-end gap-3">
                    {visible && (
                      <Button variant="outline-danger" size="md" onClick={() => setShowModal(true)}>
                        <i className="fa-solid fa-ban me-2"></i>
                        {t('carriera.tesi.cancel_application')}
                      </Button>
                    )}
                    {thesisApplication.status === 'approved' && (
                      <Button className={`btn-${appliedTheme}`} size="md" onClick={() => setShowModal(true)}>
                        {t('carriera.tesi.proceed_to_thesis')}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="mb-3 roundCard py-2">
                <Card.Header className="border-0">
                  <Row className="d-flex justify-content-between align-items-center">
                    <Col xs={12} style={{ marginBottom: '10px' }}>
                      <h3 className="thesis-topic">
                        <i className="fa-solid fa-graduation-cap fa-sm pe-2" />
                        {t('carriera.tesi.your_application')}
                      </h3>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body className="pt-2 pb-0">
                  <CustomBlock icon="book-open" title="carriera.proposte_di_tesi.topic">
                    {thesisApplication.topic}
                  </CustomBlock>

                  <CustomBlock icon="calendar-clock" title="carriera.tesi.submission_date">
                    {moment(thesisApplication.submissionDate).format('DD/MM/YYYY - HH:mm')}
                  </CustomBlock>
                </Card.Body>
              </Card>
              <TeacherContactCard
                supervisor={thesisApplication.supervisor}
                coSupervisors={thesisApplication.coSupervisors}
              />
            </Col>
          </Row>
          <ThesisCancelModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleCancel={handleCancel}
            handleNoteChange={e => setNote(e.target.value)}
          />
        </div>
      </>
    )
  );
}

function ThesisCancelModal({ show, handleClose, handleCancel, handleNoteChange }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;

  return (
    <Modal show={show} onHide={handleClose} contentClassName="modal-content" backdropClassName="modal-overlay" centered>
      <Modal.Header closeButton={true} className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fa-regular fa-circle-exclamation" />
          {` `}
          {t('carriera.tesi.cancel_application')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {t('carriera.tesi.cancel_application_content')}
        <textarea
          className="form-control mt-3 textarea-themed"
          rows="4"
          placeholder={t('carriera.tesi.cancel_application_note_placeholder')}
          onChange={handleNoteChange}
        />
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button className="modal-cancel mb-3" size="md" onClick={handleClose}>
          {t('carriera.tesi.close')}
        </Button>
        <Button className={`btn-primary-${appliedTheme} mb-3`} size="md" onClick={handleCancel}>
          <i className="fa-solid fa-paper-plane"></i>
          {t('carriera.tesi.confirm_cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ThesisApplication.propTypes = {
  thesisApplication: PropTypes.shape({
    id: PropTypes.number.isRequired,
    topic: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    submissionDate: PropTypes.string.isRequired,
    supervisor: PropTypes.object.isRequired,
    coSupervisors: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  startThesis: PropTypes.func.isRequired,
};

ThesisCancelModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleNoteChange: PropTypes.func.isRequired,
};
