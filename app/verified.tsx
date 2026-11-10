import { Redirect } from 'expo-router';
import { proofFlowEnabled } from '@/shared/lib/features';
import { VerifiedScreen } from '@/features/proof/VerifiedScreen';

export default function Route() {
  if (!proofFlowEnabled) return <Redirect href="/today" />;
  return <VerifiedScreen />;
}
