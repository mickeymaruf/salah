import { pickProofLabel, type ImageLabel } from './mlKitLabels';
import type { ProofVerifier } from './verifier';

export type ImageLabeler = (photoUri: string) => Promise<ImageLabel[]>;

// The photo must first pass the base (live capture) check. If the labeler itself fails, for example
// the native module misbehaves, the base result stands: a prayer is never blocked by a broken model.
export function createMlKitVerifier(label: ImageLabeler, base: ProofVerifier): ProofVerifier {
  return {
    async verify(photoUri) {
      const live = await base.verify(photoUri);
      if (!live.ok) return live;
      try {
        const match = pickProofLabel(await label(photoUri));
        return match ? { ok: true, label: `${match} detected` } : { ok: false };
      } catch {
        return live;
      }
    },
  };
}
