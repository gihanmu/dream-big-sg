export interface MissionOption {
  id: string;
  label: string;
  emoji: string;
}

export const ACTION_OPTIONS: MissionOption[] = [
  { id: 'rescue', label: 'Rescue', emoji: '🛟' },
  { id: 'build', label: 'Build', emoji: '🧱' },
  { id: 'invent', label: 'Invent', emoji: '💡' },
  { id: 'explore', label: 'Explore', emoji: '🧭' },
  { id: 'teach', label: 'Teach', emoji: '📘' },
  { id: 'heal', label: 'Heal', emoji: '🫀' },
  { id: 'protect', label: 'Protect', emoji: '🛡️' },
  { id: 'perform', label: 'Perform', emoji: '🎭' }
];

export const WHO_WHAT_OPTIONS: MissionOption[] = [
  { id: 'people', label: 'People', emoji: '🧑‍🤝‍🧑' },
  { id: 'animals', label: 'Animals', emoji: '🐾' },
  { id: 'nature', label: 'Nature', emoji: '🌳' },
  { id: 'robots', label: 'Robots', emoji: '🤖' },
  { id: 'space', label: 'Space', emoji: '🔭' },
  { id: 'community', label: 'Community', emoji: '🏘️' },
  { id: 'city', label: 'City', emoji: '🏙️' }
];

export const POWER_OPTIONS: MissionOption[] = [
  { id: 'super-speed', label: 'Super Speed', emoji: '⚡' },
  { id: 'kindness', label: 'Kindness', emoji: '💖' },
  { id: 'teamwork', label: 'Teamwork', emoji: '🤝' },
  { id: 'gadgets', label: 'Gadgets', emoji: '🔧' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨' }
];