import { Redirect } from 'expo-router';
import { useProfileStore } from '@/shared/state/profileStore';

export default function Index() {
  const hasProfile = useProfileStore((state) => state.profile !== null);
  return <Redirect href={hasProfile ? '/today' : '/name'} />;
}
