import React, { useContext, useEffect, useState } from 'react';

import API from '../../API';
import { BodyDataLoadingContext, LoggedStudentContext } from '../../App';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import LoadingModal from '../../components/LoadingModal';
import Thesis from '../../components/Thesis';
import ThesisApplication from '../../components/ThesisApplication';
import ThesisNotFound from '../../components/ThesisNotFound';

export default function Tesi() {
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const [thesisApplication, setThesisApplication] = useState(null);
  const [thesis, setThesis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loggedStudent } = useContext(LoggedStudentContext);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setBodyDataLoading(true);
    setIsLoading(true);

    Promise.all([
      API.getLoggedStudentThesis()
        .then(data => {
          setThesis(data);
        })
        .catch(error => {
          console.error('Error fetching thesis:', error);
          setThesis(null);
        }),

      API.getLastStudentApplication()
        .then(appData => {
          setThesisApplication(appData);
        })
        .catch(appError => {
          console.error('Error fetching thesis application:', appError);
          setThesisApplication(null);
        }),
    ]).finally(() => {
      setIsLoading(false);
      setBodyDataLoading(false);
    });
  }, [setBodyDataLoading, loggedStudent, refreshTrigger]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingModal show={isLoading} onHide={() => setIsLoading(false)} />;
    } else if (thesis) {
      return <Thesis thesis={thesis} />;
    } else if (thesisApplication) {
      return (
        <ThesisApplication
          thesisApplication={thesisApplication}
          setRefreshTrigger={() => setRefreshTrigger(prev => prev + 1)}
        />
      );
    } else {
      return <ThesisNotFound />;
    }
  };

  return (
    <>
      <CustomBreadcrumb />
      {renderContent()}
    </>
  );
}
