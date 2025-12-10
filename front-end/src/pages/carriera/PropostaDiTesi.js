import React, { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import API from '../../API';
import { BodyDataLoadingContext, LoggedStudentContext } from '../../App';
import CustomBadge from '../../components/CustomBadge';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import ThesisProposalDetail from '../../components/ThesisProposalDetail';

function PropostaDiTesi() {
  const id = useParams().id;
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const { loggedStudent } = useContext(LoggedStudentContext);
  const [thesisProposal, setThesisProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setBodyDataLoading(true);
    setIsLoading(true);
    API.getThesisProposalById(id, i18n.language)
      .then(thesis => {
        setThesisProposal(thesis);
      })
      .catch(error => console.error('Error fetching thesis proposal by ID:', error))
      .finally(() => {
        setBodyDataLoading(false);
        setIsLoading(false);
      });
  }, [id, i18n.language]);

  useEffect(() => {
    if (!loggedStudent) return;
    console.log('Checking eligibility for student:', loggedStudent);
    API.checkStudentEligibility(loggedStudent.id)
      .then(eligible => {
        setIsEligible(eligible.eligible);
      })
      .catch(error => console.error('Error checking student eligibility:', error));
  }, [loggedStudent]);

  const renderContent = () => {
    if (isLoading) {
      return <></>;
    } else if (thesisProposal) {
      return <ThesisProposalDetail thesisProposal={thesisProposal} isEligible={isEligible} setIsEligible={setIsEligible} loggedStudentId={loggedStudent ? loggedStudent.id : null} />;
    } else {
      return <CustomBadge variant="error" content={t('carriera.proposta_di_tesi.errore_proposta_di_tesi')} />;
    }
  };

  return (
    <>
      <CustomBreadcrumb />
      {renderContent()}
    </>
  );
}

export default PropostaDiTesi;
