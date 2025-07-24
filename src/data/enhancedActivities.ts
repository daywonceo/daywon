export interface EnhancedActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  description: string;
  detailedInstructions: string[];
  duration: {
    min: number;
    max: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  materials: string[];
  optionalMaterials?: string[];
  benefits: string[];
  prerequisites?: string[];
  tags: string[];
  estimatedCost: 'free' | 'low' | 'medium' | 'high';
  location: 'indoor' | 'outdoor' | 'both';
  socialAspect: 'solo' | 'group' | 'both';
  skillsLearned: string[];
  nextActivities?: string[]; // IDs of follow-up activities
  externalResources?: {
    type: 'youtube' | 'article' | 'pdf' | 'website';
    url: string;
    title: string;
  }[];
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  weatherDependent?: boolean;
  energyLevel: 'low' | 'medium' | 'high';
  mood: 'creative' | 'analytical' | 'physical' | 'social' | 'reflective' | 'adventurous';
}

export type ActivityCategory = 
  | 'creative'
  | 'learning'
  | 'physical'
  | 'social'
  | 'professional'
  | 'mindfulness'
  | 'technology'
  | 'culinary'
  | 'crafts'
  | 'music'
  | 'writing'
  | 'outdoor';

export interface ActivitySeries {
  id: string;
  title: string;
  description: string;
  duration: string;
  activityIds: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: ActivityCategory;
  completionReward: string;
}

export interface UserActivityPreferences {
  preferredCategories: ActivityCategory[];
  availableTime: 'quick' | 'medium' | 'long' | 'flexible';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  preferredLocation: 'indoor' | 'outdoor' | 'both';
  preferredSocialAspect: 'solo' | 'group' | 'both';
  budget: 'free' | 'low' | 'medium' | 'high';
  currentMood?: 'creative' | 'analytical' | 'physical' | 'social' | 'reflective' | 'adventurous';
  skipCompleted: boolean;
  favoriteActivities: string[];
  completedActivities: string[];
  inProgressActivities: string[];
}

