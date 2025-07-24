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
  },
  {
    id: 'sourdough-bread-making',
    title: 'Artisan Sourdough Journey',
    category: 'culinary',
    description: 'Master the ancient art of sourdough bread making, from creating your starter to baking perfect loaves.',
    detailedInstructions: [
      'Create a sourdough starter by mixing flour and water, feeding daily for 7-10 days',
      'Learn to recognize when your starter is active and ready to use',
      'Mix your first dough using starter, flour, water, and salt',
      'Practice proper kneading and folding techniques',
      'Understand fermentation timing and how temperature affects the process',
      'Shape your dough and prepare for the final rise',
      'Score the dough artistically before baking',
      'Bake in a Dutch oven or on a stone for optimal crust',
      'Document your process and adjust recipe based on results',
      'Experiment with different flours and hydration levels'
    ],
    duration: { min: 7, max: 21, unit: 'days' },
    difficulty: 'intermediate',
    materials: ['Flour', 'Water', 'Salt', 'Kitchen scale', 'Large bowl', 'Dutch oven'],
    optionalMaterials: ['Bread lame', 'Proofing basket', 'Kitchen thermometer', 'Bench scraper'],
    benefits: [
      'Develops patience and timing skills',
      'Creates nutritious homemade bread',
      'Connects with traditional food culture',
      'Improves understanding of fermentation',
      'Provides meditative baking practice'
    ],
    tags: ['baking', 'fermentation', 'traditional-skills', 'patience', 'nutrition'],
    estimatedCost: 'low',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Bread making', 'Fermentation science', 'Timing', 'Temperature control'],
    nextActivities: ['pizza-dough-mastery', 'cheese-making', 'fermented-vegetables'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'medium',
    mood: 'creative'
  },
  {
    id: 'language-immersion-day',
    title: 'Complete Language Immersion Day',
    category: 'learning',
    description: 'Spend an entire day immersed in a foreign language through media, conversation, and cultural exploration.',
    detailedInstructions: [
      'Choose a target language you want to learn or improve',
      'Set all your devices to display in that language',
      'Start the day with foreign language news and podcasts during breakfast',
      'Watch movies or series in the target language with subtitles',
      'Find online conversation partners or language exchange communities',
      'Cook a traditional dish from a country that speaks the language',
      'Read articles, books, or social media content in the language',
      'Join virtual cultural events or online classes',
      'Practice writing in the language through journaling or social posts',
      'End the day reflecting on new words and phrases learned'
    ],
    duration: { min: 8, max: 12, unit: 'hours' },
    difficulty: 'intermediate',
    materials: ['Computer/smartphone', 'Language learning app', 'Notebook'],
    optionalMaterials: ['Translation dictionary', 'Language textbook', 'Cultural cuisine ingredients'],
    benefits: [
      'Accelerates language learning',
      'Improves cultural understanding',
      'Builds confidence in foreign language use',
      'Develops listening and comprehension skills',
      'Creates immersive learning experience'
    ],
    tags: ['language-learning', 'culture', 'immersion', 'communication', 'global-awareness'],
    estimatedCost: 'free',
    location: 'indoor',
    socialAspect: 'both',
    skillsLearned: ['Foreign language', 'Cultural awareness', 'Communication', 'Global perspective'],
    nextActivities: ['cultural-cooking-class', 'virtual-cultural-tour', 'language-buddy-pairing'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'high',
    mood: 'analytical'
  },
  {
    id: 'miniature-terrarium-ecosystem',
    title: 'Create a Living Terrarium Ecosystem',
    category: 'crafts',
    description: 'Build a self-sustaining miniature world in glass, learning about ecosystems and plant care.',
    detailedInstructions: [
      'Choose an appropriate glass container with a wide opening',
      'Layer drainage materials: gravel, activated charcoal, moss',
      'Add quality potting soil appropriate for your chosen plants',
      'Select small plants that thrive in humid conditions (ferns, moss, small succulents)',
      'Design the landscape with varying heights and visual interest',
      'Add decorative elements like small stones, driftwood, or figurines',
      'Mist lightly and seal if creating a closed terrarium',
      'Place in bright, indirect light and monitor moisture levels',
      'Document growth and changes over time',
      'Learn to maintain the balance of the ecosystem'
    ],
    duration: { min: 2, max: 4, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Glass container', 'Small plants', 'Potting soil', 'Gravel', 'Activated charcoal'],
    optionalMaterials: ['Decorative moss', 'Small figurines', 'Tweezers', 'Spray bottle'],
    benefits: [
      'Learns about ecosystems and plant biology',
      'Creates beautiful living decoration',
      'Develops responsibility through plant care',
      'Provides stress relief and connection to nature',
      'Teaches sustainable design principles'
    ],
    tags: ['plants', 'ecosystem', 'design', 'nature', 'responsibility'],
    estimatedCost: 'low',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Plant care', 'Ecosystem design', 'Horticulture', 'Sustainable practices'],
    nextActivities: ['herb-garden-creation', 'air-plant-collection', 'botanical-photography'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'low',
    mood: 'creative'
  },
  {
    id: 'podcast-creation',
    title: 'Create and Launch Your First Podcast',
    category: 'technology',
    description: 'Develop, record, and publish a podcast episode on a topic you\'re passionate about.',
    detailedInstructions: [
      'Choose a specific niche or topic you\'re knowledgeable and passionate about',
      'Research your target audience and existing podcasts in the space',
      'Plan your first episode: outline, key points, and call-to-action',
      'Set up basic recording equipment: microphone, quiet space, recording software',
      'Record your pilot episode, focusing on clear audio and engaging content',
      'Learn basic audio editing to remove awkward pauses and improve quality',
      'Create simple cover art and write compelling episode descriptions',
      'Choose a podcast hosting platform and upload your content',
      'Submit to major podcast directories like Apple Podcasts and Spotify',
      'Share with friends and gather feedback for future episodes'
    ],
    duration: { min: 3, max: 7, unit: 'days' },
    difficulty: 'intermediate',
    materials: ['Computer', 'Microphone', 'Audio editing software', 'Internet connection'],
    optionalMaterials: ['Professional microphone', 'Audio interface', 'Headphones', 'Design software'],
    benefits: [
      'Develops communication and presentation skills',
      'Builds personal brand and authority',
      'Creates platform for sharing knowledge',
      'Learns technical skills in audio production',
      'Connects with like-minded community'
    ],
    tags: ['media-creation', 'communication', 'technology', 'storytelling', 'community'],
    estimatedCost: 'low',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Audio production', 'Content creation', 'Marketing', 'Public speaking'],
    nextActivities: ['youtube-channel-launch', 'blog-writing', 'public-speaking-practice'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'high',
    mood: 'creative'
  },
  {
    id: 'sunrise-photography-expedition',
    title: 'Golden Hour Photography Adventure',
    category: 'creative',
    description: 'Wake up early to capture the magical light of sunrise while exploring photography techniques.',
    detailedInstructions: [
      'Research sunrise times and scout locations the day before',
      'Wake up 90 minutes before sunrise to reach your location with time to set up',
      'Bring a tripod for sharp images in low light conditions',
      'Start with silhouette shots as the sky begins to lighten',
      'Experiment with different compositions: wide landscapes, close-up details, reflections',
      'Capture the changing light and colors as the sun rises',
      'Try both automatic and manual camera settings',
      'Include foreground elements to add depth and interest',
      'Stay for 30 minutes after sunrise for continued golden light',
      'Review and edit your best shots, noting what techniques worked'
    ],
    duration: { min: 3, max: 4, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Camera or smartphone', 'Tripod', 'Extra batteries', 'Memory cards'],
    optionalMaterials: ['Polarizing filter', 'Neutral density filters', 'Remote shutter release'],
    benefits: [
      'Develops photography skills and artistic eye',
      'Encourages early rising and connection with nature',
      'Provides peaceful, meditative experience',
      'Creates beautiful images to share and keep',
      'Builds discipline and commitment'
    ],
    tags: ['photography', 'nature', 'early-rising', 'meditation', 'art'],
    estimatedCost: 'free',
    location: 'outdoor',
    socialAspect: 'solo',
    skillsLearned: ['Photography techniques', 'Light understanding', 'Composition', 'Post-processing'],
    nextActivities: ['sunset-photography', 'night-sky-photography', 'street-photography'],
    season: 'any',
    weatherDependent: true,
    energyLevel: 'medium',
    mood: 'creative'
  },
  {
    id: 'home-feng-shui-redesign',
    title: 'Feng Shui Living Space Transformation',
    category: 'mindfulness',
    description: 'Apply feng shui principles to reorganize and harmonize your living space for better energy flow.',
    detailedInstructions: [
      'Learn basic feng shui principles: bagua map, five elements, energy flow',
      'Map your space according to the bagua to identify different life areas',
      'Declutter thoroughly, removing items that don\'t serve you',
      'Rearrange furniture to allow for smooth energy (chi) flow',
      'Add elements representing the five elements: wood, fire, earth, metal, water',
      'Position your bed, desk, and main seating to face the door when possible',
      'Incorporate plants and natural elements to bring life energy',
      'Use mirrors strategically to expand space and redirect energy',
      'Add meaningful objects and artwork that inspire positive feelings',
      'Document the changes and notice how the space feels over the following weeks'
    ],
    duration: { min: 1, max: 3, unit: 'days' },
    difficulty: 'beginner',
    materials: ['Measuring tape', 'Compass or phone compass app', 'Cleaning supplies'],
    optionalMaterials: ['Feng shui book or guide', 'New plants', 'Candles', 'Crystals', 'Mirrors'],
    benefits: [
      'Creates more harmonious living environment',
      'Encourages mindful relationship with space',
      'Promotes better sleep and productivity',
      'Reduces stress through organized environment',
      'Connects with ancient wisdom traditions'
    ],
    tags: ['interior-design', 'mindfulness', 'organization', 'energy', 'ancient-wisdom'],
    estimatedCost: 'low',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Feng shui principles', 'Interior design', 'Space planning', 'Energy awareness'],
    nextActivities: ['minimalist-decluttering', 'plant-care-routine', 'meditation-space-creation'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'medium',
    mood: 'reflective'
  },
  {
    id: 'wild-edibles-foraging',
    title: 'Safe Wild Edibles Foraging Workshop',
    category: 'outdoor',
    description: 'Learn to identify and safely harvest wild edible plants in your local environment.',
    detailedInstructions: [
      'Research local foraging laws and regulations in your area',
      'Study field guides for edible plants native to your region',
      'Start with easily identifiable plants like dandelions, plantain, or wild garlic',
      'Join a local foraging group or take a guided walk with an expert',
      'Learn to distinguish edible plants from toxic look-alikes',
      'Practice the "rule of 100%" - only harvest what you\'re 100% certain about',
      'Harvest sustainably, taking only what you need and leaving plants to regenerate',
      'Clean and prepare your foraged foods properly',
      'Try simple recipes incorporating your wild finds',
      'Document your discoveries with photos and notes for future reference'
    ],
    duration: { min: 3, max: 6, unit: 'hours' },
    difficulty: 'intermediate',
    materials: ['Field guide to local edible plants', 'Basket or collection bag', 'Sharp knife'],
    optionalMaterials: ['Magnifying glass', 'Camera', 'Notebook', 'GPS device'],
    benefits: [
      'Develops deep connection with local ecosystem',
      'Learns valuable survival and self-sufficiency skills',
      'Provides free, nutrient-dense wild foods',
      'Encourages exploration of natural areas',
      'Builds confidence in outdoor skills'
    ],
    tags: ['foraging', 'survival-skills', 'nature-connection', 'self-sufficiency', 'outdoor-education'],
    estimatedCost: 'low',
    location: 'outdoor',
    socialAspect: 'both',
    skillsLearned: ['Plant identification', 'Foraging safety', 'Sustainable harvesting', 'Wild food preparation'],
    nextActivities: ['mushroom-identification', 'herb-drying-preservation', 'wild-cooking-techniques'],
    season: 'spring',
    weatherDependent: true,
    energyLevel: 'medium',
    mood: 'adventurous',
    prerequisites: ['Basic plant identification knowledge', 'Local foraging regulations research']
  },
  {
    id: 'handwritten-letter-campaign',
    title: 'Thoughtful Handwritten Letter Project',
    category: 'social',
    description: 'Reconnect with people through the lost art of handwritten letters, spreading joy and strengthening relationships.',
    detailedInstructions: [
      'Make a list of people you\'d like to reconnect with or show appreciation to',
      'Choose quality stationery and a comfortable writing pen',
      'Write a heartfelt, personal letter to each person on your list',
      'Share specific memories, express gratitude, or ask thoughtful questions',
      'Include small touches like drawings, pressed flowers, or photos',
      'Take time to craft each letter thoughtfully, without rushing',
      'Address envelopes by hand and choose interesting stamps',
      'Mail letters over several weeks to spread out the joy',
      'Keep a record of who you wrote to and when',
      'Enjoy any responses you receive and consider making this a regular practice'
    ],
    duration: { min: 2, max: 4, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Quality paper or stationery', 'Comfortable pen', 'Envelopes', 'Stamps'],
    optionalMaterials: ['Wax seal', 'Decorative stickers', 'Pressed flowers', 'Colored pens'],
    benefits: [
      'Strengthens personal relationships',
      'Practices mindful, intentional communication',
      'Brings joy to both sender and recipient',
      'Develops patience and thoughtfulness',
      'Creates lasting physical mementos'
    ],
    tags: ['relationships', 'communication', 'mindfulness', 'gratitude', 'traditional-skills'],
    estimatedCost: 'low',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Thoughtful communication', 'Handwriting', 'Letter composition', 'Relationship building'],
    nextActivities: ['gratitude-journal-practice', 'calligraphy-learning', 'memoir-writing'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'low',
    mood: 'reflective'
  },
  {
    id: 'diy-natural-cosmetics',
    title: 'Natural Beauty Products Workshop',
    category: 'crafts',
    description: 'Create your own natural, chemical-free beauty and skincare products using simple ingredients.',
    detailedInstructions: [
      'Research natural ingredients and their benefits for different skin types',
      'Start with simple recipes: lip balm, face mask, body scrub',
      'Source high-quality, organic ingredients from health stores or online',
      'Sterilize all equipment and containers before beginning',
      'Follow recipes carefully, measuring ingredients precisely',
      'Learn about preservatives and shelf life for different products',
      'Test products on a small skin area before full use',
      'Create attractive labels for your homemade products',
      'Gift some products to friends and family',
      'Document what works well and adjust recipes based on results'
    ],
    duration: { min: 2, max: 4, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Base oils', 'Essential oils', 'Beeswax', 'Natural ingredients', 'Small containers'],
    optionalMaterials: ['Digital scale', 'Double boiler', 'Labels', 'Vitamin E oil', 'Natural preservatives'],
    benefits: [
      'Controls ingredients in personal care products',
      'Saves money on expensive beauty products',
      'Reduces chemical exposure',
      'Develops chemistry and formulating skills',
      'Creates personalized products for skin needs'
    ],
    tags: ['diy', 'natural-living', 'skincare', 'chemistry', 'self-care'],
    estimatedCost: 'medium',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Natural formulating', 'Chemistry basics', 'Skincare knowledge', 'Product safety'],
    nextActivities: ['herb-growing-for-cosmetics', 'soap-making', 'aromatherapy-blending'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'low',
    mood: 'creative'
  },
  {
    id: 'genealogy-deep-dive',
    title: 'Family History Research Project',
    category: 'learning',
    description: 'Trace your family roots and create a comprehensive family tree with stories and historical context.',
    detailedInstructions: [
      'Start by interviewing older family members about their memories and knowledge',
      'Gather all existing family documents: certificates, photos, letters, records',
      'Create accounts on genealogy websites and begin building your family tree',
      'Search through census records, immigration documents, and vital records',
      'Use DNA testing services to find genetic matches and break through brick walls',
      'Research historical context of where and when your ancestors lived',
      'Verify information through multiple sources and document your findings',
      'Organize your discoveries in a digital family tree or physical scrapbook',
      'Write brief biographies of interesting ancestors',
      'Share your findings with family members and consider publishing a family history'
    ],
    duration: { min: 7, max: 30, unit: 'days' },
    difficulty: 'intermediate',
    materials: ['Computer', 'Genealogy website subscription', 'Notebook', 'Scanner'],
    optionalMaterials: ['DNA test kit', 'Archive-quality storage materials', 'Family history software'],
    benefits: [
      'Connects with family heritage and identity',
      'Develops research and analytical skills',
      'Preserves family stories for future generations',
      'Uncovers fascinating historical connections',
      'Strengthens family bonds through shared discovery'
    ],
    tags: ['family', 'history', 'research', 'genealogy', 'heritage'],
    estimatedCost: 'medium',
    location: 'indoor',
    socialAspect: 'both',
    skillsLearned: ['Genealogy research', 'Historical analysis', 'Documentation', 'Interview techniques'],
    nextActivities: ['family-recipe-collection', 'heritage-trip-planning', 'oral-history-recording'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'medium',
    mood: 'analytical'
  },
  {
    id: 'permaculture-garden-design',
    title: 'Sustainable Permaculture Garden Planning',
    category: 'outdoor',
    description: 'Design a self-sustaining garden ecosystem using permaculture principles for maximum productivity and environmental benefit.',
    detailedInstructions: [
      'Study permaculture principles: observe and interact, catch and store energy, use renewable resources',
      'Analyze your space: sun patterns, water flow, soil quality, microclimates',
      'Design zones based on how frequently you\'ll need to access different areas',
      'Plan for water harvesting and efficient irrigation systems',
      'Choose plants that work together: nitrogen fixers, pest deterrents, companion plants',
      'Incorporate composting systems and nutrient cycling',
      'Design paths and access routes for easy maintenance',
      'Plan for season extension: cold frames, greenhouse, or protective structures',
      'Start with a small area and expand gradually as you learn',
      'Document the design process and track success over time'
    ],
    duration: { min: 3, max: 7, unit: 'days' },
    difficulty: 'advanced',
    materials: ['Graph paper', 'Measuring tape', 'Soil test kit', 'Permaculture reference books'],
    optionalMaterials: ['Design software', 'Level for checking slopes', 'pH meter', 'Consultation with permaculture expert'],
    benefits: [
      'Creates sustainable food production system',
      'Reduces environmental impact',
      'Develops systems thinking skills',
      'Provides long-term food security',
      'Connects with natural ecological principles'
    ],
    tags: ['permaculture', 'sustainability', 'gardening', 'ecology', 'food-security'],
    estimatedCost: 'high',
    location: 'outdoor',
    socialAspect: 'solo',
    skillsLearned: ['Permaculture design', 'Ecological thinking', 'Garden planning', 'Sustainable agriculture'],
    nextActivities: ['composting-system-setup', 'rainwater-harvesting', 'seed-saving-practice'],
    prerequisites: ['Basic gardening knowledge', 'Understanding of local climate'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'high',
    mood: 'analytical'
  },
  {
    id: 'storytelling-performance',
    title: 'Personal Storytelling Performance',
    category: 'creative',
    description: 'Craft and perform a compelling personal story, developing confidence in public speaking and narrative skills.',
    detailedInstructions: [
      'Choose a meaningful personal experience that taught you something important',
      'Structure your story with a clear beginning, middle, and end',
      'Identify the central message or lesson you want to convey',
      'Practice storytelling techniques: pacing, voice modulation, gestures',
      'Rehearse your story multiple times, timing it to 5-10 minutes',
      'Practice in front of a mirror, then with trusted friends or family',
      'Find a venue: open mic night, storytelling event, or community gathering',
      'Focus on connecting emotionally with your audience',
      'Use descriptive language to help listeners visualize scenes',
      'Record your performance to review and improve for future storytelling'
    ],
    duration: { min: 1, max: 3, unit: 'hours' },
    difficulty: 'intermediate',
    materials: ['Story outline', 'Timer for practice'],
    optionalMaterials: ['Voice recorder', 'Props or visual aids', 'Video camera'],
    benefits: [
      'Builds confidence in public speaking',
      'Develops narrative and communication skills',
      'Processes personal experiences meaningfully',
      'Connects with audiences through shared humanity',
      'Preserves important personal memories'
    ],
    tags: ['storytelling', 'public-speaking', 'performance', 'communication', 'personal-growth'],
    estimatedCost: 'free',
    location: 'both',
    socialAspect: 'group',
    skillsLearned: ['Public speaking', 'Narrative structure', 'Performance skills', 'Emotional expression'],
    nextActivities: ['creative-writing-workshop', 'improv-comedy-class', 'poetry-slam-participation'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'high',
    mood: 'creative'
  },
  {
    id: 'zero-waste-lifestyle-experiment',
    title: '30-Day Zero Waste Challenge',
    category: 'mindfulness',
    description: 'Experiment with zero-waste living practices to reduce environmental impact and develop mindful consumption habits.',
    detailedInstructions: [
      'Audit your current waste production for one week to establish a baseline',
      'Research zero-waste alternatives for your most commonly discarded items',
      'Invest in reusable items: water bottle, shopping bags, food containers',
      'Learn to make household products: cleaners, personal care items, snacks',
      'Practice refusing single-use items and bringing your own alternatives',
      'Compost organic waste or find community composting options',
      'Repair items instead of discarding them whenever possible',
      'Buy only what you need and choose package-free options when available',
      'Document your progress and challenges throughout the month',
      'Calculate your waste reduction and environmental impact at the end'
    ],
    duration: { min: 30, max: 30, unit: 'days' },
    difficulty: 'intermediate',
    materials: ['Reusable containers', 'Cloth shopping bags', 'Refillable water bottle'],
    optionalMaterials: ['Compost bin', 'Bulk store containers', 'Repair tools', 'Natural ingredient supplies'],
    benefits: [
      'Reduces environmental footprint significantly',
      'Saves money through mindful consumption',
      'Develops creativity in problem-solving',
      'Builds awareness of consumption patterns',
      'Creates more intentional lifestyle practices'
    ],
    tags: ['sustainability', 'environment', 'mindful-consumption', 'lifestyle-change', 'responsibility'],
    estimatedCost: 'medium',
    location: 'both',
    socialAspect: 'solo',
    skillsLearned: ['Sustainable living', 'DIY skills', 'Mindful consumption', 'Environmental awareness'],
    nextActivities: ['sustainable-fashion-challenge', 'urban-composting', 'eco-friendly-gift-making'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'medium',
    mood: 'reflective'
  },
  {
    id: 'classical-music-appreciation',
    title: 'Classical Music Discovery Journey',
    category: 'music',
    description: 'Develop an appreciation for classical music through guided listening and historical exploration.',
    detailedInstructions: [
      'Start with accessible composers: Mozart, Beethoven, Bach, Vivaldi',
      'Listen to famous pieces while reading about their historical context',
      'Learn about different musical periods: Baroque, Classical, Romantic, Modern',
      'Attend a live classical performance or watch high-quality recordings',
      'Study the instruments of the orchestra and how they work together',
      'Try active listening: follow themes, notice instrumentation changes',
      'Read about composers\' lives and the circumstances that inspired their works',
      'Compare different interpretations of the same piece by various conductors',
      'Keep a listening journal with your thoughts and emotional responses',
      'Share your discoveries with others and discuss your favorite pieces'
    ],
    duration: { min: 2, max: 4, unit: 'hours' },
    difficulty: 'beginner',
    materials: ['Music streaming service or classical music collection', 'Notebook'],
    optionalMaterials: ['Quality headphones', 'Books on classical music history', 'Concert tickets'],
    benefits: [
      'Develops sophisticated musical taste',
      'Improves focus and listening skills',
      'Connects with centuries of cultural heritage',
      'Provides stress relief and emotional enrichment',
      'Enhances cognitive function through complex listening'
    ],
    tags: ['music', 'culture', 'appreciation', 'history', 'cognitive-development'],
    estimatedCost: 'low',
    location: 'indoor',
    socialAspect: 'solo',
    skillsLearned: ['Music appreciation', 'Cultural history', 'Active listening', 'Musical analysis'],
    nextActivities: ['instrument-learning', 'opera-exploration', 'music-theory-study'],
    season: 'any',
    weatherDependent: false,
    energyLevel: 'low',
    mood: 'reflective'
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