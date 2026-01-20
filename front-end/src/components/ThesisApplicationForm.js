import React, { useContext, useEffect, useState } from 'react';

import API from '../API';
import { BodyDataLoadingContext, LoggedStudentContext } from '../App';


export default function ThesisApplicationForm() {
    const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
    const [supervisors, setSupervisors] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [selectedCoSupervisors, setSelectedCoSupervisors] = useState([]);
    const [topic, setTopic] = useState('');
    const [company, setCompany] = useState(null);
    const [thesis, setThesis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { loggedStudent } = useContext(LoggedStudentContext);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    useEffect(() => {
        setBodyDataLoading(true);
        setIsLoading(true);
        
        Promise.all([
            API.getThesisProposalsTeachers()
                .then((data) => {
                    setSupervisors(data);
                })
                .catch((error) => {
                    console.error('Error fetching supervisors:', error);
                    setSupervisors([]);
                }),
            API.getCompanies()
                .then((data) => {
                    setCompanies(data);
                })
                .catch((error) => {
                    console.error('Error fetching companies:', error);
                    setCompanies([]);
                }),
            API.getLoggedStudentThesis()
                .then((data) => {
                    setThesis(data);
                })
                .catch((error) => {
                    console.error('Error fetching thesis:', error);
                    setThesis(null);
                }),
        ]).finally(() => {
            setIsLoading(false);
            setBodyDataLoading(false);
        });
    }, [setBodyDataLoading, loggedStudent, refreshTrigger]);

    return (
        <div>

        </div>
    );
}