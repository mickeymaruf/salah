import { Redirect } from 'expo-router';
import { proofFlowEnabled } from '@/shared/lib/features';
import { AlarmScreen } from '@/features/alarm/AlarmScreen';

export default function Route() {
  if (!proofFlowEnabled) return <Redirect href="/today" />;
  return <AlarmScreen />;
}
