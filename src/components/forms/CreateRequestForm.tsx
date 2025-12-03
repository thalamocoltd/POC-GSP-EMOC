import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, X, Shield, AlertCircle, CheckCircle2, MapPin, Factory, Building2, Warehouse } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import { RiskAssessmentModal } from "../emoc/RiskAssessmentModal";
import { FileUploadSection } from "../emoc/FileUploadSection";
import { AREA_OPTIONS, TPM_LOSS_TYPES, PRIORITY_OPTIONS, getUnitsByAreaId } from "../../lib/emoc-data";
import { createRiskAssessment } from "../../lib/emoc-utils";
import { InitiationFormData, RiskAssessment } from "../../types/emoc";
import { cn } from "../ui/utils";
import { useAI } from "../../context/AIContext";

interface CreateRequestFormProps {
  onBack: () => void;
  isAIAutofilled?: boolean;
}

export const CreateRequestForm = ({ onBack, isAIAutofilled = false }: CreateRequestFormProps) => {
  const { openAssistantForField, reportValidationErrors, reportValidationSuccess } = useAI();
  const [hasReportedErrors, setHasReportedErrors] = useState(false);

  // Form State
  const [formData, setFormData] = useState<InitiationFormData>({
    mocTitle: "",
    areaId: "",
    unitId: "",
    background: "",
    impact: "",
    tpmLossTypeId: "",
    lossEliminateValue: 0,
    scopeOfWork: "",
    benefit: "",
    benefitValue: 0,
    lengthOfChange: { years: 0, months: 0, days: 0 },
    priorityId: "",
    preliminaryReview: "",
    investment: 0,
    riskBeforeChange: createRiskAssessment(null, null),
    riskAfterChange: createRiskAssessment(null, null),
    attachments: {
      technicalInformation: [],
      minuteOfMeeting: [],
      otherDocuments: []
    }
  });

  // AI Assistant State
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

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

  // Clear highlight after delay
  useEffect(() => {
    if (highlightedField) {
      const timer = setTimeout(() => setHighlightedField(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedField]);

  const validateField = (field: string, value: any): string => {
    if (!value) return "This field is required";
    if (field === "lossEliminateValue" && value < 0) return "Value must be positive";
    if (field === "benefitValue" && value < 0) return "Value must be positive";
    if (field === "investment" && value < 0) return "Value must be positive";
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

    // Real-time validation
    if (showValidationSummary || errors[field]) {
      const error = validateField(field, value);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) newErrors[field] = error;
        else delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLengthChange = (field: 'years' | 'months' | 'days', value: number) => {
    setFormData(prev => ({
      ...prev,
      lengthOfChange: { ...prev.lengthOfChange, [field]: value }
    }));
  };

  const handleAutoFill = (fieldId: string, value: any) => {
    if (fieldId === 'lengthOfChange') {
      handleLengthChange('years', value.years);
      handleLengthChange('months', value.months);
      handleLengthChange('days', value.days);
    } else if (fieldId === 'riskBeforeChange' || fieldId === 'riskAfterChange') {
      handleInputChange(fieldId as keyof InitiationFormData, value);
    } else {
      handleInputChange(fieldId as keyof InitiationFormData, value);
    }
    setHighlightedField(fieldId);
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
              `How should I fill the ${label} field?`,
              (val) => handleAutoFill(fieldId, val)
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
  );

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mocTitle) newErrors.mocTitle = "MOC Title is required";
    if (!formData.areaId) newErrors.areaId = "Area is required";
    if (!formData.unitId) newErrors.unitId = "Unit is required";
    if (!formData.background) newErrors.background = "Background is required";
    if (!formData.impact) newErrors.impact = "Impact is required";
    if (!formData.scopeOfWork) newErrors.scopeOfWork = "Scope of Work is required";
    if (!formData.tpmLossTypeId) newErrors.tpmLossTypeId = "TPM Loss Type is required";
    if (!formData.benefit) newErrors.benefit = "Benefit description is required";
    if (!formData.priorityId) newErrors.priorityId = "Priority is required";
    if (!formData.preliminaryReview) newErrors.preliminaryReview = "Preliminary Review is required";
    if (!formData.riskBeforeChange.level) newErrors.riskBeforeChange = "Risk Assessment (Before) is required";
    if (!formData.riskAfterChange.level) newErrors.riskAfterChange = "Risk Assessment (After) is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setShowValidationSummary(true);
    if (validateAll()) {
      console.log("Form Valid & Submitted:", formData);
    } else {
      // Re-run validation to get current errors object
      const currentErrors: Record<string, string> = {};
      if (!formData.mocTitle) currentErrors.mocTitle = "MOC Title is required";
      if (!formData.areaId) currentErrors.areaId = "Area is required";
      if (!formData.unitId) currentErrors.unitId = "Unit is required";
      if (!formData.background) currentErrors.background = "Background is required";
      if (!formData.impact) currentErrors.impact = "Impact is required";
      if (!formData.scopeOfWork) currentErrors.scopeOfWork = "Scope of Work is required";
      if (!formData.tpmLossTypeId) currentErrors.tpmLossTypeId = "TPM Loss Type is required";
      if (!formData.benefit) currentErrors.benefit = "Benefit description is required";
      if (!formData.priorityId) currentErrors.priorityId = "Priority is required";
      if (!formData.preliminaryReview) currentErrors.preliminaryReview = "Preliminary Review is required";
      if (!formData.riskBeforeChange.level) currentErrors.riskBeforeChange = "Risk Assessment (Before) is required";
      if (!formData.riskAfterChange.level) currentErrors.riskAfterChange = "Risk Assessment (After) is required";

      if (Object.keys(currentErrors).length > 0) {
        console.log("Reporting validation errors:", currentErrors);
        reportValidationErrors(currentErrors, handleScrollToField, handleAutoFill);
        setHasReportedErrors(true);
      }
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getRiskLevelConfig = (level: string | null) => {
    if (!level) return {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-700"
    };
    const configs: Record<string, any> = {
      Low: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", badge: "bg-green-100 text-green-800 border-green-300" },
      Medium: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      High: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-800 border-orange-300" },
      Extreme: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-100 text-red-800 border-red-300" }
    };
    return configs[level] || configs.Low;
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
      <div className="max-w-[860px] pb-32 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

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
                    Form auto-completed by AI
                  </h3>
                  <p className="text-[13px] text-[#68737D] mt-1">
                    Review the details extracted from your request below and submit.
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

            {/* Validation Summary - Hidden when using AI Assistant */}
            {showValidationSummary && Object.keys(errors).length > 0 && !hasReportedErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                  <AlertCircle className="w-5 h-5" /> Validation Errors
                </div>
                <p className="text-sm text-red-600 mb-2">Please fix the following errors before submitting:</p>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {Object.entries(errors).map(([key, msg]) => (
                    <li key={key}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}            <div>
              <h2 className="text-[24px] font-semibold text-[#1C1C1E] mb-1">Initiation Request Form</h2>
              <p className="text-[#68737D] text-sm">Electronic Management of Change - Initiation Stage</p>
            </div>

            {/* Basic Information */}
            <section id="section-basic-info" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
                Basic Information
              </h3>

              <div className="grid gap-6">
                <div className="space-y-2" id="field-mocTitle">
                  <Label className="text-[13px] font-medium text-[#1C1C1E]">
                    MOC Title <span className="text-[#D93F4C]">*</span>
                  </Label>
                  <Input
                    className={cn(
                      "h-11 bg-white",
                      errors.mocTitle ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-[#D4D9DE] focus:ring-[#1F73B7]/20 focus:border-[#1F73B7]"
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
                      Location <span className="text-[#D93F4C]">*</span>
                    </Label>
                    <Select
                      value={formData.areaId}
                      onValueChange={(value) => handleInputChange('areaId', value)}
                    >
                      <SelectTrigger className={cn(
                        "h-11 bg-white",
                        errors.areaId ? "border-red-300" : "border-[#D4D9DE]"
                      )}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#006699]" />
                          <SelectValue placeholder="Select location" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Select Location
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
                        "h-11 bg-white",
                        errors.unitId ? "border-red-300" : "border-[#D4D9DE]"
                      )}>
                        <SelectValue placeholder={formData.areaId ? "Select unit" : "Select location first"} />
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
              </div>
            </section>

            {/* Background & Impact */}
            <section id="section-background" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
                Background & Impact
              </h3>

              <div className="space-y-6">
                <div className="space-y-2" id="field-background">
                  <Label className="text-[13px] font-medium text-[#1C1C1E]">
                    Background <span className="text-[#D93F4C]">*</span>
                  </Label>
                  <Textarea
                    className={cn(
                      "min-h-[100px] resize-y",
                      errors.background ? "border-red-300" : "border-[#D4D9DE]"
                    )}
                    placeholder="Describe the background and reason for this change"
                    value={formData.background}
                    onChange={(e) => handleInputChange('background', e.target.value)}
                  />
                  {errors.background && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.background}</span>}
                </div>

                <div className="space-y-2" id="field-impact">
                  <Label className="text-[13px] font-medium text-[#1C1C1E]">
                    Impact <span className="text-[#D93F4C]">*</span>
                  </Label>
                  <Textarea
                    className={cn(
                      "min-h-[100px] resize-y",
                      errors.impact ? "border-red-300" : "border-[#D4D9DE]"
                    )}
                    placeholder="Describe the expected impact of this change"
                    value={formData.impact}
                    onChange={(e) => handleInputChange('impact', e.target.value)}
                  />
                  {errors.impact && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.impact}</span>}
                </div>

                <div className="space-y-2" id="field-scopeOfWork">
                  <Label className="text-[13px] font-medium text-[#1C1C1E]">
                    Scope of Work <span className="text-[#D93F4C]">*</span>
                  </Label>
                  <Textarea
                    className={cn(
                      "min-h-[100px] resize-y",
                      errors.scopeOfWork ? "border-red-300" : "border-[#D4D9DE]"
                    )}
                    placeholder="Define the scope of work for this change"
                    value={formData.scopeOfWork}
                    onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
                  />
                  {errors.scopeOfWork && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.scopeOfWork}</span>}
                </div>
              </div>
            </section>

            {/* Loss & Benefit Analysis */}
            <section id="section-analysis" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
                Loss & Benefit Analysis
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2" id="field-tpmLossTypeId">
                  {renderLabelWithAI("TPM Loss Type", "tpmLossTypeId", true)}
                  <Select
                    value={formData.tpmLossTypeId}
                    onValueChange={(value) => handleInputChange('tpmLossTypeId', value)}
                  >
                    <SelectTrigger className={cn(
                      "h-11 bg-white transition-all duration-500",
                      errors.tpmLossTypeId ? "border-red-300" : "border-[#D4D9DE]",
                      highlightedField === 'tpmLossTypeId' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}>
                      <SelectValue placeholder="Select TPM loss type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TPM_LOSS_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tpmLossTypeId && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.tpmLossTypeId}</span>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-[#1C1C1E]">
                    Loss Eliminate Value (THB) <span className="text-[#D93F4C]">*</span>
                  </Label>
                  <Input
                    className="h-11 border-[#D4D9DE]"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.lossEliminateValue || ""}
                    onChange={(e) => handleInputChange('lossEliminateValue', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2" id="field-benefit">
                {renderLabelWithAI("Benefit", "benefit", true)}
                <Textarea
                  className={cn(
                    "min-h-[80px] resize-y transition-all duration-500",
                    errors.benefit ? "border-red-300" : "border-[#D4D9DE]",
                    highlightedField === 'benefit' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                  )}
                  placeholder="Describe the expected benefits"
                  value={formData.benefit}
                  onChange={(e) => handleInputChange('benefit', e.target.value)}
                />
                {errors.benefit && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.benefit}</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2" id="field-benefitValue">
                  {renderLabelWithAI("Benefit Value (THB)", "benefitValue", true)}
                  <Input
                    className={cn(
                      "h-11 border-[#D4D9DE] transition-all duration-500",
                      highlightedField === 'benefitValue' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.benefitValue || ""}
                    onChange={(e) => handleInputChange('benefitValue', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2" id="field-investment">
                  {renderLabelWithAI("Investment (THB)", "investment", true)}
                  <Input
                    className={cn(
                      "h-11 border-[#D4D9DE] transition-all duration-500",
                      highlightedField === 'investment' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                    )}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.investment || ""}
                    onChange={(e) => handleInputChange('investment', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </section>

            {/* Additional Details */}
            <section id="section-additional" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
                Additional Details
              </h3>

              <div id="field-lengthOfChange">
                {renderLabelWithAI("Length of Change", "lengthOfChange", true)}
                <div className={cn(
                  "grid grid-cols-3 gap-3 p-2 rounded-lg transition-all duration-500",
                  highlightedField === 'lengthOfChange' && "ring-2 ring-[#006699] bg-blue-50"
                )}>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#68737D]">Years</Label>
                    <Input
                      type="number"
                      min="0"
                      className="h-10 border-[#D4D9DE]"
                      value={formData.lengthOfChange.years || ""}
                      onChange={(e) => handleLengthChange('years', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#68737D]">Months</Label>
                    <Input
                      type="number"
                      min="0" max="11"
                      className="h-10 border-[#D4D9DE]"
                      value={formData.lengthOfChange.months || ""}
                      onChange={(e) => handleLengthChange('months', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#68737D]">Days</Label>
                    <Input
                      type="number"
                      min="0" max="365"
                      className="h-10 border-[#D4D9DE]"
                      value={formData.lengthOfChange.days || ""}
                      onChange={(e) => handleLengthChange('days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2" id="field-priorityId">
                {renderLabelWithAI("Priority of Change", "priorityId", true)}
                <Select
                  value={formData.priorityId}
                  onValueChange={(value) => handleInputChange('priorityId', value)}
                >
                  <SelectTrigger className={cn(
                    "h-11 bg-white transition-all duration-500",
                    errors.priorityId ? "border-red-300" : "border-[#D4D9DE]",
                    highlightedField === 'priorityId' && "ring-2 ring-[#006699] bg-blue-50 border-[#006699]"
                  )}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>{priority.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priorityId && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.priorityId}</span>}
              </div>

              <div className="space-y-2" id="field-preliminaryReview">
                <Label className="text-[13px] font-medium text-[#1C1C1E]">
                  Preliminary Review <span className="text-[#D93F4C]">*</span>
                </Label>
                <Textarea
                  className={cn(
                    "min-h-[100px] resize-y",
                    errors.preliminaryReview ? "border-red-300" : "border-[#D4D9DE]"
                  )}
                  placeholder="Enter preliminary review comments"
                  value={formData.preliminaryReview}
                  onChange={(e) => handleInputChange('preliminaryReview', e.target.value)}
                />
                {errors.preliminaryReview && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.preliminaryReview}</span>}
              </div>
            </section>

            {/* Risk Assessment */}
            <section id="section-risk" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Assessment
              </h3>

              <div className="space-y-4">
                <div id="field-riskBeforeChange">
                  {renderLabelWithAI("Risk Before Change", "riskBeforeChange", true)}
                  {(() => {
                    const config = getRiskLevelConfig(formData.riskBeforeChange.level);
                    return (
                      <div className={cn(
                        "p-5 border-2 rounded-xl transition-all duration-500",
                        errors.riskBeforeChange ? "border-red-300 bg-red-50" :
                          formData.riskBeforeChange.level ? config.bg : "bg-white",
                        !errors.riskBeforeChange && (formData.riskBeforeChange.level ? config.border : "border-[#E5E7EB]"),
                        highlightedField === 'riskBeforeChange' && "ring-4 ring-[#006699]/20"
                      )}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {formData.riskBeforeChange.level ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "px-4 py-2 rounded-lg font-bold text-base border-2",
                                    config.badge
                                  )}>
                                    {formData.riskBeforeChange.level}
                                  </span>
                                  <div>
                                    <div className={cn("text-2xl font-bold", config.text)}>
                                      {formData.riskBeforeChange.score}
                                    </div>
                                    <div className="text-xs text-[#68737D]">Risk Score</div>
                                  </div>
                                </div>
                                <p className="text-sm text-[#68737D]">
                                  {formData.riskBeforeChange.likelihoodLabel} likelihood × {formData.riskBeforeChange.impactLabel} impact
                                </p>
                              </div>
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
                            {formData.riskBeforeChange.level ? "Edit" : "Assess Risk"}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div id="field-riskAfterChange">
                  {renderLabelWithAI("Risk After Change", "riskAfterChange", true)}
                  {(() => {
                    const config = getRiskLevelConfig(formData.riskAfterChange.level);
                    return (
                      <div className={cn(
                        "p-5 border-2 rounded-xl transition-all duration-500",
                        errors.riskAfterChange ? "border-red-300 bg-red-50" :
                          formData.riskAfterChange.level ? config.bg : "bg-white",
                        !errors.riskAfterChange && (formData.riskAfterChange.level ? config.border : "border-[#E5E7EB]"),
                        highlightedField === 'riskAfterChange' && "ring-4 ring-[#006699]/20"
                      )}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {formData.riskAfterChange.level ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "px-4 py-2 rounded-lg font-bold text-base border-2",
                                    config.badge
                                  )}>
                                    {formData.riskAfterChange.level}
                                  </span>
                                  <div>
                                    <div className={cn("text-2xl font-bold", config.text)}>
                                      {formData.riskAfterChange.score}
                                    </div>
                                    <div className="text-xs text-[#68737D]">Risk Score</div>
                                  </div>
                                </div>
                                <p className="text-sm text-[#68737D]">
                                  {formData.riskAfterChange.likelihoodLabel} likelihood × {formData.riskAfterChange.impactLabel} impact
                                </p>
                              </div>
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
                            {formData.riskAfterChange.level ? "Edit" : "Assess Risk"}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>

            {/* File Attachments */}
            <section id="section-files" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
                File Attachments
              </h3>

              <div className="space-y-6">
                <FileUploadSection
                  category="Technical Information"
                  files={formData.attachments.technicalInformation}
                  onFilesChange={(files) => handleInputChange('attachments', {
                    ...formData.attachments,
                    technicalInformation: files
                  })}
                />

                <FileUploadSection
                  category="Minute of Meeting"
                  files={formData.attachments.minuteOfMeeting}
                  onFilesChange={(files) => handleInputChange('attachments', {
                    ...formData.attachments,
                    minuteOfMeeting: files
                  })}
                />

                <FileUploadSection
                  category="Other Documents"
                  files={formData.attachments.otherDocuments}
                  onFilesChange={(files) => handleInputChange('attachments', {
                    ...formData.attachments,
                    otherDocuments: files
                  })}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-[72px] right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-4 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="ml-[240px] mr-6 flex items-center justify-start gap-3">
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
      </div>
    </TooltipProvider>
  );
};
