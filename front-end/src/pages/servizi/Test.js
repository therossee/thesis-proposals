import React, { useContext, useEffect, useState } from 'react';

import { Button, ButtonGroup, Card, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import API from '../../API';
import { BodyDataLoadingContext } from '../../App';
import CustomBadge from '../../components/CustomBadge';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';

export default function Test() {
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const [thesisApplications, setThesisApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    setBodyDataLoading(true);
    setIsLoading(true);

    API.getAllThesisApplications()
      .then(data => {
        setThesisApplications(data);
      })
      .catch(error => {
        console.error('Error fetching thesis:', error);
        setThesisApplications([]);
      })
      .finally(() => {
        setIsLoading(false);
        setStatusChanged(false);
        setBodyDataLoading(false);
      });
  }, [setBodyDataLoading, statusChanged]);

  const openStatusChangeModal = (application, newStatus) => {
    setSelectedApplication(application);
    setSelectedStatus(newStatus);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setSelectedStatus(null);
  };

  const handleConfirmStatusChange = async () => {
    try {
      console.log(`Changing application ${selectedApplication.id} to status: ${selectedStatus}`);
      await API.updateThesisApplicationStatus({
        id: selectedApplication.id,
        old_status: selectedApplication.status,
        new_status: selectedStatus,
      });

      setStatusChanged(true);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'pending':
        return 'In valutazione';
      case 'approved':
        return 'Approvata';
      case 'rejected':
        return 'Rifiutata';
      case 'cancelled':
        return 'Cancellata';
      default:
        return status;
    }
  };

  return (
    <>
      <CustomBreadcrumb
        items={[
          { label: t('servizi.title'), path: '/servizi' },
          { label: 'Test', path: '/servizi/test' },
        ]}
      />
      <div className="applications-container">
        {isLoading ? (
          <></>
        ) : (
          thesisApplications.map(application => (
            <Card key={application.id} className="mb-3 roundCard py-2">
              <Card.Header className="border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 thesis-topic">
                    <i className="fa-solid fa-graduation-cap me-2" />
                    Application ID: {application.id}
                  </h5>
                </div>
                {console.log(application.status)}
                <CustomBadge variant="app_status" content={application.status} />
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>
                    <i className="fa-solid fa-user me-2" />
                    Studente:
                  </strong>{' '}
                  {application.student?.firstName} {application.student?.lastName}
                  <br />
                  <strong>
                    <i className="fa-solid fa-chalkboard-user me-2" />
                    Relatore:
                  </strong>{' '}
                  {application.supervisor?.firstName} {application.supervisor?.lastName}
                  <br />
                  <strong>
                    <i className="fa-solid fa-calendar me-2" />
                    Data presentazione:
                  </strong>{' '}
                  {new Date(application.submissionDate).toLocaleDateString('it-IT')}
                </div>

                {application.description && (
                  <div className="mb-3">
                    <strong>Descrizione:</strong>
                    <p className="mb-0 mt-1">{application.description}</p>
                  </div>
                )}

                <hr />

                {application.status === 'pending' && (
                  <div className="d-flex gap-3 justify-content-end align-items-center">
                    <strong>Cambia stato:</strong>
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-success"
                        disabled={application.status === 'approved'}
                        onClick={() => openStatusChangeModal(application, 'approved')}
                      >
                        <i className="fa-solid fa-check me-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline-danger"
                        disabled={application.status === 'rejected'}
                        onClick={() => openStatusChangeModal(application, 'rejected')}
                      >
                        <i className="fa-solid fa-xmark me-1" />
                        Reject
                      </Button>
                      <Button
                        variant="outline-secondary"
                        disabled={application.status === 'cancelled'}
                        onClick={() => openStatusChangeModal(application, 'cancelled')}
                      >
                        <i className="fa-solid fa-ban me-1" />
                        Cancel
                      </Button>
                    </ButtonGroup>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa-solid fa-pen-to-square me-2" />
            Cambia stato candidatura
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Stai per cambiare lo stato della candidatura <strong>#{selectedApplication?.id}</strong> in:{' '}
            <strong>{getStatusLabel(selectedStatus)}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            <i className="fa-solid fa-xmark me-1" />
            Annulla
          </Button>
          <Button variant={getStatusBadgeVariant(selectedStatus)} onClick={handleConfirmStatusChange}>
            <i className="fa-solid fa-check me-1" />
            Conferma
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
