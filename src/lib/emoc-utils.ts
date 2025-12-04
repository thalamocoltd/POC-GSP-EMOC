import {
  RiskScore,
  RiskLevel,
  LikelihoodValue,
  ImpactValue,
  RiskAssessment
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
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Extreme"
  };

  const score = likelihood && impact ? calculateRiskScore(likelihood, impact) : 0;
  const level = score > 0 ? determineRiskLevel(score) : null;

  return {
    likelihood,
    likelihoodLabel: likelihood ? likelihoodLabels[likelihood] : "",
    impact,
    impactLabel: impact ? impactLabels[impact] : "",
    score,
    level
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
