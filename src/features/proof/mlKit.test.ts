import { pickProofLabel } from './mlKitLabels';
import { createMlKitVerifier } from './mlKitVerifier';
import type { ProofVerifier } from './verifier';

const live: ProofVerifier = { verify: async (uri) => (uri === 'live' ? { ok: true, label: 'Photo taken just now' } : { ok: false }) };

describe('pickProofLabel', () => {
  it('returns the most confident matching label', () => {
    expect(
      pickProofLabel([
        { text: 'Dog', confidence: 0.97 },
        { text: 'Floor', confidence: 0.6 },
        { text: 'Carpet', confidence: 0.8 },
      ]),
    ).toBe('Carpet');
  });

  it('matches whole words in multi-word labels', () => {
    expect(pickProofLabel([{ text: 'Place of worship', confidence: 0.7 }])).toBe('Place of worship');
    expect(pickProofLabel([{ text: 'Living room', confidence: 0.7 }])).toBe('Living room');
  });

  it('ignores partial words and low confidence', () => {
    expect(pickProofLabel([{ text: 'Format', confidence: 0.9 }])).toBeNull();
    expect(pickProofLabel([{ text: 'Carpet', confidence: 0.3 }])).toBeNull();
    expect(pickProofLabel([])).toBeNull();
  });
});

describe('createMlKitVerifier', () => {
  it('accepts a live photo whose labels match and reports the label', async () => {
    const verifier = createMlKitVerifier(async () => [{ text: 'Carpet', confidence: 0.9 }], live);
    await expect(verifier.verify('live')).resolves.toEqual({ ok: true, label: 'Carpet detected' });
  });

  it('rejects a live photo with unrelated labels', async () => {
    const verifier = createMlKitVerifier(async () => [{ text: 'Cat', confidence: 0.95 }], live);
    await expect(verifier.verify('live')).resolves.toEqual({ ok: false });
  });

  it('never runs the labeler for a photo that failed the live check', async () => {
    const labeler = jest.fn(async () => [{ text: 'Carpet', confidence: 0.9 }]);
    await expect(createMlKitVerifier(labeler, live).verify('gallery')).resolves.toEqual({ ok: false });
    expect(labeler).not.toHaveBeenCalled();
  });

  it('falls back to the live result when the labeler throws', async () => {
    const verifier = createMlKitVerifier(async () => {
      throw new Error('native module failed');
    }, live);
    await expect(verifier.verify('live')).resolves.toEqual({ ok: true, label: 'Photo taken just now' });
  });
});
