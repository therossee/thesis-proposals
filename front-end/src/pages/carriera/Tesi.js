import React, { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import API from '../../API';
import { BodyDataLoadingContext } from '../../App';
import CustomBadge from '../../components/CustomBadge';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import Thesis from '../../components/Thesis';
import ThesisApplication from '../../components/ThesisApplication';


export default function Tesi() {
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const [thesisApplication, setThesisApplication] = useState(null);
  const [thesis, setThesis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

useEffect(() => {
  setBodyDataLoading(true);
  setIsLoading(true);

  Promise.all([
    API.getLoggedStudentThesis()
      .then((data) => {
        setThesis(data);
      })
      .catch((error) => {
        console.error('Error fetching thesis:', error);
        setThesis(null);
      }),
    
    API.getLastStudentApplication()
      .then((appData) => {
        setThesisApplication(appData);
      })
      .catch((appError) => {
        console.error('Error fetching thesis application:', appError);
        setThesisApplication(null);
      })
  ])
  .finally(() => {
    setIsLoading(false);
    setBodyDataLoading(false);
  });

}, [setBodyDataLoading]);

    const renderContent = () => {
      if (isLoading) {
        return <></>;
      } else if (thesis) {
        return <Thesis thesis={thesis}  />;
      } else if (thesisApplication) {
        return <ThesisApplication thesisApplication={thesisApplication}  />;
      } else {
        return <CustomBadge variant="error" content={t('carriera.tesi.error')} />;
      }
    };

  return (
    <>
      <CustomBreadcrumb />
      {renderContent()}
    </>
  );
}
