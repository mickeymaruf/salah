export interface ImageLabel {
  text: string;
  confidence: number;
}

// Whole words, so "mat" does not match "format". ML Kit labels a rug as Carpet, Floor or Room far more
// often than "prayer rug", so those count.
const KEYWORDS = ['prayer', 'rug', 'carpet', 'mat', 'mosque', 'worship', 'floor', 'flooring', 'room', 'bedroom'];
const MIN_CONFIDENCE = 0.5;

export function pickProofLabel(labels: readonly ImageLabel[]): string | null {
  const matches = labels
    .filter((label) => label.confidence >= MIN_CONFIDENCE)
    .filter((label) => label.text.toLowerCase().split(/\s+/).some((word) => KEYWORDS.includes(word)))
    .sort((a, b) => b.confidence - a.confidence);
  return matches[0]?.text ?? null;
}
