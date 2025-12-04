import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mapping of sections to their field IDs
const SECTION_FIELDS: Record<string, string[]> = {
  'section-general-info': ['mocTitle', 'lengthOfChange', 'typeOfChange', 'priorityId', 'areaId', 'unitId'],
  'section-change-details': ['detailOfChange', 'reasonForChange', 'scopeOfWork', 'benefitsValue', 'expectedBenefits', 'costEstimated', 'estimatedValue'],
  'section-risk': ['riskBeforeChange', 'riskAfterChange'],
};

interface ValidationErrorsContextType {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  getSectionErrorCount: (sectionId: string) => number;
  getSectionErrors: (sectionId: string) => Record<string, string>;
  clearErrors: () => void;
}

const ValidationErrorsContext = createContext<ValidationErrorsContextType | undefined>(undefined);

export const ValidationErrorsProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getSectionErrorCount = (sectionId: string): number => {
    const fieldIds = SECTION_FIELDS[sectionId] || [];
    return fieldIds.filter(fieldId => errors[fieldId]).length;
  };

  const getSectionErrors = (sectionId: string): Record<string, string> => {
    const fieldIds = SECTION_FIELDS[sectionId] || [];
    const sectionErrors: Record<string, string> = {};
    fieldIds.forEach(fieldId => {
      if (errors[fieldId]) {
        sectionErrors[fieldId] = errors[fieldId];
      }
    });
    return sectionErrors;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return (
    <ValidationErrorsContext.Provider value={{
      errors,
      setErrors,
      getSectionErrorCount,
      getSectionErrors,
      clearErrors
    }}>
      {children}
    </ValidationErrorsContext.Provider>
  );
};

export const useValidationErrors = () => {
  const context = useContext(ValidationErrorsContext);
  if (context === undefined) {
    throw new Error('useValidationErrors must be used within a ValidationErrorsProvider');
  }
  return context;
};
