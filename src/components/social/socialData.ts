
// Sample social data for the habit tracker app
export const friends = [
  { id: 1, name: "Sarah Chen", avatar: "/placeholder.svg", status: "online", mutualHabits: 3 },
  { id: 2, name: "Mike Johnson", avatar: "/placeholder.svg", status: "online", mutualHabits: 5 },
  { id: 3, name: "Alex Rivera", avatar: "/placeholder.svg", status: "away", mutualHabits: 2 },
  { id: 4, name: "Emma Davis", avatar: "/placeholder.svg", status: "offline", mutualHabits: 4 },
  { id: 5, name: "Chris Lee", avatar: "/placeholder.svg", status: "online", mutualHabits: 1 },
];

export const leaderboardData = [
  { 
    rank: 1, 
    name: "Sarah Chen", 
    avatar: "/placeholder.svg", 
    score: 2847, 
    percentage: 95,
    streak: 15,
    badges: ["🔥", "💪", "📚"]
  },
  { 
    rank: 2, 
    name: "Mike Johnson", 
    avatar: "/placeholder.svg", 
    score: 2593, 
    percentage: 91,
    streak: 12,
    badges: ["📚", "🧘‍♂️", "🏃‍♂️"]
  },
  { 
    rank: 3, 
    name: "You", 
    avatar: "/placeholder.svg", 
    score: 2441, 
    percentage: 86,
    streak: 8,
    badges: ["💪", "🎯"]
  },
  { 
    rank: 4, 
    name: "Alex Rivera", 
    avatar: "/placeholder.svg", 
    score: 2205, 
    percentage: 78,
    streak: 6,
    badges: ["✨", "🧘‍♂️"]
  },
  { 
    rank: 5, 
    name: "Emma Davis", 
    avatar: "/placeholder.svg", 
    score: 1998, 
    percentage: 70,
    streak: 10,
    badges: ["🏃‍♀️", "💧"]
  },
];

export const feedPosts = [
  {
    id: 1,
    user: "Emma Davis",
    avatar: "/placeholder.svg",
    content: "just hit a 30-day meditation streak! 🧘‍♀️",
    timeAgo: "3 hours ago",
    reactions: ["🎉", "✨", "👏"],
    comments: 7,
    caption: "This practice has transformed my mornings. Feeling more centered than ever!",
  },
  {
    id: 2,
    user: "Chris Lee",
    avatar: "/placeholder.svg",
    content: "completed first 5K run! 🏃‍♂️",
    timeAgo: "5 hours ago",
    reactions: ["🔥", "🏃‍♂️", "💪"],
    comments: 12,
    caption: "From couch to 5K in 8 weeks. Never thought I'd actually enjoy running!",
  },
  {
    id: 3,
    user: "Taylor Swift",
    avatar: "/placeholder.svg",
    content: "read 50 pages today - book club here I come! 📖",
    timeAgo: "8 hours ago",
    reactions: ["📚", "🤓", "❤️"],
    comments: 4,
    caption: "Getting lost in 'The Seven Husbands of Evelyn Hugo' - can't put it down!",
  },
  {
    id: 4,
    user: "Jordan Kim",
    avatar: "/placeholder.svg",
    content: "meal prepped for the entire week! 🥗",
    timeAgo: "1 day ago",
    reactions: ["🥗", "👨‍🍳", "💚"],
    comments: 9,
    caption: "Sunday meal prep session complete! Feeling prepared and excited for healthy choices all week.",
  }
];
