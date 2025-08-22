export interface LocationOption {
  value: string;
  label: string;
  imageUrl: string;
  description: string;
  emoji: string;
}

export const LOCATION_OPTIONS: LocationOption[] = [
  {
    value: 'gardens-by-the-bay',
    label: 'Gardens by the Bay',
    imageUrl: '/images/locations/gardens-by-the-bay.svg',
    description: 'Iconic Supertrees and futuristic gardens',
    emoji: '🌸'
  },
  {
    value: 'marina-bay-sands',
    label: 'Marina Bay Sands',
    imageUrl: '/images/locations/marina-bay-sands.svg',
    description: 'Famous infinity pool and luxury resort',
    emoji: '🏙️'
  },
  {
    value: 'jewel-changi',
    label: 'Jewel Changi Airport',
    imageUrl: '/images/locations/jewel-changi.svg',
    description: 'World\'s tallest indoor waterfall',
    emoji: '💎'
  },
  {
    value: 'sentosa-island',
    label: 'Sentosa Island',
    imageUrl: '/images/locations/sentosa-island.svg',
    description: 'Beach paradise and theme parks',
    emoji: '🏖️'
  },
  {
    value: 'botanic-gardens',
    label: 'Singapore Botanic Gardens',
    imageUrl: '/images/locations/botanic-gardens.svg',
    description: 'UNESCO World Heritage orchid garden',
    emoji: '🌿'
  },
  {
    value: 'singapore-flyer',
    label: 'Singapore Flyer',
    imageUrl: '/images/locations/singapore-flyer.svg',
    description: 'Giant observation wheel with city views',
    emoji: '🎡'
  },
  {
    value: 'merlion-park',
    label: 'Merlion Park',
    imageUrl: '/images/locations/merlion-park.svg',
    description: 'Singapore\'s iconic symbol by the bay',
    emoji: '🦁'
  },
  {
    value: 'national-gallery',
    label: 'National Gallery & Museums',
    imageUrl: '/images/locations/national-gallery.svg',
    description: 'Art, history and culture museums',
    emoji: '🏛️'
  },
  {
    value: 'random-place',
    label: 'Any Random Place',
    imageUrl: '/images/locations/random-place.svg',
    description: 'Surprise me with a magical location!',
    emoji: '🎲'
  }
];