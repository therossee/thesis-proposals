import React, { useEffect, useRef, useContext, useState } from 'react';

import { Card, Col, Row, Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../styles/utilities.css';
import CustomBadge from './CustomBadge';
import moment from 'moment';
import API from '../API';


import PropTypes from 'prop-types';


export default function ThesisApplicationHistory(props) {
  const { thesisApplication } = props;
  const teachers = [thesisApplication.supervisor, ...thesisApplication.coSupervisors];
  const [statusHistory, setStatusHistory] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    API.getStatusHistoryApplication(thesisApplication.id)
      .then((data) => {
        setStatusHistory(data);
      })
      .catch((error) => {
        console.error('Error fetching status history:', error);
        setStatusHistory([]);
      });
    
  }, [thesisApplication]);


  return thesisApplication && (
    <div className="proposals-container">
      <Card className="mb-3 roundCard py-2">
        {thesisApplication.topic && (
          <Card.Header className="border-0">
            <Row className='d-flex justify-content-between'>
              <Col xs={10} sm={10} md={11} lg={11} xl={11} style={{ marginBottom: '10px' }}>
                <h3 className="thesis-topic"><i className="fa-solid fa-graduation-cap fa-sm pe-2" />{t('carriera.tesi.your_application')}{thesisApplication.topic}</h3>
              </Col>
            </Row>
          </Card.Header>
        )}
        <Card.Body className="pt-2 pb-0">
          {thesisApplication.description && (<MyBlock icon="info-circle" title="carriera.proposte_di_tesi.description" ignoreMoreLines>
            {thesisApplication.description || '-'}
          </MyBlock>)}
          {teachers && teachers.length > 0 && (
            <MyBlock icon="user-plus" title="carriera.tesi.supervisors" ignoreMoreLines>
              <CustomBadge
                variant="teacher"
                content={teachers.map(cs => `${cs.lastName} ${cs.firstName}`)}
              />
            </MyBlock>
          )}
          <MyBlock icon="calendar-clock" title="carriera.tesi.submission_date">
            {moment(thesisApplication.submissionDate).format('DD/MM/YYYY - HH:mm')}
          </MyBlock>
          <MyBlock icon="diagram-project" title="carriera.tesi.status" ignoreMoreLines>
            <CustomBadge
              variant="app_status"
              content={thesisApplication.status}
            />
          </MyBlock>
          {thesisApplication.company && (<MyBlock icon="file-lines" title="carriera.tesi.utilities.template" ignoreMoreLines>
            <a
              href={`https://didattica.polito.it/pls/portal30/stagejob.tesi_in_azi.pdf_it`}
              className="info-detail d-flex align-items-center"
            >
              <i className="fi fi-it fa-fw me-2" />{t('carriera.tesi.utilities.italian_version')}
            </a>
            <a
              href={`https://didattica.polito.it/pls/portal30/stagejob.tesi_in_azi.pdf_en`}
              className="info-detail d-flex align-items-center"
            >
              <i className="fi fi-gb fa-fw me-2" />{t('carriera.tesi.utilities.english_version')}
            </a>
          </MyBlock>)}
        </Card.Body>
      </Card>
    </div>
  );
}

function MyBlock({ icon, title, children, ignoreMoreLines }) {
  const { t } = useTranslation();
  const [moreLines, setMoreLines] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (ignoreMoreLines) {
      return;
    }
    const element = contentRef.current;
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const lines = element.offsetHeight / lineHeight;

      setMoreLines(lines > 1);
    }
  }, [children, ignoreMoreLines]);

  return (
    <div className={moreLines ? 'text-container' : 'info-container mb-3'}>
      <div className={`title-container ${moreLines ? 'pb-1' : ''}`}>
        {icon && <i className={`fa-regular fa-${icon} fa-fw`} />}
        {t(title)}:
      </div>
      <div ref={contentRef} className={`info-detail ${moreLines ? 'aligned mb-3' : ''}`}>
        {children}
      </div>
    </div>
  );
}



ThesisApplicationHistory.propTypes = {
  thesisApplication: PropTypes.shape({
    id: PropTypes.number.isRequired,
    topic: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    submissionDate: PropTypes.string,
    company: PropTypes.object,
    supervisor: PropTypes.object.isRequired,
    coSupervisors: PropTypes.array,
  }).isRequired,
};

MyBlock.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  ignoreMoreLines: PropTypes.bool,
};