import React, { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import ThesisApplicationForm from '../../components/ThesisApplicationForm';
import Ineligible from '../../components/Ineligibile';
import { BodyDataLoadingContext } from '../../App';
import API from '../../API';

export default function RichiestaTesi() {

  const { id } = useParams();
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const [eligible, setEligible] = useState(true);
    useEffect(() => {
        setBodyDataLoading(true);
        API.checkStudentEligibility()
            .then((data) => {
                setEligible(data.eligible);
            })
            .catch((error) => {
                console.error('Error checking student eligibility:', error);
            }
            )
            .finally(() => {
                setBodyDataLoading(false);
            });
    }, [setBodyDataLoading]);


  return (eligible ? <>
            <CustomBreadcrumb />
            <ThesisApplicationForm proposalId={id} />
        </> : <Ineligible />
  );
}
