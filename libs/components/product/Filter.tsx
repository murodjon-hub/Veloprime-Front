import React from 'react';
import { Box, Typography, Chip, Slider } from '@mui/material';
import { ProductType, ProductAgeCategory, ProductColor, ProductSize } from "../../enums/product/product";

interface FilterChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}

const FilterChipGroup = ({ label, options, selected, onToggle }: FilterChipGroupProps) => (
  <Box className="filter__group">
    <Typography className="filter__group-label">{label}</Typography>
    <Box className="filter__chip-row">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <Chip
            key={opt}
            label={opt.replace(/_/g, ' ')}
            size="small"
            onClick={() => onToggle(opt)}
            className={`filter__chip ${active ? 'filter__chip--active' : ''}`}
          />
        );
      })}
    </Box>
  </Box>
);

const Filter = ({
  searchText, onSearchChange, activeTypes, onToggleType,
  activeAges, onToggleAge, activeColors, onToggleColor,
  activeSizes, onToggleSize, priceRange, onPriceChange, onReset,
}: any) => {
  return (
    <Box className="filter">
      <Box className="filter__header">
        <Typography className="filter__title">Filters</Typography>
        <Typography className="filter__reset" onClick={onReset}>Reset all</Typography>
      </Box>

      <Box className="filter__group">
        <Typography className="filter__group-label">Search</Typography>
        <input
          className="filter__search-input"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Product name..."
        />
      </Box>

      {/* ✅ ACCESSORY excluded from type filter */}
      <FilterChipGroup
        label="Type"
        options={Object.values(ProductType).filter(t => t !== ProductType.ACCESSORY)}
        selected={activeTypes}
        onToggle={onToggleType}
      />
      <FilterChipGroup label="Age Category" options={Object.values(ProductAgeCategory)} selected={activeAges} onToggle={onToggleAge} />
      <FilterChipGroup label="Color"        options={Object.values(ProductColor)}       selected={activeColors} onToggle={onToggleColor} />
      <FilterChipGroup label="Size"         options={Object.values(ProductSize)}        selected={activeSizes} onToggle={onToggleSize} />

      <Box className="filter__group filter__group--price">
        <Typography className="filter__group-label">Price Range</Typography>
        <Slider
          value={priceRange}
          min={0}
          max={5000}
          onChange={(_: any, v: any) => onPriceChange(v)}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};

export default Filter;