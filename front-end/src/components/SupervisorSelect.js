import React, { useEffect, useState } from 'react';

import Select from 'react-select';

import PropTypes from 'prop-types';

import API from '../API';
import CustomBadge from './CustomBadge';

export default function SupervisorSelect({ selected, setSelected, isMulti, placeholder, isClearable }) {
  const [options, setOptions] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    API.getThesisProposalsTeachers().then(data => {
      setOptions(
        data.map(item => ({
          value: item.id,
          label: `${item.lastName} ${item.firstName}`,
          variant: 'teacher',
        })),
      );
    });
  }, []);

  return (
    <div>
      <Select
        isMulti={isMulti}
        isClearable={isClearable}
        components={{ SingleValue: CustomSingleValue, MultiValue: CustomMultiValue, IndicatorSeparator: () => null }}
        name="supervisors"
        defaultValue={selected}
        options={options}
        placeholder={isMenuOpen ? '' : placeholder}
        value={selected}
        onChange={selected => setSelected(selected)}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        className="multi-select"
        classNamePrefix="select"
        styles={{
          option: (basicStyles, state) => ({
            ...basicStyles,
            backgroundColor: state.isFocused ? 'var(--dropdown-hover)' : basicStyles.backgroundColor,
          }),
          placeholder: basicStyles => ({ ...basicStyles, color: 'var(--section-description)' }),
        }}
      />
    </div>
  );
}

const CustomMultiValue = ({ data, removeProps }) => (
  <CustomBadge
    variant="teacher"
    type="reset"
    content={{ id: data.value, content: data.label }}
    removeProps={removeProps}
  />
);

const CustomSingleValue = ({ data }) => (
  <CustomBadge variant="teacher" type="single_select" content={{ id: data.value, content: data.label }}></CustomBadge>
);

CustomMultiValue.propTypes = {
  data: PropTypes.shape({
    variant: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  removeProps: PropTypes.object.isRequired,
};

CustomSingleValue.propTypes = {
  data: PropTypes.shape({
    variant: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
};

SupervisorSelect.propTypes = {
  selected: PropTypes.array,
  setSelected: PropTypes.func.isRequired,
  isMulti: PropTypes.bool,
  placeholder: PropTypes.string,
  isClearable: PropTypes.bool,
};
