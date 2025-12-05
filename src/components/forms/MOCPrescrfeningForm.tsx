import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "../ui/utils";

export interface MOCPrescreeningData {
  tpmLossRelated: "yes" | "no" | null;
  safetyRelated: "yes" | "no" | null;
  environmentRelated: "yes" | "no" | null;
  qualityRelated: "yes" | "no" | null;
}

interface MOCPrescrfeningFormProps {
  onBack: () => void;
  onSubmit: (data: MOCPrescreeningData) => void;
}

export const MOCPrescrfeningForm = ({ onBack, onSubmit }: MOCPrescrfeningFormProps) => {
  const [formData, setFormData] = useState<MOCPrescreeningData>({
    tpmLossRelated: null,
    safetyRelated: null,
    environmentRelated: null,
    qualityRelated: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof MOCPrescreeningData, value: "yes" | "no") => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user selects an option
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.tpmLossRelated === null) {
      newErrors.tpmLossRelated = "Please select an option";
    }
    if (formData.safetyRelated === null) {
      newErrors.safetyRelated = "Please select an option";
    }
    if (formData.environmentRelated === null) {
      newErrors.environmentRelated = "Please select an option";
    }
    if (formData.qualityRelated === null) {
      newErrors.qualityRelated = "Please select an option";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">MOC Prescreening Form</h1>
              <p className="text-sm text-gray-500 mt-1">Answer the following questions to evaluate the scope of your change</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-8">
          {/* Question 1: TPM Loss */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0 mt-1">
                1
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900 block mb-4">
                  Is this change related to TPM Loss (Total Productive Maintenance loss - including equipment downtime, defects, or efficiency improvements)?
                </Label>
                <RadioGroup
                  value={formData.tpmLossRelated || ""}
                  onValueChange={(value) => handleChange("tpmLossRelated", value as "yes" | "no")}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="tpmLoss-yes" />
                    <Label htmlFor="tpmLoss-yes" className="font-normal text-gray-700 cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <RadioGroupItem value="no" id="tpmLoss-no" />
                    <Label htmlFor="tpmLoss-no" className="font-normal text-gray-700 cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.tpmLossRelated && (
                  <p className="text-sm text-red-500 mt-2">{errors.tpmLossRelated}</p>
                )}
              </div>
            </div>
          </div>

          {/* Question 2: Safety */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0 mt-1">
                2
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900 block mb-4">
                  Is this change related to Safety (worker safety, hazard mitigation, incident prevention, or safety system modifications)?
                </Label>
                <RadioGroup
                  value={formData.safetyRelated || ""}
                  onValueChange={(value) => handleChange("safetyRelated", value as "yes" | "no")}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="safety-yes" />
                    <Label htmlFor="safety-yes" className="font-normal text-gray-700 cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <RadioGroupItem value="no" id="safety-no" />
                    <Label htmlFor="safety-no" className="font-normal text-gray-700 cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.safetyRelated && (
                  <p className="text-sm text-red-500 mt-2">{errors.safetyRelated}</p>
                )}
              </div>
            </div>
          </div>

          {/* Question 3: Environment */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0 mt-1">
                3
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900 block mb-4">
                  Is this change related to Environment?
                </Label>
                <RadioGroup
                  value={formData.environmentRelated || ""}
                  onValueChange={(value) => handleChange("environmentRelated", value as "yes" | "no")}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="environment-yes" />
                    <Label htmlFor="environment-yes" className="font-normal text-gray-700 cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <RadioGroupItem value="no" id="environment-no" />
                    <Label htmlFor="environment-no" className="font-normal text-gray-700 cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.environmentRelated && (
                  <p className="text-sm text-red-500 mt-2">{errors.environmentRelated}</p>
                )}
              </div>
            </div>
          </div>

          {/* Question 4: Quality */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0 mt-1">
                4
              </div>
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900 block mb-4">
                  Is this change related to Quality?
                </Label>
                <RadioGroup
                  value={formData.qualityRelated || ""}
                  onValueChange={(value) => handleChange("qualityRelated", value as "yes" | "no")}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="quality-yes" />
                    <Label htmlFor="quality-yes" className="font-normal text-gray-700 cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <RadioGroupItem value="no" id="quality-no" />
                    <Label htmlFor="quality-no" className="font-normal text-gray-700 cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.qualityRelated && (
                  <p className="text-sm text-red-500 mt-2">{errors.qualityRelated}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onBack}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
