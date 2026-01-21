import React, { useEffect, useRef, useState } from 'react';

import { Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import PropTypes from 'prop-types';

import API from '../API';
import '../styles/utilities.css';
import CustomBlock from './CustomBlock';
import TeacherContactCard from './TeacherContactCard';
import ThesisSteps from './ThesisSteps';

export default function Thesis(props) {
  const { t } = useTranslation();
  const { thesis } = props;
  const supervisors = [thesis.supervisor, ...thesis.coSupervisors];

  return (
    <div className="proposals-container">
      <Row className="mb-3">
        <Col md={8}>
          <Card className="mb-3 roundCard py-2">
            <Card.Header className="border-0">
              <Row className="d-flex align-items-center">
                <Col>
                  <h3 className="thesis-topic">
                    <i className="fa-solid fa-graduation-cap fa-sm pe-2" />
                    {t('carriera.tesi.your_thesis')}
                  </h3>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="pt-2 pb-0">
              <CustomBlock icon="book-open" title="carriera.proposte_di_tesi.topic" ignoreMoreLines={true}>
                {thesis.topic.length > 600 ? thesis.topic.substring(0, 597) + '...' : thesis.topic}
              </CustomBlock>
              <CustomBlock icon="calendar" title="carriera.tesi.submission_date" ignoreMoreLines={true}>
                {thesis.thesisApplicationDate ? moment(thesis.thesisApplicationDate).format('DD/MM/YYYY - HH:mm') : '-'}
              </CustomBlock>
              {thesis.conclusionConfirmationDate && (
                <CustomBlock
                  icon="check-circle"
                  title="carriera.tesi.date_conclusion_confirmation"
                  ignoreMoreLines={true}
                >
                  {moment(thesis.conclusionConfirmationDate).format('DD/MM/YYYY - HH:mm')}
                </CustomBlock>
              )}
              {thesis.conclusionRequestDate && (
                <CustomBlock icon="check-circle" title="carriera.tesi.date_conclusion_requested" ignoreMoreLines={true}>
                  {moment(thesis.conclusionRequestDate).format('DD/MM/YYYY - HH:mm')}
                </CustomBlock>
              )}
            </Card.Body>
          </Card>
          <Row className="mb-3">
            <Col md={7}>
              {supervisors && (
                <TeacherContactCard supervisor={thesis.supervisor} coSupervisors={thesis.coSupervisors} />
              )}
            </Col>
            <Col md={5}>
              <Card className="mb-3 roundCard py-2">
                <Card.Header className="border-0">
                  <h3 className="thesis-topic">
                    <i className="fa-solid fa-book fa-sm pe-2" />
                    {t('carriera.tesi.utilities.title')}
                  </h3>
                </Card.Header>
                <Card.Body className="pt-2 pb-0">
                  <LinkBlock
                    icon="copyright"
                    title="carriera.tesi.utilities.copyright"
                    link="carriera.tesi.utilities.copyright_link"
                  />
                  <LinkBlock
                    icon="file-lines"
                    title="carriera.tesi.utilities.thesis_template"
                    link="https://www.overleaf.com/latex/templates/politecnico-di-torino-thesis-template/cmpmxftwvvbr"
                  />
                  <LinkBlock
                    icon="file-word"
                    title="carriera.tesi.utilities.thesis_cover_word"
                    link="carriera.tesi.utilities.thesis_cover_word_link"
                  />
                  <LinkBlock
                    icon="file-image"
                    title="carriera.tesi.utilities.logo"
                    link="carriera.tesi.utilities.logo_link"
                  />
                  <LinkBlock
                    icon="link"
                    title="carriera.tesi.utilities.plagiarism"
                    link="carriera.tesi.utilities.plagiarism_link"
                  />
                  {thesis.company && (
                    <CustomBlock icon="building" title="carriera.tesi.utilities.letter" ignoreMoreLines={true}>
                      <a href={API.getThesisCompanyLetterURL(thesis.id)} target="_blank" rel="noopener noreferrer">
                        {t('carriera.tesi.utilities.letter')}
                      </a>
                      -{' '}
                      <a href={API.getThesisCompanyContactURL(thesis.id)} target="_blank" rel="noopener noreferrer">
                        {t('carriera.tesi.utilities.contact')}
                      </a>
                    </CustomBlock>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col md={4}>
          <Card className="mb-3 roundCard py-2">
            <Card.Header className="border-0">
              <h3 className="thesis-topic">
                <i className="fa-solid fa-arrow-progress fa-sm pe-2" />
                {t('carriera.tesi.next_steps.title')}
              </h3>
            </Card.Header>
            <Card.Body className="pt-2 pb-0">
              <ThesisSteps activeStep={'ongoing'} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function LinkBlock({ icon, title, link }) {
  const { t } = useTranslation();
  const [moreLines, setMoreLines] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const lines = element.offsetHeight / lineHeight;

      setMoreLines(lines > 1);
    }
  }, []);

  return (
    <div className={moreLines ? 'text-container' : 'info-container mb-3'}>
      <div className={`title-container ${moreLines ? 'pb-1' : ''}`}>
        {icon && <i className={`fa-regular fa-${icon} fa-fw`} />}
        <a href={t(link)} target="_blank" rel="noopener noreferrer">{`${t(title)}`}</a>
      </div>
    </div>
  );
}

LinkBlock.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

Thesis.propTypes = {
  thesis: PropTypes.shape({
    id: PropTypes.number.isRequired,
    topic: PropTypes.string.isRequired,
    thesisApplicationDate: PropTypes.string.isRequired,
    conclusionConfirmationDate: PropTypes.string,
    conclusionRequestDate: PropTypes.string,
    supervisor: PropTypes.object.isRequired,
    coSupervisors: PropTypes.arrayOf(PropTypes.object),
    company: PropTypes.shape({
      id: PropTypes.number,
      corporateName: PropTypes.string,
    }),
  }).isRequired,
};
