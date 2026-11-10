import { Redirect } from 'expo-router';
import { proofFlowEnabled } from '@/shared/lib/features';
import { ProofCameraScreen } from '@/features/proof/ProofCameraScreen';

export default function Route() {
  if (!proofFlowEnabled) return <Redirect href="/today" />;
  return <ProofCameraScreen />;
}
