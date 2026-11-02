import { getImageLabeler } from './mlKit';
import { createMlKitVerifier } from './mlKitVerifier';

export interface ProofVerifier {
  verify(photoUri: string): Promise<{ ok: boolean; label?: string }>;
}

// URIs the camera screen produced in this app session. Nothing else can be verified, which is
// what keeps gallery photos and hand-built routes out.
const capturedThisSession = new Set<string>();

export function registerLiveCapture(uri: string): void {
  capturedThisSession.add(uri);
}

export const liveCaptureVerifier: ProofVerifier = {
  async verify(photoUri) {
    return capturedThisSession.has(photoUri) ? { ok: true, label: 'Photo taken just now' } : { ok: false };
  },
};

// ML Kit labeling is used only when its native module is present, otherwise live capture alone.
export function getVerifier(): ProofVerifier {
  const labeler = getImageLabeler();
  return labeler ? createMlKitVerifier(labeler, liveCaptureVerifier) : liveCaptureVerifier;
}
