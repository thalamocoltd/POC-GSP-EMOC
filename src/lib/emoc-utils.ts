import { 
  RiskScore, 
  RiskLevel, 
  LikelihoodValue, 
  ImpactValue,
  RiskAssessment,
  LengthOfChange 
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

export function formatLengthOfChange(length: LengthOfChange): string {
  const parts: string[] = [];
  if (length.years > 0) parts.push(`${length.years} year${length.years > 1 ? 's' : ''}`);
  if (length.months > 0) parts.push(`${length.months} month${length.months > 1 ? 's' : ''}`);
  if (length.days > 0) parts.push(`${length.days} day${length.days > 1 ? 's' : ''}`);
  return parts.join(' ') || '0 days';
}

export const ALLOWED_FILE_TYPES = {
  "Technical Information": [".pdf", ".pfd", ".dwg", ".ppt", ".pptx"],
  "Minute of Meeting": [".pdf", ".doc", ".docx"],
  "Other Documents": [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".png"]
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(fileName: string, category: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  const allowedTypes = ALLOWED_FILE_TYPES[category as keyof typeof ALLOWED_FILE_TYPES] || [];
  return allowedTypes.includes(extension);
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
