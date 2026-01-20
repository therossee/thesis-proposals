import React from 'react';
import { useParams } from 'react-router-dom';

import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import ThesisApplicationForm from '../../components/ThesisApplicationForm';

export default function RichiestaTesi() {
  const { id } = useParams();
  return <>
            <CustomBreadcrumb />
            <ThesisApplicationForm/>
        </>;
}
