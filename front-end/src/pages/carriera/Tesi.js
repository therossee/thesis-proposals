import React, { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import API from '../../API';
import { BodyDataLoadingContext, LoggedStudentContext } from '../../App';
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
  const { loggedStudent } = useContext(LoggedStudentContext);

const startThesis = (setShowToast, setSuccess) => {
  API.startThesisFromApplication({
    thesisApplicationDate: thesisApplication.submissionDate,
    company: thesisApplication.company,
    topic: thesisApplication.topic,
    supervisor: thesisApplication.supervisor,
    coSupervisors: thesisApplication.coSupervisors,
  })
    .then((data) => {
      console.log('Thesis started successfully:', data);
      setSuccess(true);
      setShowToast(true);
      
      // Ricarica la pagina dopo 5 secondi (stesso tempo del toast autohide)
      setTimeout(() => {
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
      }, 5000);
    })
    .catch((error) => {
      console.error('Error starting thesis from application:', error);
      setSuccess(false);
      setShowToast(true);
    });
};


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

}, [setBodyDataLoading, loggedStudent]);

    const renderContent = () => {
      if (isLoading) {
        return <></>;
      } else if (thesis) {
        return <Thesis thesis={thesis}  />;
      } else if (thesisApplication) {
        return <ThesisApplication thesisApplication={thesisApplication} startThesis={startThesis} />;
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
