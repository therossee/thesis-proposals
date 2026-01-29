import React, { useState } from 'react';

import Select from 'react-select';

import PropTypes from 'prop-types';

import CustomBadge from './CustomBadge';

export default function CompanySelect({ options, selected, setSelected, placeholder }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <Select
        isMulti={false}
        isClearable={true}
        components={{ SingleValue: CustomSingleValue, IndicatorSeparator: () => null }}
        name="companies"
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

const CustomSingleValue = ({ data }) => (
  <CustomBadge variant="external-company" type="single_select" content={{ content: data.label, id: data.value }} />
);

CustomSingleValue.propTypes = {
  data: PropTypes.object.isRequired,
};

CompanySelect.propTypes = {
  options: PropTypes.array.isRequired,
  selected: PropTypes.object,
  setSelected: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
