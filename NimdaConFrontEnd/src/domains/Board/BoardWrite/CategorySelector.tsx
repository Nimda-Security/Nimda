import React from 'react';
import ChevronDown from '@/components/icons/ChevronDown';
import type { Category } from '../types';

interface CategorySelectorProps {
  allCategories: Category[];
  rootCategories: Category[];
  parentCategoryId: number | null;
  subCategoryId: number | null;
  showParentDropdown: boolean;
  showSubDropdown: boolean;
  currentParentCat: Category | undefined;
  currentSubCat: Category | undefined;
  subCategories: Category[];
  setParentCategoryId: (id: number | null) => void;
  setSubCategoryId: (id: number | null) => void;
  setShowParentDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSubDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setTagId: (id: number | null) => void;
}

export default function CategorySelector({
  allCategories,
  rootCategories,
  parentCategoryId,
  subCategoryId,
  showParentDropdown,
  showSubDropdown,
  currentParentCat,
  currentSubCat,
  subCategories,
  setParentCategoryId,
  setSubCategoryId,
  setShowParentDropdown,
  setShowSubDropdown,
  setTagId,
}: CategorySelectorProps) {
  return (
    <div className="bw-top-bar">
      {/* 대분류 */}
      <span className="bw-label">게시판</span>
      <div
        className="bw-category-selector"
        onClick={() => {
          setShowParentDropdown((p) => !p);
          setShowSubDropdown(false);
        }}
      >
        <span className="bw-category-selected">
          {currentParentCat ? currentParentCat.name : '선택하세요'}
        </span>
        <span
          className={`bw-chevron ${showParentDropdown ? 'bw-chevron--open' : ''}`}
        >
          <ChevronDown />
        </span>
        {showParentDropdown && (
          <div className="bw-category-dropdown">
            {rootCategories.map((cat) => (
              <div
                key={cat.id}
                className={`bw-category-option ${cat.id === parentCategoryId ? 'bw-category-option--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setParentCategoryId(cat.id);
                  const children = allCategories.filter(
                    (c) => c.parentId === cat.id
                  );
                  if (children.length > 0) {
                    setSubCategoryId(children[0].id);
                  } else {
                    setSubCategoryId(cat.id);
                  }
                  setTagId(null);
                  setShowParentDropdown(false);
                }}
              >
                {cat.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 소분류 (하위 카테고리가 있을 때만 표시) */}
      {subCategories.length > 0 && (
        <>
          <span className="bw-label" style={{ marginLeft: '16px' }}>
            소분류
          </span>
          <div
            className="bw-category-selector"
            onClick={() => {
              setShowSubDropdown((p) => !p);
              setShowParentDropdown(false);
            }}
          >
            <span className="bw-category-selected">
              {currentSubCat ? currentSubCat.name : '선택하세요'}
            </span>
            <span
              className={`bw-chevron ${showSubDropdown ? 'bw-chevron--open' : ''}`}
            >
              <ChevronDown />
            </span>
            {showSubDropdown && (
              <div className="bw-category-dropdown">
                {subCategories.map((sub) => (
                  <div
                    key={sub.id}
                    className={`bw-category-option ${sub.id === subCategoryId ? 'bw-category-option--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubCategoryId(sub.id);
                      setTagId(null);
                      setShowSubDropdown(false);
                    }}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
