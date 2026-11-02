import { getVerifier, liveCaptureVerifier, registerLiveCapture } from './verifier';

describe('liveCaptureVerifier', () => {
  it('accepts a photo the camera produced in this session', async () => {
    registerLiveCapture('file:///cache/Camera/live.jpg');
    await expect(liveCaptureVerifier.verify('file:///cache/Camera/live.jpg')).resolves.toEqual({
      ok: true,
      label: 'Photo taken just now',
    });
  });

  it('rejects any other uri, such as a gallery photo', async () => {
    await expect(liveCaptureVerifier.verify('file:///gallery/old.jpg')).resolves.toEqual({ ok: false });
  });

  it('is the default verifier', () => {
    expect(getVerifier()).toBe(liveCaptureVerifier);
  });
});
