import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, Card, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';

import API from '../API';
import { LoggedStudentContext, ThemeContext } from '../App';
import '../styles/conclusion-process.css';
import { getSystemTheme } from '../utils/utils';
import CustomModal from './CustomModal';
import CustomSteps from './CustomSteps';
import LoadingModal from './LoadingModal';
import NotEligible from './NotEligible';
import { ConclusionRequestProvider } from './conclusion-request-steps/ConclusionRequestContext';
import StepAuthorization from './conclusion-request-steps/StepAuthorization';
import StepDeclarations from './conclusion-request-steps/StepDeclarations';
import StepDetails from './conclusion-request-steps/StepDetails';
import StepOutcome from './conclusion-request-steps/StepOutcome';
import StepSubmit from './conclusion-request-steps/StepSubmit';
import StepUploads from './conclusion-request-steps/StepUploads';

export default function ConclusionRequest({ onSubmitResult }) {
  const { t, i18n } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { loggedStudent } = useContext(LoggedStudentContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;

  const [error, setError] = useState('');

  const [titleText, setTitleText] = useState('');
  const [titleEngText, setTitleEngText] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [abstractEngText, setAbstractEngText] = useState('');

  const [supervisor, setSupervisor] = useState(null);
  const [coSupervisors, setCoSupervisors] = useState([]);
  const [thesis, setThesis] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [lang, setLang] = useState('it');
  const [licenses, setLicenses] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [keywordsList, setKeywordsList] = useState([]);
  const [embargoMotivationsList, setEmbargoMotivationsList] = useState([]);

  const [primarySdg, setPrimarySdg] = useState('');
  const [secondarySdg1, setSecondarySdg1] = useState('');
  const [secondarySdg2, setSecondarySdg2] = useState('');

  const [authorization, setAuthorization] = useState('');
  const [licenseChoice, setLicenseChoice] = useState(6);
  const [embargoPeriod, setEmbargoPeriod] = useState('');
  const [embargoMotivations, setEmbargoMotivations] = useState([]);
  const [otherEmbargoReason, setOtherEmbargoReason] = useState('');

  const [requiredResume, setRequiredResume] = useState(false);
  const [resumePdf, setResumePdf] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [supplementaryZip, setSupplementaryZip] = useState(null);
  const [decl, setDecl] = useState({
    decl1: false,
    decl2: false,
    decl3: false,
    decl4: false,
    decl5: false,
    decl6: false,
  });

  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSdgDescription, setShowSdgDescription] = useState(false);
  const [submissionOutcome, setSubmissionOutcome] = useState(null);
  const [navButtonsWidth, setNavButtonsWidth] = useState(null);

  const formBodyRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  const toOption = teacher => ({
    value: teacher.id,
    label: `${teacher.lastName} ${teacher.firstName}`,
    email: teacher.email,
    variant: 'teacher',
  });

  const languageOptions = [
    { value: 'it', label: t('carriera.conclusione_tesi.languages.it') },
    { value: 'en', label: t('carriera.conclusione_tesi.languages.en') },
  ];

  const flagSelector = () => {
    switch (lang) {
      case 'it':
        return 'fi fi-it';
      case 'en':
        return 'fi fi-gb';
      default:
        return 'fi fi-it';
    }
  };

  const selectedLanguage = languageOptions.find(option => option.value === lang) || languageOptions[0];

  const coSupervisorOptions = useMemo(() => {
    const supervisorId = supervisor ? supervisor.value : null;
    return teachers.filter(teacher => teacher.id !== supervisorId).map(toOption);
  }, [teachers, supervisor]);

  useEffect(() => {
    setIsLoading(true);
    setError('');

    Promise.all([
      API.getLoggedStudentThesis(),
      API.getThesisProposalsTeachers(),
      API.getAvailableLicenses(i18n.language),
      API.getSustainableDevelopmentGoals(),
      API.getEmbargoMotivations(i18n.language),
      API.getThesisProposalsKeywords(i18n.language),
      API.getRequiredResumeForLoggedStudent(),
    ])
      .then(
        ([
          thesisData,
          teachersData,
          licensesData,
          sdgsData,
          embargoMotivationsData,
          keywordsData,
          requiredResumeData,
        ]) => {
          if (teachersData) setTeachers(teachersData);

          if (thesisData) {
            if (thesisData.supervisor) setSupervisor(toOption(thesisData.supervisor));
            setThesis(thesisData);
            setAbstractText(thesisData.topic || '');
            const coSup = thesisData.coSupervisors || thesisData.co_supervisors || [];
            setCoSupervisors(coSup.map(toOption));
          }
          if (licensesData) {
            setLicenses(licensesData);
          }
          if (sdgsData) {
            setSdgs(sdgsData);
          }
          if (embargoMotivationsData) {
            setEmbargoMotivationsList(embargoMotivationsData);
          }
          if (keywordsData) {
            setKeywordsList(keywordsData);
          }
          if (requiredResumeData) {
            setRequiredResume(Boolean(requiredResumeData.requiredResume));
          }
        },
      )
      .catch(err => {
        console.error('Error loading conclusion request data:', err);
        setError('Errore nel caricamento dei dati. Riprova.');
        console.error(error);
      })
      .finally(() => setIsLoading(false));
  }, [i18n.language, loggedStudent?.id]);

  const sdgOptions = useMemo(() => {
    return (sdgs || []).map(sdg => ({
      value: sdg.id ?? sdg.value,
      label: sdg.goal ? `${sdg.id} - ${sdg.goal}` : sdg.label || `SDG ${sdg.id ?? sdg.value}`,
    }));
  }, [sdgs, t]);

  const isNotApplicableSdg = option => {
    const text = String(option?.label || '').toLowerCase();
    return text.includes('not applicable') || text.includes('non applicabile');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError('');
  };

  const toggleMotivation = (code, checked) => {
    setEmbargoMotivations(prev => {
      if (checked) return prev.includes(code) ? prev : [...prev, code];
      return prev.filter(x => x !== code);
    });
  };

  const allDeclarationsChecked = () => {
    switch (authorization) {
      case 'deny':
        return decl.decl1 && decl.decl3 && decl.decl4 && decl.decl5 && decl.decl6;
      case 'authorize':
        return decl.decl1 && decl.decl2 && decl.decl3 && decl.decl4 && decl.decl5 && decl.decl6;
      default:
        return false;
    }
  };

  const needsEnglishTranslation = lang !== 'en';

  const detailsValid =
    supervisor &&
    String(titleText || '').trim().length > 0 &&
    String(abstractText || '').trim().length > 0 &&
    abstractText.length <= 3550 &&
    (!needsEnglishTranslation || String(titleEngText || '').trim().length > 0) &&
    (!needsEnglishTranslation || String(abstractEngText || '').trim().length > 0) &&
    (!needsEnglishTranslation || abstractEngText.length <= 3550) &&
    String(primarySdg || '').trim().length > 0 &&
    String(secondarySdg1 || '').trim().length > 0 &&
    String(secondarySdg2 || '').trim().length > 0;

  const resumeValid = !requiredResume || !!resumePdf;
  const baseValid = detailsValid && allDeclarationsChecked() && !!pdfFile && resumeValid; // almeno la tesi pdf/a deve esserci per inviare

  const denyValid =
    authorization !== 'deny'
      ? true
      : embargoMotivations.length > 0 &&
        String(embargoPeriod || '').trim().length > 0 &&
        (!embargoMotivations.includes('0') || String(otherEmbargoReason || '').trim().length > 0);

  const authorizeValid = authorization !== 'authorize' ? true : String(licenseChoice || '').trim().length > 0;
  const authorizationSelected = authorization === 'authorize' || authorization === 'deny';

  const canSubmit = baseValid && denyValid && authorizeValid;

  const steps = [
    { key: 'details', label: t('carriera.conclusione_tesi.steps.details') },
    { key: 'authorization', label: t('carriera.conclusione_tesi.steps.authorizations') },
    { key: 'uploads', label: t('carriera.conclusione_tesi.steps.uploads') },
    { key: 'declarations', label: t('carriera.conclusione_tesi.steps.declarations') },
    {
      key: 'submit',
      label: submissionOutcome
        ? t('carriera.conclusione_tesi.steps.outcome')
        : t('carriera.conclusione_tesi.steps.submit'),
    },
  ];

  const stepValidity = [
    detailsValid,
    authorizationSelected && denyValid && authorizeValid,
    !!pdfFile && resumeValid,
    allDeclarationsChecked(),
    canSubmit,
  ];
  const shouldSyncNavButtonsWidth = currentStep < steps.length - 1;

  const submitStepIndex = steps.length - 1;
  const stepItems = steps.map((step, index) => {
    if (index === submitStepIndex && currentStep === submitStepIndex) {
      if (submissionOutcome === 'success') return { label: step.label, status: 'done' };
      if (submissionOutcome === 'error') return { label: step.label, status: 'error' };
    }

    return {
      label: step.label,
      status:
        index < currentStep
          ? stepValidity[index]
            ? 'done'
            : 'in-progress'
          : index === currentStep
            ? 'current'
            : 'todo',
    };
  });

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (formBodyRef.current) {
      formBodyRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (submissionOutcome || !shouldSyncNavButtonsWidth) {
      setNavButtonsWidth(null);
      return;
    }

    const calculateButtonsWidth = () => {
      const prevWidth = prevButtonRef.current?.getBoundingClientRect().width || 0;
      const nextWidth = nextButtonRef.current?.getBoundingClientRect().width || 0;
      const maxWidth = Math.max(prevWidth, nextWidth);
      setNavButtonsWidth(maxWidth > 0 ? Math.ceil(maxWidth) : null);
    };

    calculateButtonsWidth();
    window.addEventListener('resize', calculateButtonsWidth);
    return () => window.removeEventListener('resize', calculateButtonsWidth);
  }, [currentStep, submissionOutcome, i18n.language, isSubmitting, shouldSyncNavButtonsWidth]);

  const handleUpload = async () => {
    setError('');
    if (!canSubmit) {
      setError('Compila tutti i campi obbligatori prima di inviare la richiesta.');
      return;
    }

    setIsSubmitting(true);
    try {
      setShowConfirmationModal(false);
      const formData = new FormData();
      formData.append('title', titleText);
      formData.append('titleEng', titleEngText === '' ? titleText : titleEngText);
      formData.append('abstract', abstractText);
      formData.append('abstractEng', abstractEngText === '' ? abstractText : abstractEngText);
      formData.append('language', lang);
      if (supervisor?.id) formData.append('supervisor', supervisor.id);
      if (coSupervisors?.length) {
        formData.append('coSupervisors', JSON.stringify(coSupervisors.map(cs => ({ id: cs.value ?? cs.id ?? cs }))));
      }
      if (keywords?.length) {
        const keywordPayload = keywords.map(k => k?.id ?? k?.value ?? k);
        formData.append('keywords', JSON.stringify(keywordPayload));
      }
      if (authorization === 'authorize') {
        formData.append('licenseId', licenseChoice);
      }
      if (primarySdg || secondarySdg1 || secondarySdg2) {
        formData.append(
          'sdgs',
          JSON.stringify([
            ...(primarySdg ? [{ id: primarySdg, level: 'primary' }] : []),
            ...(secondarySdg1 ? [{ id: secondarySdg1, level: 'secondary' }] : []),
            ...(secondarySdg2 ? [{ id: secondarySdg2, level: 'secondary' }] : []),
          ]),
        );
      }
      if (authorization === 'deny') {
        formData.append(
          'embargo',
          JSON.stringify({
            duration: embargoPeriod,
            motivations: embargoMotivations.map(m => ({
              id: m,
              other: m === 7 ? otherEmbargoReason : undefined,
            })),
          }),
        );
      }
      if (resumePdf) formData.append('thesisResume', resumePdf);
      if (pdfFile) formData.append('thesisFile', pdfFile);
      if (supplementaryZip) formData.append('additionalZip', supplementaryZip);

      await API.sendThesisConclusionRequest(formData);

      setSubmissionOutcome('success');
      setCurrentStep(steps.length - 1);
      onSubmitResult(true);
      handleClose();
    } catch (err) {
      console.error(err);
      setError('Invio fallito. Controlla i campi e riprova.');
      setSubmissionOutcome('error');
      setCurrentStep(steps.length - 1);
      onSubmitResult(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkRecommendedLicense = license => {
    return license.name ? license.name.includes('CC BY-NC-ND') : license.name_en.includes('CC BY-NC-ND');
  };

  const selectedLanguageLabel = selectedLanguage?.label || '-';
  const selectedLicense = licenses.find(license => license.id === licenseChoice) || null;
  const selectedLicenseLabel = selectedLicense
    ? i18n.language === 'it'
      ? selectedLicense.name
      : selectedLicense.name_en
    : '-';
  const selectedSdgLabels = [
    sdgOptions.find(option => option.value === primarySdg)?.label || null,
    sdgOptions.find(option => option.value === secondarySdg1)?.label || null,
    sdgOptions.find(option => option.value === secondarySdg2)?.label || null,
  ].filter(Boolean);
  const selectedEmbargoLabels = embargoMotivations
    .map(id => embargoMotivationsList.find(motivation => motivation.id === id))
    .filter(Boolean)
    .map(motivation => (i18n.language === 'it' ? motivation.motivation : motivation.motivation_en));
  const declarationsAcceptedCount = Object.values(decl).filter(Boolean).length;
  const declarationsTotalCount = authorization === 'authorize' ? 6 : 5;

  const removeFileText = i18n.language === 'it' ? 'Rimuovi file' : 'Remove file';
  const status = thesis?.status || thesis?.status;
  const canRequestConclusion = !status || ['ongoing', 'conclusion_rejected'].includes(status);
  const contextValue = useMemo(
    () => ({
      t,
      i18n,
      appliedTheme,
      supervisor,
      coSupervisorOptions,
      coSupervisors,
      setCoSupervisors,
      languageOptions,
      lang,
      selectedLanguage,
      setLang,
      titleText,
      setTitleText,
      titleEngText,
      setTitleEngText,
      abstractText,
      setAbstractText,
      abstractEngText,
      setAbstractEngText,
      keywords,
      setKeywords,
      keywordsList,
      needsEnglishTranslation,
      flagSelector,
      isSubmitting,
      showSdgDescription,
      setShowSdgDescription,
      sdgOptions,
      isNotApplicableSdg,
      primarySdg,
      setPrimarySdg,
      secondarySdg1,
      setSecondarySdg1,
      secondarySdg2,
      setSecondarySdg2,
      authorization,
      setAuthorization,
      embargoMotivationsList,
      embargoMotivations,
      toggleMotivation,
      otherEmbargoReason,
      setOtherEmbargoReason,
      embargoPeriod,
      setEmbargoPeriod,
      licenses,
      licenseChoice,
      setLicenseChoice,
      checkRecommendedLicense,
      resumePdf,
      setResumePdf,
      pdfFile,
      setPdfFile,
      supplementaryZip,
      setSupplementaryZip,
      removeFileText,
      decl,
      setDecl,
      allDeclarationsChecked,
      selectedLanguageLabel,
      selectedSdgLabels,
      selectedLicenseLabel,
      selectedEmbargoLabels,
      declarationsAcceptedCount,
      declarationsTotalCount,
      submissionOutcome,
      requiredResume,
    }),
    [
      t,
      i18n,
      appliedTheme,
      supervisor,
      coSupervisorOptions,
      coSupervisors,
      languageOptions,
      lang,
      selectedLanguage,
      titleText,
      titleEngText,
      abstractText,
      abstractEngText,
      keywords,
      keywordsList,
      needsEnglishTranslation,
      isSubmitting,
      showSdgDescription,
      sdgOptions,
      isNotApplicableSdg,
      primarySdg,
      secondarySdg1,
      secondarySdg2,
      authorization,
      embargoMotivationsList,
      embargoMotivations,
      otherEmbargoReason,
      embargoPeriod,
      licenses,
      licenseChoice,
      resumePdf,
      pdfFile,
      supplementaryZip,
      removeFileText,
      decl,
      selectedLanguageLabel,
      selectedSdgLabels,
      selectedLicenseLabel,
      selectedEmbargoLabels,
      declarationsAcceptedCount,
      declarationsTotalCount,
      submissionOutcome,
      requiredResume,
    ],
  );

  if (isLoading) return <LoadingModal show={true} onHide={() => setIsLoading(false)} />;
  if (!canRequestConclusion) {
    return <NotEligible />;
  }

  return (
    <>
      {(isLoading || isSubmitting) && <LoadingModal show={true} onHide={() => {}} />}
      <Col className="mx-auto cr-conclusion-layout">
        <Card className="mb-3 roundCard py-2 d-flex justify-content-center align-items-center cr-steps-card">
          <Card.Body className="w-100">
            <div className={`cr-steps-header-row ${submissionOutcome ? 'cr-steps-header-row--steps-only' : ''}`}>
              {!submissionOutcome && (
                <>
                  <div className="cr-steps-actions cr-steps-actions-left">
                    <Button
                      ref={prevButtonRef}
                      className={`btn-outlined-${appliedTheme} cr-steps-nav-btn`}
                      size="md"
                      onClick={goToPreviousStep}
                      disabled={isSubmitting}
                      aria-hidden={currentStep === 0}
                      tabIndex={currentStep === 0 ? -1 : undefined}
                      style={{
                        ...(shouldSyncNavButtonsWidth && navButtonsWidth ? { width: `${navButtonsWidth}px` } : {}),
                        ...(currentStep === 0 ? { visibility: 'hidden', pointerEvents: 'none' } : {}),
                      }}
                    >
                      <i className="fa-solid fa-arrow-left pe-2" />
                      {t('carriera.conclusione_tesi.previous_step')}
                    </Button>
                  </div>
                  <CustomSteps steps={stepItems} title="Stato richiesta" />
                  <div className="cr-steps-actions cr-steps-actions-right">
                    {currentStep < steps.length - 1 ? (
                      <Button
                        ref={nextButtonRef}
                        className={`btn-primary-${appliedTheme} cr-steps-nav-btn`}
                        onClick={goToNextStep}
                        disabled={isSubmitting || !stepValidity[currentStep]}
                        style={
                          shouldSyncNavButtonsWidth && navButtonsWidth ? { width: `${navButtonsWidth}px` } : undefined
                        }
                      >
                        {t('carriera.conclusione_tesi.next_step')} <i className="fa-solid fa-arrow-right ps-2" />
                      </Button>
                    ) : (
                      <Button
                        ref={nextButtonRef}
                        className={`btn-primary-${appliedTheme} cr-steps-nav-btn`}
                        onClick={() => {
                          setShowConfirmationModal(true);
                        }}
                        disabled={!canSubmit || isSubmitting}
                        style={undefined}
                      >
                        <i className="fa-solid fa-paper-plane pe-2" />
                        {isSubmitting ? t('carriera.conclusione_tesi.sending') : t('carriera.conclusione_tesi.submit')}
                      </Button>
                    )}
                  </div>
                </>
              )}
              {submissionOutcome && <CustomSteps steps={stepItems} title="Stato richiesta" />}
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-3 roundCard py-2 d-flex justify-content-center align-items-center cr-form-card">
          <Card.Body className="cr-form-body w-100" ref={formBodyRef}>
            <div className="conclusion-process-content cr-clean">
              <ConclusionRequestProvider value={contextValue}>
                <Form>
                  {currentStep === 0 && <StepDetails />}
                  {currentStep === 1 && <StepAuthorization />}
                  {currentStep === 2 && <StepUploads />}
                  {currentStep === 3 && <StepDeclarations />}
                  {currentStep === 4 && (submissionOutcome ? <StepOutcome /> : <StepSubmit />)}
                </Form>
              </ConclusionRequestProvider>
            </div>
          </Card.Body>
        </Card>
        <CustomModal
          show={showConfirmationModal}
          handleClose={() => {
            setShowConfirmationModal(false);
          }}
          handleConfirm={handleUpload}
          titleText={t('carriera.conclusione_tesi.confirmation_modal.title')}
          bodyText={t('carriera.conclusione_tesi.confirmation_modal.body')}
          confirmText={t('carriera.conclusione_tesi.confirmation_modal.confirm_button')}
          confirmIcon="fa-solid fa-paper-plane"
          closeText={t('carriera.conclusione_tesi.confirmation_modal.cancel_button')}
          isLoading={isSubmitting}
        />
      </Col>
    </>
  );
}

ConclusionRequest.propTypes = {
  onSubmitResult: PropTypes.func.isRequired,
};
