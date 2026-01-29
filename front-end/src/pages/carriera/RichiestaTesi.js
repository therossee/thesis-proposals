import React, { useContext, useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import API from '../../API';
import { BodyDataLoadingContext } from '../../App';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import Ineligible from '../../components/Ineligibile';
import ThesisApplicationForm from '../../components/ThesisApplicationForm';

export default function RichiestaTesi() {
  const { id } = useParams();
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const [eligible, setEligible] = useState(true);
  useEffect(() => {
    setBodyDataLoading(true);
    API.checkStudentEligibility()
      .then(data => {
        setEligible(data.eligible);
      })
      .catch(error => {
        console.error('Error checking student eligibility:', error);
      })
      .finally(() => {
        setBodyDataLoading(false);
      });
  }, [setBodyDataLoading]);

  return eligible ? (
    <>
      <CustomBreadcrumb />
      <ThesisApplicationForm proposalId={id} />
    </>
  ) : (
    <Ineligible />
  );
}
