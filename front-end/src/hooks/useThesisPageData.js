import { useEffect, useState } from 'react';

export default function useThesisPageData({ thesis, thesisApplication, dataId, API }) {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDeadlines, setSessionDeadlines] = useState({ graduationSession: null, deadlines: [] });
  const [isEligible, setIsEligible] = useState(true);
  const [requiredResume, setRequiredResume] = useState(false);
  const [appStatusHistory, setAppStatusHistory] = useState(thesis ? thesis.applicationStatusHistory : []);

  useEffect(() => {
    let cancelled = false;
    const safe =
      fn =>
      (...args) =>
        !cancelled && fn(...args);

    const safeSetIsLoading = safe(setIsLoading);
    const safeSetSessionDeadlines = safe(setSessionDeadlines);
    const safeSetIsEligible = safe(setIsEligible);
    const safeSetRequiredResume = safe(setRequiredResume);
    const safeSetAppStatusHistory = safe(setAppStatusHistory);

    async function run() {
      safeSetIsLoading(true);

      try {
        const eligibilityRes = await API.checkStudentEligibility();
        safeSetIsEligible(Boolean(eligibilityRes?.eligible));

        if (thesis) {
          const [deadlinesRes, requiredResumeRes] = await Promise.all([
            API.getSessionDeadlines('thesis'),
            API.getRequiredResumeForLoggedStudent(),
          ]);

          safeSetSessionDeadlines(deadlinesRes);
          safeSetRequiredResume(Boolean(requiredResumeRes?.requiredResume));
          safeSetAppStatusHistory(thesis.applicationStatusHistory || []);
          return;
        }

        if (thesisApplication) {
          const [historyRes, deadlinesRes] = await Promise.all([
            API.getStatusHistoryApplication(dataId),
            API.getSessionDeadlines('application'),
          ]);

          safeSetAppStatusHistory(historyRes || []);
          safeSetSessionDeadlines(deadlinesRes);
          return;
        }

        const deadlinesRes = await API.getSessionDeadlines('no_application');
        safeSetSessionDeadlines(deadlinesRes);
        safeSetAppStatusHistory([]);
      } catch (err) {
        console.error('Error fetching thesis page data:', err);
      } finally {
        safeSetIsLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [thesis, thesisApplication, dataId, API]);

  return {
    isLoading,
    sessionDeadlines,
    isEligible,
    requiredResume,
    appStatusHistory,
    setAppStatusHistory,
  };
}
