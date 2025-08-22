export interface LocationOption {
  value: string;
  label: string;
  imageUrl: string;
  description: string;
  emoji: string;
  suggestedActivities: string[];
}

export const LOCATION_OPTIONS: LocationOption[] = [
  {
    value: 'gardens-by-the-bay',
    label: 'Gardens by the Bay',
    imageUrl: '/images/locations/gardens-by-the-bay.svg',
    description: 'Iconic Supertrees and futuristic gardens',
    emoji: '🌸',
    suggestedActivities: [
      'soaring like Superman above the Supertrees',
      'using plant powers to make flowers bloom instantly',
      'creating rainbow bridges between the domes',
      'flying through the Cloud Forest like a nature hero',
      'growing giant protective vines around the gardens'
    ]
  },
  {
    value: 'marina-bay-sands',
    label: 'Marina Bay Sands',
    imageUrl: '/images/locations/marina-bay-sands.svg',
    description: 'Famous infinity pool and luxury resort',
    emoji: '🏙️',
    suggestedActivities: [
      'leaping between the three towers like Spider-Man',
      'creating water tornadoes from the infinity pool',
      'shooting laser beams that light up the city skyline',
      'surfing on energy waves across Marina Bay',
      'building bridges of light connecting the towers'
    ]
  },
  {
    value: 'jewel-changi',
    label: 'Jewel Changi Airport',
    imageUrl: '/images/locations/jewel-changi.svg',
    description: 'World\'s tallest indoor waterfall',
    emoji: '💎',
    suggestedActivities: [
      'controlling the Rain Vortex with water powers',
      'flying through the forest dome like a jungle hero',
      'creating portals for instant travel around the world',
      'using crystal powers to make the dome sparkle',
      'guiding planes safely with superhero beacon powers'
    ]
  },
  {
    value: 'sentosa-island',
    label: 'Sentosa Island',
    imageUrl: '/images/locations/sentosa-island.svg',
    description: 'Beach paradise and theme parks',
    emoji: '🏖️',
    suggestedActivities: [
      'surfing on giant waves with ocean superpowers',
      'building sandcastles that come to life and protect the beach',
      'racing underwater like Aquaman to save sea creatures',
      'creating fun roller coasters with imagination powers',
      'controlling the sun to create perfect beach weather'
    ]
  },
  {
    value: 'botanic-gardens',
    label: 'Singapore Botanic Gardens',
    imageUrl: '/images/locations/botanic-gardens.svg',
    description: 'UNESCO World Heritage orchid garden',
    emoji: '🌿',
    suggestedActivities: [
      'talking to ancient trees to learn their wisdom',
      'creating healing potions from magical orchids',
      'flying like a butterfly hero through the garden paths',
      'growing a maze of protective plants around Singapore',
      'using nature powers to clean the air and water'
    ]
  },
  {
    value: 'singapore-flyer',
    label: 'Singapore Flyer',
    imageUrl: '/images/locations/singapore-flyer.svg',
    description: 'Giant observation wheel with city views',
    emoji: '🎡',
    suggestedActivities: [
      'spinning the wheel super fast to generate clean energy',
      'jumping from capsule to capsule high in the sky',
      'using telescope vision to spot trouble across Singapore',
      'creating wind powers while flying around the wheel',
      'building sky bridges connecting to other tall buildings'
    ]
  },
  {
    value: 'merlion-park',
    label: 'Merlion Park',
    imageUrl: '/images/locations/merlion-park.svg',
    description: 'Singapore\'s iconic symbol by the bay',
    emoji: '🦁',
    suggestedActivities: [
      'commanding water like the mighty Merlion',
      'creating protective water shields around Singapore',
      'surfing on the Merlion\'s water spray across the bay',
      'talking to the lion spirit for ancient wisdom',
      'shooting healing water that helps plants and people'
    ]
  },
  {
    value: 'national-gallery',
    label: 'National Gallery & Museums',
    imageUrl: '/images/locations/national-gallery.svg',
    description: 'Art, history and culture museums',
    emoji: '🏛️',
    suggestedActivities: [
      'bringing paintings to life with magical art powers',
      'creating 3D sculptures that protect the city',
      'painting portals that transport people to safety',
      'using color powers to brighten everyone\'s day',
      'making murals that tell stories of Singapore\'s heroes'
    ]
  },
  {
    value: 'random-place',
    label: 'Any Random Place',
    imageUrl: '/images/locations/random-place.svg',
    description: 'Surprise me with a magical location!',
    emoji: '🎲',
    suggestedActivities: [
      'flying across Singapore\'s skyline with rainbow trails',
      'creating magic portals between different neighborhoods',
      'using time powers to explore Singapore\'s history',
      'building invisible bridges connecting all of Singapore',
      'spreading joy and laughter with happiness superpowers'
    ]
  }
];