import React, { useContext, useEffect, useRef, useState } from 'react';

import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';

import API from '../API';
import { ThemeContext } from '../App';
import '../styles/conclusion-process.css';
import { getSystemTheme } from '../utils/utils';
import CustomModal from './CustomModal';
import LoadingModal from './LoadingModal';

function FinalThesisUpload({ show, setShow, onSubmitResult }) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [resumePdf, setResumePdf] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;
  const [requiredResume, setRequiredResume] = useState(false);
  const resumeInputRef = useRef(null);
  const thesisInputRef = useRef(null);

  const resetForm = () => {
    setResumePdf(null);
    setPdfFile(null);
  };

  useEffect(() => {
    API.getRequiredResumeForLoggedStudent()
      .then(requiredResumeData => {
        if (requiredResumeData) {
          setRequiredResume(Boolean(requiredResumeData.requiredResume));
        }
      })
      .catch(error => {
        console.error('Error fetching required resume data:', error);
      });
  }, []);

  const handleUpload = async () => {
    if (!pdfFile || (requiredResume && !resumePdf)) return;

    setIsSubmitting(true);
    setShow(false);
    setShowConfirmationModal(false);
    API.uploadFinalThesis(pdfFile, requiredResume ? resumePdf : null)
      .then(() => {
        onSubmitResult(true);
        resetForm();
        setShow(false);
      })
      .catch(error => {
        console.error('Error uploading final thesis:', error);
        onSubmitResult(false);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const canSubmit = !!pdfFile && (!requiredResume || !!resumePdf) && !isSubmitting;
  const removeFileText = i18n.language === 'it' ? 'Rimuovi file' : 'Remove file';

  return (
    <>
      {isSubmitting && <LoadingModal show={isSubmitting} onHide={() => setIsSubmitting(false)} />}
      <Modal show={show} onHide={() => setShow(false)} centered contentClassName="conclusion-process-content-shell">
        <Modal.Header closeButton>
          <Modal.Title className="cr-modal-title">
            <i className="fa-regular fa-file-upload me-2" />
            {t('carriera.conclusione_tesi.final_thesis_modal.title')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="conclusion-process-content cr-clean">
            <div className="cr-section">
              <div className="cr-section-description mb-4 text-center">
                {t('carriera.conclusione_tesi.final_thesis_modal.instructions')}
              </div>
              <Row className="mb-2 g-3 justify-content-center">
                {requiredResume && (
                  <Col md={12}>
                    <div className="cr-upload-col">
                      <div className="cr-upload-header">
                        <Form.Label htmlFor="final-thesis-resume-pdfa">
                          {t('carriera.conclusione_tesi.summary_for_committee_pdfa')}
                        </Form.Label>
                        <div className="text-muted cr-upload-meta">
                          ({t('carriera.conclusione_tesi.max_size_20_mb')})
                        </div>
                      </div>
                      <Form.Group>
                        <Form.Control
                          ref={resumeInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={e => setResumePdf(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                          disabled={isSubmitting}
                          id="final-thesis-resume-pdfa"
                          required={requiredResume}
                          className="d-none"
                        />
                        <div className="cr-file-row">
                          <Button
                            type="button"
                            className={`btn-outlined-${appliedTheme} mb-0`}
                            onClick={() => resumeInputRef.current?.click()}
                            disabled={isSubmitting}
                          >
                            <i className="fa-regular fa-upload me-2" />
                            {t('carriera.conclusione_tesi.select_file')}
                          </Button>
                          <div className="text-muted cr-file-name-line">
                            <span className="cr-file-name">
                              {resumePdf ? resumePdf.name : t('carriera.conclusione_tesi.no_file_selected')}
                            </span>
                            {resumePdf && (
                              <Button
                                variant="link"
                                className="cr-file-remove p-0"
                                onClick={() => setResumePdf(null)}
                                disabled={isSubmitting}
                                title={removeFileText}
                                aria-label={removeFileText}
                              >
                                <i className="fa-regular fa-trash-can" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Form.Group>
                    </div>
                  </Col>
                )}
                <Col md={12}>
                  <div className="cr-upload-col">
                    <div className="cr-upload-header">
                      <Form.Label htmlFor="final-thesis-pdfa">
                        {t('carriera.conclusione_tesi.final_thesis_pdfa')}
                      </Form.Label>
                      <div className="text-muted cr-upload-meta">
                        ({t('carriera.conclusione_tesi.max_size_200_mb')})
                      </div>
                    </div>
                    <Form.Group>
                      <Form.Control
                        ref={thesisInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdfFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                        disabled={isSubmitting}
                        id="final-thesis-pdfa"
                        required
                        className="d-none"
                      />
                      <div className="cr-file-row">
                        <Button
                          type="button"
                          className={`btn-outlined-${appliedTheme} mb-0`}
                          onClick={() => thesisInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          <i className="fa-regular fa-upload me-2" />
                          {t('carriera.conclusione_tesi.select_file')}
                        </Button>
                        <div className="text-muted cr-file-name-line">
                          <span className="cr-file-name">
                            {pdfFile ? pdfFile.name : t('carriera.conclusione_tesi.no_file_selected')}
                          </span>
                          {pdfFile && (
                            <Button
                              variant="link"
                              className="cr-file-remove p-0"
                              onClick={() => setPdfFile(null)}
                              disabled={isSubmitting}
                              title={removeFileText}
                              aria-label={removeFileText}
                            >
                              <i className="fa-regular fa-trash-can" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Form.Group>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2">
          <Button className={`btn-outlined-${appliedTheme} mb-3`} size="md" onClick={() => resetForm()}>
            <i className="fa-solid fa-rotate-left pe-2" />
            Reset
          </Button>

          <Button
            className={`btn-primary-${appliedTheme}`}
            onClick={() => {
              setShowConfirmationModal(true);
              setShow(false);
            }}
            disabled={!canSubmit}
          >
            <i className="fa-solid fa-paper-plane pe-2" />
            {isSubmitting ? t('carriera.conclusione_tesi.sending') : t('carriera.conclusione_tesi.final_thesis_upload')}
          </Button>
        </Modal.Footer>
      </Modal>
      <CustomModal
        show={showConfirmationModal}
        handleClose={() => {
          setShowConfirmationModal(false);
          setShow(true);
        }}
        handleConfirm={handleUpload}
        titleText={t('carriera.conclusione_tesi.final_thesis_modal.title')}
        bodyText={t('carriera.conclusione_tesi.final_thesis_modal.body')}
        confirmText={t('carriera.conclusione_tesi.final_thesis_modal.confirm_button')}
        confirmIcon="fa-solid fa-paper-plane"
        closeText={t('carriera.conclusione_tesi.final_thesis_modal.cancel_button')}
        isLoading={isSubmitting}
      />
    </>
  );
}

FinalThesisUpload.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onSubmitResult: PropTypes.func.isRequired,
};

export default FinalThesisUpload;
