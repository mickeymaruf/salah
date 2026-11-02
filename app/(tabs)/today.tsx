import { Screen, Text } from '@/shared/ui';
import { useProfileStore } from '@/shared/state/profileStore';

export default function Today() {
  const name = useProfileStore((state) => state.profile?.name);
  return (
    <Screen>
      <Text variant="heading">{`Assalamu alaikum, ${name}`}</Text>
    </Screen>
  );
}
