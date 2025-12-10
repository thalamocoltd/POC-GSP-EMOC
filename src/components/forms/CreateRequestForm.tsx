import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, X, Shield, AlertCircle, CheckCircle2, MapPin, Factory, Building2, Warehouse, Clock, AlertTriangle, Check, Edit3 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { RiskAssessmentModal } from "../emoc/RiskAssessmentModal";
import { FileUploadSection } from "../emoc/FileUploadSection";
import { ValidationErrorPanel } from "./ValidationErrorPanel";
import { AREA_OPTIONS, TYPE_OF_CHANGE_OPTIONS, PRIORITY_OPTIONS, BENEFITS_VALUE_OPTIONS, TPM_LOSS_TYPE_OPTIONS, getUnitsByAreaId } from "../../lib/emoc-data";
import { createRiskAssessment, getRiskCodeStyle } from "../../lib/emoc-utils";
import { InitiationFormData, RiskAssessment } from "../../types/emoc";
import { cn } from "../ui/utils";
import { useAI } from "../../context/AIContext";
import { useValidationErrors } from "../../context/ValidationErrorsContext";

interface CreateRequestFormProps {
  onBack: () => void;
  onSubmit: (data: InitiationFormData) => void;
  isAIAutofilled?: boolean;
  onFormDirtyChange?: (isDirty: boolean) => void;
  autofillPriority?: "normal" | "emergency";
}

// Mapping of field IDs to user-friendly labels
const FIELD_LABELS: Record<string, string> = {
  mocTitle: 'MOC Title',
  areaId: 'Area',
  unitId: 'Unit',
  priorityId: 'Priority of Change',
  lengthOfChange: 'Length of Change',
  typeOfChange: 'Type of Change',
  estimatedDurationStart: 'Estimated Duration - Start Date',
  estimatedDurationEnd: 'Estimated Duration - End Date',
  tpmLossType: 'TPM Loss Type',
  lossEliminateValue: 'Loss Eliminate Value',
  detailOfChange: 'Detail of Change',
  reasonForChange: 'Reason for Change',
  scopeOfWork: 'Scope of Work',
  estimatedBenefit: 'Estimated Benefit',
  estimatedCost: 'Estimated Cost',
  benefits: 'Benefits',
  expectedBenefits: 'Expected Benefits',
  riskBeforeChange: 'Risk Assessment (Before)',
  riskAfterChange: 'Risk Assessment (After)',
};

// Demo autofill data - Normal Priority
const DEMO_AUTOFILL_DATA_NORMAL: Partial<InitiationFormData> = {
  mocTitle: "Upgrade Pump P-101 Motor to IE3 Standard for Energy Efficiency",
  lengthOfChange: "length-1",
  typeOfChange: "type-2",
  priorityId: "priority-1",
  areaId: "area-1",
  unitId: "unit-1-1",
  estimatedDurationStart: "2025-12-06",
  estimatedDurationEnd: "2025-12-08",
  tpmLossType: "tpm-4",
  lossEliminateValue: 500000,
  detailOfChange: "Replace Pump P-101 motor from IE1 to IE3 efficiency class to improve efficiency and reduce energy consumption. Specifications: 75 kW, 380V, 50Hz. Motor brand: Siemens 1LE1 series with premium efficiency rating.",
  reasonForChange: "Current motor is over 15 years old with declining efficiency, resulting in 20% higher energy consumption vs. standard. Risk of failure causing production downtime. Energy audit recommends replacement to meet corporate sustainability goals.",
  scopeOfWork: "1. Remove existing motor and store for disposal\n2. Install new IE3 motor with coupling alignment\n3. Electrical connection and wiring verification\n4. Perform alignment check and vibration analysis\n5. Commissioning and full load testing\n6. Update P&ID and maintenance records\n\nEstimated Duration: 8 hours during planned shutdown",
  estimatedBenefit: 180000,
  estimatedCost: 500000,
  benefits: ["benefit-2", "benefit-6"],
  expectedBenefits: "Reduce electrical energy consumption by 15% (~45,000 kWh/year), saving 180,000 THB/year in electricity costs. Improve system reliability and reduce unplanned downtime by 95%. Reduce carbon emissions by ~22 tons CO2/year, supporting GSP environmental targets.",
  riskBeforeChange: createRiskAssessment(4, 3),
  riskAfterChange: createRiskAssessment(2, 2),
  attachments: [
    {
      id: "att-1",
      category: "Technical Information",
      fileName: "P101_Motor_Specifications.pdf",
      fileSize: 2500000,
      fileType: "application/pdf",
      uploadedAt: new Date(),
      uploadedBy: "Current User"
    },
    {
      id: "att-2",
      category: "Minute of Meeting",
      fileName: "Energy_Audit_Report_2025.pdf",
      fileSize: 1800000,
      fileType: "application/pdf",
      uploadedAt: new Date(),
      uploadedBy: "Current User"
    },
    {
      id: "att-3",
      category: "Other Documents",
      fileName: "Equipment_Photo.jpg",
      fileSize: 3500000,
      fileType: "image/jpeg",
      uploadedAt: new Date(),
      uploadedBy: "Current User"
    }
  ],
};

