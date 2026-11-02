import { TextPage } from './components/TextPage';

export function HelpScreen() {
  return (
    <TextPage
      title="Help & feedback"
      sections={[
        {
          heading: 'How the alarm works',
          body: 'At each prayer time Salah sends a notification, then repeats it every 3 minutes, up to 5 times. Tap it to open the alarm. The sound plays until you take a photo of your prayer space.',
        },
        {
          heading: 'The alarm is late or silent',
          body: 'Check that notifications are allowed for Salah and that Do Not Disturb or a Focus mode is not blocking them. On some Android phones, battery saving can delay alarms: set Salah to "Unrestricted" in the battery settings.',
        },
        {
          heading: 'Wrong prayer times',
          body: 'Update your location in Settings, then try another calculation method. Methods differ by region. The Asr setting changes only Asr: Hanafi is later than Standard.',
        },
        {
          heading: 'I cannot take the photo',
          body: 'Turn off "Require photo proof" in Settings to mark prayers with one tap.',
        },
        {
          heading: 'Feedback',
          body: 'This version has no built-in way to send feedback. Share your notes with whoever gave you the app.',
        },
      ]}
    />
  );
}
