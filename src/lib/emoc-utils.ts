import { format } from 'date-fns';
import {
  RiskScore,
  RiskLevel,
  LikelihoodValue,
  ImpactValue,
  RiskAssessment,
  LikelihoodLetter,
  SeverityLevel
} from "../types/emoc";

export function calculateRiskScore(likelihood: LikelihoodValue, impact: ImpactValue): RiskScore {
  return likelihood * impact;
}

export function determineRiskLevel(score: RiskScore): RiskLevel {
  if (score >= 1 && score <= 4) return "Low";
  if (score >= 5 && score <= 9) return "Medium";
  if (score >= 10 && score <= 12) return "High";
  if (score >= 13 && score <= 16) return "Extreme";
  return "Low";
}

// NEW: Map numeric likelihood value to letter (A/B/C/D)
export function getLikelihoodLetter(numericValue: LikelihoodValue): LikelihoodLetter {
  const mapping: Record<LikelihoodValue, LikelihoodLetter> = {
    1: "A",
    2: "B",
    3: "C",
    4: "D"
  };
  return mapping[numericValue];
}

// NEW: Map numeric impact value to severity level
export function getSeverityLevel(numericValue: ImpactValue): SeverityLevel {
  const mapping: Record<ImpactValue, SeverityLevel> = {
    1: "Minor",
    2: "Moderate",
    3: "Major",
    4: "Catastrophic"
  };
  return mapping[numericValue];
}

// NEW: Risk code mapping for 4x4 matrix (Probability A-D × Severity 1-4)
// Layout: Rows=Severity(1-4), Columns=Probability(A-D)
// Row 1 (Sev1): L16 | L15 | M13 | M12
// Row 2 (Sev2): L14 | M11 | M10 | H6
// Row 3 (Sev3): M9 | M8 | H5 | H4
// Row 4 (Sev4): M7 | H3 | H2 | H1
const RISK_CODE_MATRIX: Record<LikelihoodValue, Record<ImpactValue, string>> = {
  1: { 1: "L16", 2: "L14", 3: "M9", 4: "M7" },    // Probability A (Rare)
  2: { 1: "L15", 2: "M11", 3: "M8", 4: "H3" },    // Probability B (Unlikely)
  3: { 1: "M13", 2: "M10", 3: "H5", 4: "H2" },    // Probability C (Possible)
  4: { 1: "M12", 2: "H6", 3: "H4", 4: "H1" }      // Probability D (Likely)
};

// NEW: Generate risk code based on probability and severity matrix
export function generateRiskCode(likelihood: LikelihoodValue | null, impact: ImpactValue | null): string {
  if (!likelihood || !impact) return "";
  return RISK_CODE_MATRIX[likelihood]?.[impact] || "";
}

export function createRiskAssessment(
  likelihood: LikelihoodValue | null,
  impact: ImpactValue | null
): RiskAssessment {
  const likelihoodLabels: Record<LikelihoodValue, string> = {
    1: "Rare",
    2: "Unlikely",
    3: "Possible",
    4: "Likely"
  };

  const impactLabels: Record<ImpactValue, string> = {
    1: "Minor",
    2: "Moderate",
    3: "Major",
    4: "Catastrophic"
  };

  const score = likelihood && impact ? calculateRiskScore(likelihood, impact) : 0;
  const level = score > 0 ? determineRiskLevel(score) : null;

  // NEW: Generate enhanced fields for industry-standard display
  const likelihoodLetter = likelihood ? getLikelihoodLetter(likelihood) : undefined;
  const severityLevel = impact ? getSeverityLevel(impact) : undefined;
  const riskCode = likelihood && impact ? generateRiskCode(likelihood, impact) : undefined;

  return {
    likelihood,
    likelihoodLabel: likelihood ? likelihoodLabels[likelihood] : "",
    likelihoodLetter,  // NEW
    impact,
    impactLabel: impact ? impactLabels[impact] : "",
    severityLevel,     // NEW
    score,
    level,
    riskCode           // NEW
  };
}

export const ALLOWED_FILE_TYPES = [
  ".pdf", ".dwg", ".ppt", ".pptx", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".png"
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_FILE_TYPES.includes(extension);
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getStepFromProcess(process: "Initiation" | "Review" | "Implementation" | "Closeout"): number {
  const processMap = {
    "Initiation": 1,
    "Review": 2,
    "Implementation": 3,
    "Closeout": 4
  };
  return processMap[process] || 1;
}

export function formatAssignedOnDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MM/dd/yyyy HH:mm');
  } catch {
    return dateString; // Fallback to original if parsing fails
  }
}

// Risk code to color mapping - Professional minimal colors
export const getRiskCodeStyle = (riskCode: string): React.CSSProperties => {
  if (riskCode.startsWith("L")) {
    return { backgroundColor: '#D1FAE5', color: '#065F46' }; // Green for L14-L16
  } else if (riskCode.startsWith("M")) {
    return { backgroundColor: '#FED7AA', color: '#9A3412' }; // Orange for M7-M13
  } else if (riskCode.startsWith("H")) {
    return { backgroundColor: '#FEE2E2', color: '#991B1B' }; // Red for H1-H6
  }
  return { backgroundColor: '#F3F4F6', color: '#374151' };
};
