import { TextPage } from './components/TextPage';

export function PrivacyScreen() {
  return (
    <TextPage
      title="Privacy"
      sections={[
        {
          heading: 'Everything stays on your phone',
          body: 'Salah has no account, no server and no analytics. Your name, location, prayer log and photos are stored only on this device.',
        },
        {
          heading: 'Location',
          body: 'Used only while the app is open to find your city and calculate the five prayer times on your phone. The coordinates are saved on this device so times work offline.',
        },
        {
          heading: 'Camera',
          body: 'Used only when you take a proof photo. The photo is checked on your phone and never uploaded. It is kept in the app so you can see it again, and it is deleted if you uninstall Salah.',
        },
        {
          heading: 'Notifications',
          body: 'Salah schedules reminders and alarms on your phone. They are not sent from any server.',
        },
        {
          heading: 'Deleting your data',
          body: 'Uninstall the app to remove everything it stored.',
        },
      ]}
    />
  );
}