// Demo autofill data - Emergency Priority
const DEMO_AUTOFILL_DATA_EMERGENCY: Partial<InitiationFormData> = {
  mocTitle: "Emergency: Compressor C-205 Seal Replacement - Production Critical",
  // Note: typeOfChange and lengthOfChange are NOT set for Emergency priority (hidden in UI)
  priorityId: "priority-2",
  areaId: "area-2",
  unitId: "unit-2-2",
  estimatedDurationStart: "2025-12-04",
  estimatedDurationEnd: "2025-12-05",
  tpmLossType: "tpm-1",
  lossEliminateValue: 1200000,
  detailOfChange: "Emergency replacement of seal assembly in Compressor C-205 main housing. Seal failure detected during routine inspection with visible oil leakage. Current seals model: XYZ-3000A, replacement model: XYZ-3000B upgraded seal assembly. Temporary measures in place but permanent replacement required within 24 hours to prevent equipment damage.",
  reasonForChange: "Seal failure creates immediate risk of oil contamination in production line, potential equipment damage to compressor unit estimated at 1.2M THB, and production halt affecting critical delivery schedules. Compressor C-205 is single point of failure for Line 3 production.",
  scopeOfWork: "1. Immediate shutdown of Compressor C-205\n2. Drain and dispose of contaminated oil\n3. Remove old seal assembly\n4. Install new seal kit (XYZ-3000B)\n5. Refill with fresh compressor oil\n6. Pressure test and safety verification\n7. Restart and monitor operation\n\nEstimated Duration: 2-3 hours (expedited)",
  estimatedBenefit: 1200000,
  estimatedCost: 150000,
  benefits: ["benefit-1", "benefit-3"],
  expectedBenefits: "Prevent equipment failure (value 1.2M THB). Maintain production continuity for Line 3 and downstream operations. Avoid safety hazard from oil spillage. Ensure regulatory compliance for equipment maintenance records.",
  riskBeforeChange: createRiskAssessment(4, 4),
  riskAfterChange: createRiskAssessment(1, 1),
  attachments: [
    {
      id: "att-e1",
      category: "Technical Information",
      fileName: "C205_Compressor_Manual.pdf",
      fileSize: 4200000,
      fileType: "application/pdf",
      uploadedAt: new Date(),
      uploadedBy: "Current User"
    },
    {
      id: "att-e2",
      category: "Other Documents",
      fileName: "Seal_Failure_Inspection_Report.xlsx",
      fileSize: 950000,
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      uploadedAt: new Date(),
      uploadedBy: "Current User"
    }
  ],
};

// Helper to get correct demo data based on priority
const getDemoAutofillData = (priority?: string) =>
  priority === "emergency" ? DEMO_AUTOFILL_DATA_EMERGENCY : DEMO_AUTOFILL_DATA_NORMAL;

