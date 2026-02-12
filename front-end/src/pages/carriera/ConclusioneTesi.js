import React, { useContext } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ToastContext } from '../../App';
import ConclusionRequest from '../../components/ConclusionRequest';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import CustomHeader from '../../components/CustomHeader';
import '../../styles/tesi.css';

export default function ConclusioneTesi() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const handleConclusionRequestResult = success => {
    if (success) {
      showToast({
        success: true,
        title: t('carriera.conclusione_tesi.request_submitted_title'),
        message: t('carriera.conclusione_tesi.request_submitted_content'),
      });
    } else {
      showToast({
        success: false,
        title: t('carriera.conclusione_tesi.request_submission_failed_title'),
        message: t('carriera.conclusione_tesi.request_submission_failed_content'),
      });
    }
  };

  return (
    <>
      <CustomBreadcrumb />
      <div className="proposal-container justify-content-between d-flex tesi-header-bar tesi-header-bar--flush-right">
        <CustomHeader title={t('carriera.conclusione_tesi.title')} action={() => navigate(-1)} />
        <div className="tesi-header-actions">
          <Button className="btn-outlined-light tesi-header-action-btn d-flex align-items-center" type="button">
            <i className="fa-regular fa-floppy-disk me-2" />
            {t('carriera.conclusione_tesi.save_draft')}
          </Button>
        </div>
      </div>
      <ConclusionRequest onSubmitResult={handleConclusionRequestResult} />
    </>
  );
}
