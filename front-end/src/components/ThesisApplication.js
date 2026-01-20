import React, { useEffect, useRef, useState } from 'react';
import { Card, Col, Row, Button, Modal, Toast } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../styles/utilities.css';
import '../styles/thesis-item.css';
import CustomBadge from './CustomBadge';
import CustomBlock from './CustomBlock';
import ApplicationProgressTracker from './ApplicationProgressTracker';
import TeacherContactCard from './TeacherContactCard';
import moment from 'moment';
import API from '../API';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { ThemeContext } from '../App';
import { getSystemTheme } from '../utils/utils';

export default function ThesisApplication({ thesisApplication, startThesis }) {
  const teachers = [thesisApplication.supervisor, ...thesisApplication.coSupervisors];
  const [statusHistory, setStatusHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [success, setSuccess] = useState(true);
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;

  const { t } = useTranslation();

  useEffect(() => {
    API.getStatusHistoryApplication(thesisApplication.id)
      .then((data) => {
        setStatusHistory(data);
      })
      .catch((error) => {
        console.error('Error fetching status history:', error);
        setStatusHistory([]);
      });
  }, [thesisApplication]);

  const handleStart = () => {
    startThesis(setShowToast, setSuccess);
    setShowModal(false);
  };


  return thesisApplication && (
    <>
      <div className="custom-toast-wrapper">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={5000}
          autohide
          className={`custom-toast ${success ? 'custom-toast--success' : 'custom-toast--error'}`}
        >
          <div className="d-flex align-items-start gap-2 w-100">
            <span className="custom-toast__icon">
              <i
                className={success ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle-xmark'}
                aria-hidden="true"
              />
            </span>
            <div className="custom-toast__content">
              <strong className="custom-toast__title">
                {success
                  ? t('carriera.tesi.success_thesis_started')
                  : t('carriera.tesi.error_thesis_started')}
              </strong>
              <p className="custom-toast__message mb-0">
                {success
                  ? t('carriera.tesi.success_thesis_started_content')
                  : t('carriera.tesi.error_thesis_started_content')}
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
                <Row className='d-flex justify-content-between align-items-center'>
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
                {thesisApplication.description && (
                  <CustomBlock icon="info-circle" title="carriera.proposte_di_tesi.description" ignoreMoreLines>
                    {thesisApplication.description || '-'}
                  </CustomBlock>
                )}



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
          <Col>
            <Card className="mb-3 roundCard py-2">
              <Card.Header className="border-0">
                <h3 className="thesis-topic">
                  <i className="fa-solid fa-timeline fa-sm pe-2" />
                  {t("carriera.tesi.progress_application.title")}
                </h3>
              </Card.Header>
              <Card.Body>
                <ApplicationProgressTracker
                  status={thesisApplication.status}
                  statusHistory={statusHistory}
                />
                {thesisApplication.status === 'approved' && (
                  <div className="mt-3 d-flex justify-content-end">
                    <Button className={`btn-${appliedTheme}`} size="md" onClick={() => setShowModal(true)}>
                      {t('carriera.tesi.proceed_to_thesis')}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <ThesisStartModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleStart={handleStart}
        />
      </div>
    </>
  );
}


function ThesisStartModal({ show, handleClose, handleStart }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;


  return (
    <Modal
      show={show}
      onHide={handleClose}
      contentClassName="modal-content"
      backdropClassName="modal-overlay"
      centered
    >
      <Modal.Header closeButton={true} className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fa-regular fa-circle-exclamation" />
          {` `}{t('carriera.tesi.start_thesis')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {t('carriera.tesi.start_thesis_content')}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button className="modal-cancel mb-3" size="md" onClick={handleClose}>
          {t('carriera.tesi.close')}
        </Button>
        <Button className="modal-confirm mb-3" size="md" onClick={handleStart}>
          <i className="fa-regular fa-arrow-up-right-from-square"></i>
          {t('carriera.proposta_di_tesi.prosegui')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


ThesisApplication.propTypes = {
  thesisApplication: PropTypes.shape({
    id: PropTypes.number.isRequired,
    topic: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    submissionDate: PropTypes.string,
    description: PropTypes.string,
    company: PropTypes.shape({
      name: PropTypes.string,
      internshipPeriod: PropTypes.string,
      contact: PropTypes.string,
    }),
    thesisProposal: PropTypes.shape({
      keywords: PropTypes.arrayOf(PropTypes.string),
      level: PropTypes.string,
      type: PropTypes.string,
      expiration: PropTypes.string,
      requiredKnowledge: PropTypes.string,
      notes: PropTypes.string,
    }),
    supervisor: PropTypes.object.isRequired,
    coSupervisors: PropTypes.array,
  }).isRequired,
};

ThesisStartModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  startThesis: PropTypes.func.isRequired,
};