import React, { useState } from "react";

const FilterSidebar = () => {
  const [categories, setCategories] = useState({
    allCategories: true,
    computerScience: false,
    mathematics: false,
    physics: false,
    chemistry: false,
    biology: false,
    languages: false,
  });

  const [levels, setLevels] = useState({
    allLevels: true,
    beginner: false,
    intermediate: false,
    advanced: false,
  });

  const handleCategoryChange = (category) => {
    setCategories((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  const handleLevelChange = (level) => {
    setLevels((prevState) => ({
      ...prevState,
      [level]: !prevState[level],
    }));
  };

  const handleApplyFilters = () => {
    console.log("Applied Filters:");
    console.log("Categories: ", categories);
    console.log("Levels: ", levels);
  };

  return (
    <div className="rounded-lg overflow-hidden bg-dark-100 p-6 border border-gray-800">
      <h2 className="text-xl font-bold mb-6">Filters</h2>

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="font-medium mb-4 text-sm text-black">Categories</h3>
        <div className="space-y-3 text-black">
          {Object.keys(categories).map((category) => (
            <label key={category} className="flex items-center text-black">
              <input
                type="checkbox"
                checked={categories[category]}
                onChange={() => handleCategoryChange(category)}
                className="mr-2 rounded text-primary focus:ring-primary"
              />
              <span className="text-sm">
                {category.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level Filter */}
      <div className="mb-6">
        <h3 className="font-medium mb-4 text-sm text-black">Level</h3>
        <div className="space-y-3">
          {Object.keys(levels).map((level) => (
            <label key={level} className="flex items-center text-black">
              <input
                type="checkbox"
                checked={levels[level]}
                onChange={() => handleLevelChange(level)}
                className="mr-2 rounded text-primary focus:ring-primary"
              />
              <span className="text-sm">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="pt-6 border-t border-gray-700 mt-6">
        <button
          onClick={handleApplyFilters}
          className="w-full px-4 py-2 bg-[#145D52] text-black rounded-lg hover:bg-green-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
