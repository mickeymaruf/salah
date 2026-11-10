// The proof-first alarm (alarm screen, camera, verified screen, ML Kit check, looping sound) is switched off. Its code stays
// so a later decision can bring it back. While this is false no route reaches it, nothing asks for the camera and
// the photo check never runs.
export const proofFlowEnabled = false;