export const ENHANCED_ACTIVITIES: EnhancedActivity[] = [
  {
    id: 'urban-sketching',
    title: 'Urban Sketching Adventure',
    category: 'creative',
    description: 'Explore your city while creating detailed sketches of buildings, people, and street scenes.',
    detailedInstructions: [
      'Gather your sketching supplies: sketchbook, pencils (2H, HB, 2B), eraser, and blending stump',
      'Choose an interesting location: busy street corner, park, café, or architectural landmark',
      'Find a comfortable spot where you can observe without blocking foot traffic',
      'Start with basic shapes to capture the overall composition',
      'Add details gradually, focusing on what catches your eye most',
      'Include people and movement to bring life to your sketch',
      'Take photos for reference but rely primarily on direct observation',
      'Spend 20-45 minutes on each sketch, depending on complexity',
      'Sign and date your work, note the location and time'
    ],
    duration: { min: 1, max: 3, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Sketchbook', 'Pencils (variety of hardness)', 'Eraser', 'Portable stool (optional)'],
    optionalMaterials: ['Blending stump', 'Colored pencils', 'Watercolor set', 'Fixative spray'],
    benefits: [
      'Improves observational skills',
      'Develops artistic confidence',
      'Encourages exploration of your environment',
      'Creates lasting memories of places visited',
      'Builds patience and focus'
    ],
    tags: ['art', 'exploration', 'mindfulness', 'documentation'],
    estimatedCost: 'low',
    location: 'outdoor',
    socialAspect: 'solo',
    skillsLearned: ['Drawing techniques', 'Perspective', 'Composition', 'Observation skills'],
    nextActivities: ['watercolor-painting', 'photography-walk', 'architectural-study'],
    externalResources: [
      {
        type: 'youtube',
        url: 'https://youtube.com/watch?v=urban-sketching-basics',
        title: 'Urban Sketching for Beginners'
      }
    ],
    season: 'any',
    weatherDependent: true,
    energyLevel: 'medium',
    mood: 'creative'
  },
  {
    id: 'coding-personal-project',
    title: 'Build a Personal Coding Project',
    category: 'technology',
    description: 'Create a small but meaningful coding project that solves a problem in your daily life.',
    detailedInstructions: [
      'Identify a small problem or task you encounter regularly',
      'Choose a programming language and framework you want to learn or practice',
      'Break down the project into small, manageable features',
      'Set up your development environment and version control',
      'Start with the minimum viable version - the simplest solution that works',
      'Test your solution thoroughly with real-world use cases',
      'Add improvements and additional features iteratively',
      'Document your code and create a README file',
      'Deploy your project or share it with others for feedback',
      'Reflect on what you learned and plan next improvements'
    ],
    duration: { min: 2, max: 7, unit: 'days' },
    difficulty: 'intermediate',
    materials: ['Computer', 'Text editor or IDE', 'Internet connection'],
    optionalMaterials: ['Online course subscription', 'Development books', 'Cloud hosting service'],
    benefits: [
      'Develops programming skills',
      'Solves real-world problems',
      'Builds portfolio',
      'Improves problem-solving abilities',
      'Enhances logical thinking'
    ],
    tags: ['programming', 'creativity', 'problem-solving', 'skill-building'],
    estimatedCost: 'free',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Programming', 'Project planning', 'Version control', 'Testing', 'Documentation'],
    nextActivities: ['open-source-contribution', 'tech-blog-writing', 'code-review-practice'],
    externalResources: [
      {
        type: 'website',
        url: 'https://github.com',
        title: 'GitHub - Version Control and Project Hosting'
      }
    ],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'high',
    mood: 'analytical'
  },
  {
    id: 'community-garden-volunteering',
    title: 'Community Garden Volunteering',
    category: 'social',
    description: 'Join a local community garden to help grow food while meeting neighbors and learning about sustainable gardening.',
    detailedInstructions: [
      'Research community gardens in your area using online directories or local Facebook groups',
      'Contact the garden coordinator to ask about volunteer opportunities',
      'Attend an orientation session to learn garden rules and safety protocols',
      'Start with simple tasks like weeding, watering, or harvesting',
      'Learn from experienced gardeners about plant care and sustainable practices',
      'Participate in community workdays and social events',
      'Consider adopting your own plot if available and you enjoy the experience',
      'Document your learning journey and share knowledge with other volunteers',
      'Help with educational programs or workshops if the garden offers them'
    ],
    duration: { min: 2, max: 4, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Work gloves', 'Water bottle', 'Sun hat', 'Comfortable clothes'],
    optionalMaterials: ['Garden tools (if not provided)', 'Sunscreen', 'Kneepads', 'Garden journal'],
    benefits: [
      'Builds community connections',
      'Learns sustainable living practices',
      'Gets physical exercise',
      'Reduces stress through nature exposure',
      'Contributes to local food security'
    ],
    tags: ['volunteering', 'gardening', 'community', 'environment', 'learning'],
    estimatedCost: 'free',
    location: 'outdoor',
    socialAspect: 'group',
    skillsLearned: ['Gardening', 'Teamwork', 'Sustainable practices', 'Community organizing'],
    nextActivities: ['home-herb-garden', 'composting-setup', 'seed-saving-workshop'],
    season: 'any',
    weatherDependent: true,
    energyLevel: 'medium',
    mood: 'social'
  },
  {
    id: 'meditation-nature-sit',
    title: 'Silent Nature Meditation',
    category: 'mindfulness',
    description: 'Practice deep meditation in a natural setting to connect with both inner peace and the natural world.',
    detailedInstructions: [
      'Find a quiet natural location: park, forest, beach, or even a large tree in your yard',
      'Choose a time when the location is likely to be peaceful (early morning or evening)',
      'Bring a small cushion or blanket to sit comfortably',
      'Turn off all electronic devices or leave them behind',
      'Begin with 5 minutes of deep breathing to settle into the space',
      'Focus your attention on natural sounds: birds, wind, water, insects',
      'When thoughts arise, gently return attention to the present moment',
      'Notice how your body feels in contact with the natural environment',
      'Gradually extend your sitting time as comfort and focus improve',
      'End with a moment of gratitude for the natural space and your practice'
    ],
    duration: { min: 20, max: 60, unit: 'minutes' },
    difficulty: 'beginner',
    materials: ['Meditation cushion or blanket'],
    optionalMaterials: ['Journal for post-meditation reflections', 'Small timer (if needed)'],
    benefits: [
      'Reduces stress and anxiety',
      'Improves focus and concentration',
      'Deepens connection with nature',
      'Develops mindfulness skills',
      'Promotes emotional regulation'
    ],
    tags: ['meditation', 'nature', 'mindfulness', 'stress-relief', 'spiritual'],
    estimatedCost: 'free',
    location: 'outdoor',
    socialAspect: 'solo',
    skillsLearned: ['Meditation techniques', 'Mindfulness', 'Nature awareness', 'Stress management'],
    nextActivities: ['walking-meditation', 'nature-journaling', 'mindful-photography'],
    season: 'any',
    weatherDependent: true,
    energyLevel: 'low',
    mood: 'reflective'
  },
  {
    id: 'historical-neighborhood-research',
    title: 'Neighborhood History Detective',
    category: 'learning',
    description: 'Investigate and document the fascinating history of your local neighborhood through research and exploration.',
    detailedInstructions: [
      'Start with online research: local historical societies, city archives, old maps',
      'Visit your local library to access historical newspapers and records',
      'Take a walking tour of your neighborhood, noting architectural styles and old buildings',
      'Interview long-time residents about changes they\'ve witnessed',
      'Research the origins of street names and their historical significance',
      'Look up old property records and census data for specific addresses',
      'Collect old photographs from local archives or historical societies',
      'Create a timeline of major developments and changes in the area',
      'Document your findings in a digital presentation or physical scrapbook',
      'Share your research with neighbors or local historical groups'
    ],
    duration: { min: 3, max: 14, unit: 'days' },
    difficulty: 'intermediate',
    materials: ['Notebook', 'Camera or smartphone', 'Library card'],
    optionalMaterials: ['Voice recorder for interviews', 'Genealogy website subscription', 'Local maps'],
    benefits: [
      'Develops research skills',
      'Strengthens community connection',
      'Learns local history',
      'Improves analytical thinking',
      'Creates valuable community resource'
    ],
    tags: ['history', 'research', 'community', 'exploration', 'documentation'],
    estimatedCost: 'free',
    location: 'both',
    socialAspect: 'both',
    skillsLearned: ['Research methods', 'Interview techniques', 'Historical analysis', 'Documentation'],
    nextActivities: ['local-architecture-study', 'oral-history-project', 'community-presentation'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'medium',
    mood: 'analytical'
  }
];

export const ACTIVITY_SERIES: ActivitySeries[] = [
  {
    id: 'creative-foundations',
    title: '7-Day Creative Foundations',
    description: 'Build fundamental creative skills through diverse artistic exercises',
    duration: '7 days',
    activityIds: ['urban-sketching', 'creative-writing-prompt', 'photo-composition', 'music-improvisation'],
    difficulty: 'beginner',
    category: 'creative',
    completionReward: 'Creative Foundations Certificate'
  },
  {
    id: 'community-connection',
    title: '30-Day Community Builder',
    description: 'Strengthen local connections through volunteering and community engagement',
    duration: '30 days',
    activityIds: ['community-garden-volunteering', 'neighborhood-cleanup', 'local-business-support'],
    difficulty: 'intermediate',
    category: 'social',
    completionReward: 'Community Champion Badge'
  }
];