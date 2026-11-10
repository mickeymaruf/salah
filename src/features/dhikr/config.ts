export type DhikrKey = 'durood' | 'subhanallah' | 'alhamdulillah' | 'la-ilaha-illallah' | 'allahu-akbar' | 'astaghfirullah';

export interface DhikrEntry {
  key: DhikrKey;
  arabic: string;
  name: string;
  meaning: string;
  // Deeds one recitation adds. null when no value has been chosen.
  deedValue: number | null;
  // Where the value comes from. Every entry is a placeholder until a scholar verifies it.
  source: string;
  // Only a verified value is used. Until then one recitation adds one deed (see recitationDeeds).
  verified: boolean;
}

const UNVERIFIED = 'Placeholder: no source checked yet';

// The one table of dhikr, in list order, with each reward value. All values and sources are placeholders until a scholar verifies them.
export const DHIKR: readonly DhikrEntry[] = [
  {
    key: 'durood',
    arabic: 'ﷺ',
    name: 'Durood Ibrahim',
    meaning: 'Blessings upon the Prophet',
    deedValue: 10,
    source: 'Placeholder: Sahih Muslim 408 (Allah sends ten blessings for one). Not verified.',
    verified: false,
  },
  { key: 'subhanallah', arabic: 'سبحان الله', name: 'SubhanAllah', meaning: 'Glory be to Allah', deedValue: null, source: UNVERIFIED, verified: false },
  { key: 'alhamdulillah', arabic: 'الحمد لله', name: 'Alhamdulillah', meaning: 'All praise is for Allah', deedValue: null, source: UNVERIFIED, verified: false },
  {
    key: 'la-ilaha-illallah',
    arabic: 'لا إله إلا الله',
    name: 'La ilaha illallah',
    meaning: 'There is no god but Allah',
    deedValue: null,
    source: UNVERIFIED,
    verified: false,
  },
  { key: 'allahu-akbar', arabic: 'الله أكبر', name: 'Allahu Akbar', meaning: 'Allah is the Greatest', deedValue: null, source: UNVERIFIED, verified: false },
  {
    key: 'astaghfirullah',
    arabic: 'أستغفر الله',
    name: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    deedValue: null,
    source: UNVERIFIED,
    verified: false,
  },
];

export function findDhikr(key: string | undefined): DhikrEntry | undefined {
  return DHIKR.find((entry) => entry.key === key);
}