export const CreateRequestForm = ({ onBack, onSubmit, isAIAutofilled = false, onFormDirtyChange, autofillPriority }: CreateRequestFormProps) => {
  const { openAssistantForField, reportValidationErrors, reportValidationSuccess } = useAI();
  const { setErrors: setContextErrors } = useValidationErrors();
  const [hasReportedErrors, setHasReportedErrors] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<InitiationFormData>({
    requesterName: "Chatree Dechabumphen (บค.วบก.)",
    requestDate: new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),/, '$1/$2/$3'),
    mocTitle: "",
    lengthOfChange: "",
    typeOfChange: "",
    priorityId: "priority-1", // Default to Normal
    areaId: "",
    unitId: "",
    estimatedDurationStart: "",
    estimatedDurationEnd: "",
    tpmLossType: "",
    lossEliminateValue: 0,
    detailOfChange: "",
    reasonForChange: "",
    scopeOfWork: "",
    estimatedBenefit: 0,
    estimatedCost: 0,
    benefits: [],
    expectedBenefits: "",
    riskBeforeChange: createRiskAssessment(null, null),
    riskAfterChange: createRiskAssessment(null, null),
    attachments: []
  });

  // AI Assistant State
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Dirty State
  const [isFormDirty, setIsFormDirty] = useState(false);

  // UI State
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [availableUnits, setAvailableUnits] = useState(getUnitsByAreaId(""));
  const [isRiskBeforeModalOpen, setIsRiskBeforeModalOpen] = useState(false);
  const [isRiskAfterModalOpen, setIsRiskAfterModalOpen] = useState(false);
  const [showAIBanner, setShowAIBanner] = useState(isAIAutofilled);

  // Area selection handler
  useEffect(() => {
    if (selectedAreaId !== formData.areaId) {
      setSelectedAreaId(formData.areaId);
      setAvailableUnits(getUnitsByAreaId(formData.areaId));
      if (formData.areaId) {
        setFormData(prev => ({ ...prev, unitId: "" }));
      }
    }
  }, [formData.areaId, selectedAreaId]);

  // Clear Type and Length of Change when switching to Emergency priority
  useEffect(() => {
    if (formData.priorityId === "priority-2") {
      setFormData((prev: InitiationFormData) => ({
        ...prev,
        typeOfChange: undefined,
        lengthOfChange: undefined
      }));
    }
  }, [formData.priorityId]);

  // Clear highlight after delay
  useEffect(() => {
    if (highlightedField) {
      const timer = setTimeout(() => setHighlightedField(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedField]);

  // Sync errors with context for ModuleMenu display
  useEffect(() => {
    setContextErrors(errors);
  }, [errors, setContextErrors]);

  // Auto-fill form with demo data when AI autofill is triggered
  useEffect(() => {
    if (isAIAutofilled) {
      const demoData = getDemoAutofillData(autofillPriority);

      setFormData((prev: InitiationFormData) => ({
        ...prev,
        ...demoData
      }));

      if (demoData.areaId) {
        setSelectedAreaId(demoData.areaId);
        setAvailableUnits(getUnitsByAreaId(demoData.areaId));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAIAutofilled, autofillPriority]);

  // Notify parent when form dirty state changes
  useEffect(() => {
    onFormDirtyChange?.(isFormDirty);
  }, [isFormDirty, onFormDirtyChange]);

  const validateField = (field: string, value: any): string => {
    if (!value || (Array.isArray(value) && value.length === 0)) return "This field is required";
    if (field === "estimatedValue" && value < 0) return "Value must be positive";
    if (field === "costEstimated" && value < 0) return "Value must be positive";
    return "";
  };


  const handleScrollToField = (fieldId: string) => {
    setHighlightedField(fieldId);
    // Find element by ID or data-field attribute
    const element = document.getElementById(`field-${fieldId}`) ||
      document.querySelector(`[data-field="${fieldId}"]`);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Find the input/select/textarea element within and add red pulse animation
      const inputElement = element.querySelector('input, select, textarea, [role="combobox"]');
      if (inputElement) {
        inputElement.classList.add('animate-pulse-red-border');
        // Remove animation after 2 seconds (2 pulses)
        setTimeout(() => {
          inputElement.classList.remove('animate-pulse-red-border');
        }, 2000);
      }
    }
  };

  // Check for validation resolution
  useEffect(() => {
    if (hasReportedErrors && Object.keys(errors).length === 0) {
      reportValidationSuccess();
      setHasReportedErrors(false);
    }
  }, [errors, hasReportedErrors, reportValidationSuccess]);

  const handleInputChange = (field: keyof InitiationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Mark form as dirty (except for read-only fields)
    if (!isFormDirty && field !== 'requesterName' && field !== 'requestDate') {
      setIsFormDirty(true);
    }

    // Real-time validation - clear error when user starts fixing
    if (errors[field]) {
      const error = validateField(field, value);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) newErrors[field] = error;
        else delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAutoFill = (fieldId: string, value: any) => {
    // Special handling for benefits (array field)
    if (fieldId === 'benefits') {
      if (Array.isArray(value)) {
        handleInputChange(fieldId as keyof InitiationFormData, value);
      } else {
        // Toggle single value
        handleBenefitsToggle(value);
      }
    } else {
      handleInputChange(fieldId as keyof InitiationFormData, value);
    }
    setHighlightedField(fieldId);
  };

  const handleBenefitsToggle = (benefitId: string) => {
    setFormData(prev => {
      const newBenefits = prev.benefits.includes(benefitId)
        ? prev.benefits.filter((id: string) => id !== benefitId)
        : [...prev.benefits, benefitId];
      return { ...prev, benefits: newBenefits };
    });
  };

  const renderLabelWithAI = (label: string, fieldId: string, required: boolean = false) => (
    <div className="flex items-center gap-2 mb-2 group">
      <Label className="text-[13px] font-medium text-[#1C1C1E]">
        {label} {required && <span className="text-[#D93F4C]">*</span>}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => openAssistantForField(
              fieldId,
              `Help me fill the "${label}" field. I'll provide more project context in our conversation.`,
              (val) => handleAutoFill(fieldId, val),
              formData // Pass current form data for context-aware guidance
            )}
            className="text-[#006699] opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-blue-50 rounded-full cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#1d3654] text-white border-none shadow-md">
          Ask AI Expert
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const isEmergency = formData.priorityId === "priority-2";
  const isOverride = formData.typeOfChange === "type-4";

  const validateAll = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    if (!formData.mocTitle) newErrors.mocTitle = "MOC Title is required";

    // Conditional validation for typeOfChange and lengthOfChange
    if (!isEmergency && !formData.typeOfChange) newErrors.typeOfChange = "Type of Change is required";
    if (!isEmergency && !formData.lengthOfChange) newErrors.lengthOfChange = "Length of Change is required";

    // Validate Length matches Type (business rule)
    if (!isEmergency && formData.typeOfChange && formData.lengthOfChange) {
      const isOverrideType = formData.typeOfChange === "type-4";
      const isOverrideLength = formData.lengthOfChange === "length-3" || formData.lengthOfChange === "length-4";
      const isStandardLength = formData.lengthOfChange === "length-1" || formData.lengthOfChange === "length-2";

      if (isOverrideType && !isOverrideLength) {
        newErrors.lengthOfChange = "Override type must use duration options (More/Less than 3 days)";
      }
      if (!isOverrideType && !isStandardLength) {
        newErrors.lengthOfChange = "Non-override types must use Permanent or Temporary";
      }
    }

    if (!formData.priorityId) newErrors.priorityId = "Priority of Change is required";
    if (!formData.areaId) newErrors.areaId = "Area is required";
    if (!formData.unitId) newErrors.unitId = "Unit is required";
    if (!formData.estimatedDurationStart) newErrors.estimatedDurationStart = "Start Date is required";
    if (!formData.estimatedDurationEnd) newErrors.estimatedDurationEnd = "End Date is required";
    if (!formData.tpmLossType) newErrors.tpmLossType = "TPM Loss Type is required";
    if (!formData.lossEliminateValue) newErrors.lossEliminateValue = "Loss Eliminate Value is required";
    if (!formData.detailOfChange) newErrors.detailOfChange = "Detail of Change is required";
    if (!formData.reasonForChange) newErrors.reasonForChange = "Reason for Change is required";
    if (!formData.scopeOfWork) newErrors.scopeOfWork = "Scope of Work is required";
    if (!formData.estimatedBenefit) newErrors.estimatedBenefit = "Estimated Benefit is required";
    if (!formData.estimatedCost) newErrors.estimatedCost = "Estimated Cost is required";
    if (formData.benefits.length === 0) newErrors.benefits = "Please select at least one benefit";
    if (!formData.expectedBenefits) newErrors.expectedBenefits = "Expected Benefits is required";
    if (!formData.riskBeforeChange.level) newErrors.riskBeforeChange = "Risk Assessment (Before) is required";
    if (!formData.riskAfterChange.level) newErrors.riskAfterChange = "Risk Assessment (After) is required";

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = () => {
    const { isValid, errors: validationErrors } = validateAll();
    if (isValid) {
      console.log("Form Valid & Submitted:", formData);
      // Call the onSubmit callback with form data
      onSubmit(formData);
      // Show success dialog instead of alert
      setShowSubmitDialog(true);
    } else {
      // Validation errors are displayed in ValidationErrorPanel via state
      setHasReportedErrors(true);
    }
  };

  const handleSubmitConfirm = () => {
    setShowSubmitDialog(false);
    setIsFormDirty(false);
    setIsExiting(true);
    // Immediately navigate back to dashboard
    onBack();
  };


  const getAreaIcon = (id: string) => {
    switch (id) {
      case 'area-1': return <Factory className="w-4 h-4 text-[#68737D]" />;
      case 'area-2': return <Building2 className="w-4 h-4 text-[#68737D]" />;
      case 'area-3': return <Warehouse className="w-4 h-4 text-[#68737D]" />;
      default: return <MapPin className="w-4 h-4 text-[#68737D]" />;
    }
  };


  return (
    <TooltipProvider delayDuration={300}>
      <div className={isExiting ? "max-w-4xl mx-auto pb-32 pt-6 relative animate-out fade-out slide-out-to-top-4 duration-400" : "max-w-4xl mx-auto pb-32 pt-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500"}>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-[#68737D] hover:text-[#1C1C1E] flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          {/* AI Banner */}
          {showAIBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-gradient-to-br from-[#EFF6FF] to-[#F0E7FF] border-b border-[#1F73B7]/20 p-5 flex items-start justify-between relative overflow-hidden"
            >
              <div className="flex items-start gap-3 z-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1d3654] to-[#006699] flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1C1C1E] flex items-center gap-2">
                    Form Auto-Filled by AI Assistant
                  </h3>
                  <p className="text-[13px] text-[#68737D] mt-1">
                    I've pre-filled this form with sample data based on your request. Please review all fields and make any necessary adjustments before submitting.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIBanner(false)}
                className="text-[#68737D] hover:text-[#1C1C1E] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Form Content */}
          <div className="p-8 sm:p-10 space-y-10">

            <div>
              <h2 className="text-[24px] font-semibold text-[#1C1C1E] mb-1">Initiation</h2>
              <p className="text-[#68737D] text-sm">Electronic Management of Change - Initiation Stage</p>
            </div>

            {/* General Information */}
            <section id="section-general-info" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#006699]" />
                General Information
              </h3>

              <div className="grid gap-6">
                {/* Read-only fields */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-[#1C1C1E]">
                      Requester Name
                    </Label>
                    <Input
                      className="h-11 bg-gray-50 border-[#D4D9DE]"
                      value={formData.requesterName}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-[#1C1C1E]">
                      Request Date
                    </Label>
                    <Input
                      className="h-11 bg-gray-50 border-[#D4D9DE]"
                      value={formData.requestDate}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2" id="field-mocTitle">
                  {renderLabelWithAI("MOC Title", "mocTitle", true)}
                  <Input
                    className={cn(
                      "h-11 bg-gray-50 transition-all duration-500",
                      errors.mocTitle ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-[#D4D9DE] focus:ring-[#1F73B7]/20 focus:border-[#1F73B7]",
                      highlightedField === 'mocTitle' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    placeholder="Enter MOC title (max 200 characters)"
                    maxLength={200}
                    value={formData.mocTitle}
                    onChange={(e) => handleInputChange('mocTitle', e.target.value)}
                  />
                  {errors.mocTitle && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.mocTitle}</span>}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2" id="field-areaId">
                    <Label className="text-[13px] font-medium text-[#1C1C1E]">
                      Area <span className="text-[#D93F4C]">*</span>
                    </Label>
                    <Select
                      value={formData.areaId}
                      onValueChange={(value) => handleInputChange('areaId', value)}
                    >
                      <SelectTrigger className={cn(
                        "h-11 bg-gray-50",
                        errors.areaId ? "border-red-300" : "border-[#D4D9DE]"
                      )}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#006699]" />
                          <SelectValue placeholder="Select area" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Select Area
                        </div>
                        {AREA_OPTIONS.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            <div className="flex items-center gap-2">
                              {getAreaIcon(area.id)}
                              <span>{area.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.areaId && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.areaId}</span>}
                  </div>

                  <div className="space-y-2" id="field-unitId">
                    <Label className="text-[13px] font-medium text-[#1C1C1E]">
                      Unit <span className="text-[#D93F4C]">*</span>
                    </Label>
                    <Select
                      value={formData.unitId}
                      onValueChange={(value) => handleInputChange('unitId', value)}
                      disabled={!formData.areaId}
                    >
                      <SelectTrigger className={cn(
                        "h-11 bg-gray-50",
                        errors.unitId ? "border-red-300" : "border-[#D4D9DE]"
                      )}>
                        <SelectValue placeholder={formData.areaId ? "Select unit" : "Select area first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unitId && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.unitId}</span>}
                  </div>
                </div>

                <div className="space-y-2" id="field-priorityId">
                  {renderLabelWithAI("Priority of Change", "priorityId", true)}
                  <div className="flex gap-3">
                    {PRIORITY_OPTIONS.map((priority) => {
                      const isNormal = priority.name === "Normal";
                      const isSelected = formData.priorityId === priority.id;

                      return (
                        <button
                          key={priority.id}
                          type="button"
                          onClick={() => handleInputChange('priorityId', priority.id)}
                          style={{
                            backgroundColor: isSelected ? (isNormal ? '#16a34a' : '#dc2626') : '#ffffff',
                            borderColor: isSelected ? (isNormal ? '#16a34a' : '#dc2626') : '#D4D9DE',
                            color: isSelected ? '#ffffff' : '#1C1C1E'
                          }}
                          className={cn(
                            "flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm",
                            errors.priorityId && !isSelected && "border-red-300"
                          )}
                        >
                          {isNormal ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                          <span>{priority.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.priorityId && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.priorityId}</span>}
                </div>

                {!isEmergency && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2" id="field-typeOfChange">
                      {renderLabelWithAI("Type of Change", "typeOfChange", true)}
                      <Select
                        value={formData.typeOfChange || ""}
                        onValueChange={(value) => {
                          handleInputChange('typeOfChange', value);

                          // Clear lengthOfChange if switching between Override and non-Override
                          const isNewTypeOverride = value === "type-4";
                          const currentLength = formData.lengthOfChange;

                          if (isNewTypeOverride) {
                            // Switching TO Override: clear if current length is Permanent/Temporary
                            if (currentLength === "length-1" || currentLength === "length-2") {
                              handleInputChange('lengthOfChange', '');
                            }
                          } else {
                            // Switching FROM Override: clear if current length is More/Less than 3 days
                            if (currentLength === "length-3" || currentLength === "length-4") {
                              handleInputChange('lengthOfChange', '');
                            }
                          }
                        }}
                      >
                        <SelectTrigger className={cn(
                          "h-11 bg-gray-50",
                          errors.typeOfChange ? "border-red-300" : "border-[#D4D9DE]"
                        )}>
                          <SelectValue placeholder="Select type of change" />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OF_CHANGE_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.typeOfChange && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.typeOfChange}</span>}
                    </div>

                    <div className="space-y-2" id="field-lengthOfChange">
                      {renderLabelWithAI("Length of Change", "lengthOfChange", true)}
                      <Select
                        value={formData.lengthOfChange || ""}
                        onValueChange={(value) => handleInputChange('lengthOfChange', value)}
                      >
                        <SelectTrigger className={cn(
                          "h-11 bg-gray-50",
                          errors.lengthOfChange ? "border-red-300" : "border-[#D4D9DE]"
                        )}>
                          <SelectValue placeholder="Select length of change" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.typeOfChange === 'type-4' ? (
                            // Override type: show duration options
                            <>
                              <SelectItem value="length-3">More than 3 days</SelectItem>
                              <SelectItem value="length-4">Less than 3 days</SelectItem>
                            </>
                          ) : (
                            // Non-Override types: show permanent/temporary
                            <>
                              <SelectItem value="length-1">Permanent</SelectItem>
                              <SelectItem value="length-2">Temporary</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.lengthOfChange && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.lengthOfChange}</span>}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2" id="field-estimatedDurationStart">
                    {renderLabelWithAI("Start Date", "estimatedDurationStart", true)}
                    <Input
                      className={cn(
                        "h-11 border-[#D4D9DE]",
                        errors.estimatedDurationStart && "border-red-300"
                      )}
                      type="date"
                      value={formData.estimatedDurationStart}
                      onChange={(e) => handleInputChange('estimatedDurationStart', e.target.value)}
                    />
                    {errors.estimatedDurationStart && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.estimatedDurationStart}</span>}
                  </div>

                  <div className="space-y-2" id="field-estimatedDurationEnd">
                    {renderLabelWithAI("End Date", "estimatedDurationEnd", true)}
                    <Input
                      className={cn(
                        "h-11 border-[#D4D9DE]",
                        errors.estimatedDurationEnd && "border-red-300"
                      )}
                      type="date"
                      value={formData.estimatedDurationEnd}
                      onChange={(e) => handleInputChange('estimatedDurationEnd', e.target.value)}
                    />
                    {errors.estimatedDurationEnd && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.estimatedDurationEnd}</span>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2" id="field-tpmLossType">
                    {renderLabelWithAI("TPM Loss Type", "tpmLossType", true)}
                    <Select
                      value={formData.tpmLossType}
                      onValueChange={(value: string) => handleInputChange('tpmLossType', value)}
                    >
                      <SelectTrigger className={cn(
                        "h-11 bg-gray-50",
                        errors.tpmLossType ? "border-red-300" : "border-[#D4D9DE]"
                      )}>
                        <SelectValue placeholder="Select TPM loss type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TPM_LOSS_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tpmLossType && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.tpmLossType}</span>}
                  </div>

                  <div className="space-y-2" id="field-lossEliminateValue">
                    {renderLabelWithAI("Loss Eliminate Value (THB)", "lossEliminateValue", true)}
                    <Input
                      className={cn(
                        "h-11 border-[#D4D9DE]",
                        errors.lossEliminateValue && "border-red-300"
                      )}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.lossEliminateValue || ""}
                      onChange={(e) => handleInputChange('lossEliminateValue', parseFloat(e.target.value) || 0)}
                    />
                    {errors.lossEliminateValue && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.lossEliminateValue}</span>}
                  </div>
                </div>

              </div>
            </section>

            {/* Change Details */}
            <section id="section-change-details" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#006699]" />
                Change Details
              </h3>

              <div className="space-y-6">
                <div className="space-y-2" id="field-detailOfChange">
                  {renderLabelWithAI("Detail of Change", "detailOfChange", true)}
                  <Textarea
                    className={cn(
                      "min-h-[100px] resize-y transition-all duration-500",
                      errors.detailOfChange ? "border-red-300" : "border-[#D4D9DE]",
                      highlightedField === 'detailOfChange' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    placeholder="Describe the detail of this change"
                    value={formData.detailOfChange}
                    onChange={(e) => handleInputChange('detailOfChange', e.target.value)}
                  />
                  {errors.detailOfChange && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.detailOfChange}</span>}
                </div>

                <div className="space-y-2" id="field-reasonForChange">
                  {renderLabelWithAI("Reason for Change", "reasonForChange", true)}
                  <Textarea
                    className={cn(
                      "min-h-[100px] resize-y transition-all duration-500",
                      errors.reasonForChange ? "border-red-300" : "border-[#D4D9DE]",
                      highlightedField === 'reasonForChange' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    placeholder="Describe the reason for this change"
                    value={formData.reasonForChange}
                    onChange={(e) => handleInputChange('reasonForChange', e.target.value)}
                  />
                  {errors.reasonForChange && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.reasonForChange}</span>}
                </div>

                <div className="space-y-2" id="field-scopeOfWork">
                  {renderLabelWithAI("Scope of Work", "scopeOfWork", true)}
                  <Textarea
                    className={cn(
                      "min-h-[100px] resize-y transition-all duration-500",
                      errors.scopeOfWork ? "border-red-300" : "border-[#D4D9DE]",
                      highlightedField === 'scopeOfWork' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    placeholder="Define the scope of work for this change"
                    value={formData.scopeOfWork}
                    onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
                  />
                  {errors.scopeOfWork && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.scopeOfWork}</span>}
                </div>

              </div>
            </section>

            {/* Estimated Benefit / Cost */}
            <section id="section-benefit-cost" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#006699]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estimated Benefit / Cost
              </h3>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2" id="field-estimatedBenefit">
                    {renderLabelWithAI("Estimated Benefit (THB)", "estimatedBenefit", true)}
                    <Input
                      className={cn(
                        "h-11 border-[#D4D9DE]",
                        errors.estimatedBenefit && "border-red-300"
                      )}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.estimatedBenefit || ""}
                      onChange={(e) => handleInputChange('estimatedBenefit', parseFloat(e.target.value) || 0)}
                    />
                    {errors.estimatedBenefit && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.estimatedBenefit}</span>}
                  </div>

                  <div className="space-y-2" id="field-estimatedCost">
                    {renderLabelWithAI("Estimated Cost (THB)", "estimatedCost", true)}
                    <Input
                      className={cn(
                        "h-11 border-[#D4D9DE]",
                        errors.estimatedCost && "border-red-300"
                      )}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.estimatedCost || ""}
                      onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                    />
                    {errors.estimatedCost && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.estimatedCost}</span>}
                  </div>
                </div>

                <div className="space-y-2" id="field-benefits">
                  {renderLabelWithAI("Benefits", "benefits", true)}
                  <div className="flex flex-wrap gap-2">
                    {BENEFITS_VALUE_OPTIONS.map((benefit) => {
                      const isSelected = formData.benefits.includes(benefit.id);
                      return (
                        <button
                          key={benefit.id}
                          type="button"
                          onClick={() => handleBenefitsToggle(benefit.id)}
                          className={cn(
                            "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer",
                            isSelected
                              ? "border-[#006699] bg-[#006699] text-white shadow-md"
                              : "border-[#D4D9DE] bg-gray-50 text-[#68737D] hover:border-[#006699] hover:text-[#006699] hover:shadow-sm",
                            errors.benefits && !isSelected && "border-red-300"
                          )}
                        >
                          <Check className="w-4 h-4" />
                          <span>{benefit.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.benefits && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.benefits}</span>}
                </div>

                <div className="space-y-2" id="field-expectedBenefits">
                  {renderLabelWithAI("Expected Benefits", "expectedBenefits", true)}
                  <Textarea
                    className={cn(
                      "min-h-[80px] resize-y transition-all duration-500",
                      errors.expectedBenefits ? "border-red-300" : "border-[#D4D9DE]",
                      highlightedField === 'expectedBenefits' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    placeholder="Describe the expected benefits"
                    value={formData.expectedBenefits}
                    onChange={(e) => handleInputChange('expectedBenefits', e.target.value)}
                  />
                  {errors.expectedBenefits && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.expectedBenefits}</span>}
                </div>
              </div>
            </section>

            {/* Review of Change */}
            <section id="section-risk" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#006699]" />
                Review of Change
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div id="field-riskBeforeChange" className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-[13px] font-medium text-[#1C1C1E]">
                      Risk Assessment Before Change <span className="text-[#D93F4C]">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => openAssistantForField(
                            'riskBeforeChange',
                            'How should I assess the risk before change?',
                            (val) => handleAutoFill('riskBeforeChange', val)
                          )}
                          className="text-[#006699] opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-blue-50 rounded-full"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#1d3654] text-white border-none shadow-md">
                        Ask AI
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {(() => {
                    const riskStyle = getRiskCodeStyle(formData.riskBeforeChange.riskCode || "");
                    return (
                      <div className={cn(
                        "p-5 border-2 rounded-xl transition-all duration-500",
                        errors.riskBeforeChange ? "border-red-300 bg-red-50" :
                          formData.riskBeforeChange.riskCode ? "bg-[#F7F8FA] border-[#E5E7EB]" : "bg-white border-[#E5E7EB]",
                        highlightedField === 'riskBeforeChange' && "ring-4 ring-[#006699]/20"
                      )}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {formData.riskBeforeChange.riskCode ? (
                              <span
                                style={riskStyle}
                                className="inline-block px-4 py-2 rounded-lg font-bold text-lg"
                              >
                                {formData.riskBeforeChange.riskCode}
                              </span>
                            ) : (
                              <p className={cn("text-sm", errors.riskBeforeChange ? "text-red-500 font-medium" : "text-[#68737D]")}>
                                {errors.riskBeforeChange || "No assessment completed"}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRiskBeforeModalOpen(true)}
                            className="border-[#D4D9DE] shrink-0"
                          >
                            {formData.riskBeforeChange.riskCode ? "Edit" : "Assess Risk"}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div id="field-riskAfterChange" className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-[13px] font-medium text-[#1C1C1E]">
                      Risk Assessment After Change <span className="text-[#D93F4C]">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => openAssistantForField(
                            'riskAfterChange',
                            'How should I assess the risk after change?',
                            (val) => handleAutoFill('riskAfterChange', val)
                          )}
                          className="text-[#006699] opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-blue-50 rounded-full"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#1d3654] text-white border-none shadow-md">
                        Ask AI
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {(() => {
                    const riskStyle = getRiskCodeStyle(formData.riskAfterChange.riskCode || "");
                    return (
                      <div className={cn(
                        "p-5 border-2 rounded-xl transition-all duration-500",
                        errors.riskAfterChange ? "border-red-300 bg-red-50" :
                          formData.riskAfterChange.riskCode ? "bg-[#F7F8FA] border-[#E5E7EB]" : "bg-white border-[#E5E7EB]",
                        highlightedField === 'riskAfterChange' && "ring-4 ring-[#006699]/20"
                      )}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {formData.riskAfterChange.riskCode ? (
                              <span
                                style={riskStyle}
                                className="inline-block px-4 py-2 rounded-lg font-bold text-lg"
                              >
                                {formData.riskAfterChange.riskCode}
                              </span>
                            ) : (
                              <p className={cn("text-sm", errors.riskAfterChange ? "text-red-500 font-medium" : "text-[#68737D]")}>
                                {errors.riskAfterChange || "No assessment completed"}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRiskAfterModalOpen(true)}
                            className="border-[#D4D9DE] shrink-0"
                          >
                            {formData.riskAfterChange.riskCode ? "Edit" : "Assess Risk"}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>

            {/* Attachments */}
            <section id="section-attachments" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#006699]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments
              </h3>

              <FileUploadSection
                files={formData.attachments}
                onFilesChange={(files) => handleInputChange('attachments', files)}
              />
            </section>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-[72px] right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-4 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="mr-6 flex items-center justify-start gap-3" style={{ marginLeft: "370px" }}>
            <Button
              variant="ghost"
              className="text-[#68737D] hover:text-[#1C1C1E]"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="bg-white border border-[#D4D9DE] text-[#1C1C1E] hover:bg-[#F7F8FA]"
            >
              Save Draft
            </Button>
            <Button
              className="bg-gradient-to-r from-[#1d3654] to-[#006699] hover:brightness-110 text-white shadow-md min-w-[140px]"
              onClick={handleSubmit}
            >
              Submit Request
            </Button>
          </div>
        </div>

        {/* Risk Assessment Modals */}
        <RiskAssessmentModal
          isOpen={isRiskBeforeModalOpen}
          onClose={() => setIsRiskBeforeModalOpen(false)}
          onSave={(assessment: RiskAssessment) => {
            handleInputChange('riskBeforeChange', assessment);
            setIsRiskBeforeModalOpen(false);
          }}
        />

        <RiskAssessmentModal
          isOpen={isRiskAfterModalOpen}
          onClose={() => setIsRiskAfterModalOpen(false)}
          onSave={(assessment: RiskAssessment) => {
            handleInputChange('riskAfterChange', assessment);
            setIsRiskAfterModalOpen(false);
          }}
        />

        {/* Submit Success Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AlertDialogHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-center text-lg">
                MOC Request Submitted Successfully
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Your request has been submitted for review and will be assigned to appropriate reviewers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-center gap-3">
              <AlertDialogAction onClick={handleSubmitConfirm} className="bg-green-600 hover:bg-green-700 text-white">
                Back to Dashboard
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Validation Error Panel - Right Side */}
        <ValidationErrorPanel
          errors={errors}
          fieldLabels={FIELD_LABELS}
          onErrorClick={handleScrollToField}
          isVisible={Object.keys(errors).length > 0}
        />
      </div>
    </TooltipProvider>
  );
};
