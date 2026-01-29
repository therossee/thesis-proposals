import React from 'react';

import { Card, Col, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';

import '../styles/utilities.css';
import CustomBlock from './CustomBlock';
import ThesisRequestModal from './ThesisRequestModal';
import Timeline from './Timeline';

export default function ThesisInfo({ showModal, setShowModal, onRequestSubmitResult }) {
  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Timeline />
        </Col>
        <Col>
          <Card className="mb-3 roundCard py-2 ">
            <Card.Header className="border-0">
              <h3 className="thesis-topic">
                <i className="fa-solid fa-info-circle" /> Informazioni sulla tesi
              </h3>
            </Card.Header>
            <Card.Body>
              <CustomBlock icon="info-circle" title="Consigli" ignoreMoreLines={true}>
                <ul>
                  <li>
                    Consulta regolarmente la timeline a sinistra per monitorare lo stato e le scadenze della tua tesi.
                  </li>
                  <li>Comunica tempestivamente con il tuo relatore per chiarire dubbi e ricevere feedback.</li>
                  <li>
                    Rispetta le scadenze indicate in questa sezione e carica i documenti richiesti nei tempi previsti.
                  </li>
                  <li>Verifica che tutti i passaggi siano completati prima di procedere allo step successivo.</li>
                  <li>In caso di problemi tecnici, contatta il supporto tramite l’apposita sezione.</li>
                </ul>
              </CustomBlock>
            </Card.Body>
          </Card>
        </Col>
        <ThesisRequestModal show={showModal} setShow={setShowModal} onSubmitResult={onRequestSubmitResult} />
      </Row>
    </>
  );
}

ThesisInfo.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  onRequestSubmitResult: PropTypes.func.isRequired,
};
