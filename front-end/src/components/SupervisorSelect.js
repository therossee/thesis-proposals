import React, { useState } from 'react';

import Select from 'react-select';

import PropTypes from 'prop-types';

import CustomBadge from './CustomBadge';

export default function SupervisorSelect({ options, selected = [], setSelected, isMulti, placeholder, error }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <Select
        isMulti={isMulti}
        isClearable={!isMulti}
        components={{ SingleValue: CustomSingleValue, MultiValue: CustomMultiValue, IndicatorSeparator: () => null }}
        name="supervisors"
        defaultValue={selected}
        options={options}
        placeholder={isMenuOpen ? '' : placeholder}
        value={selected}
        onChange={selected => {
          if (isMulti) {
            if (!selected || selected.length <= 4) setSelected(selected);
          } else {
            setSelected(selected);
          }
        }}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        className={`multi-select ${error ? 'is-invalid' : ''}`}
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
  options: PropTypes.array.isRequired,
  selected: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  setSelected: PropTypes.func.isRequired,
  isMulti: PropTypes.bool,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
};
