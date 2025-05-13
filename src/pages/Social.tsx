import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle, ThumbsUp, MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const Social = () => {
  const friends = [
    { id: 1, name: "NATE RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 2, name: "DREW RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 3, name: "JOSH RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 4, name: "ANDY RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 5, name: "PAULA RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 6, name: "PAIGE RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 7, name: "LIONEL MESSI", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 8, name: "STEVIE WONDER", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 9, name: "CLAIRO", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 10, name: "CHRISTIAN PULISIC", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" }
  ];

  const leaderboardData = [
    { rank: 1, name: "NATE RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 91, percentage: 91 },
    { rank: 2, name: "DREW RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 87, percentage: 87 },
    { rank: 3, name: "JOSH RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 84, percentage: 84 },
    { rank: 4, name: "ANDY RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 82, percentage: 82 },
    { rank: 5, name: "PAULA RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 80, percentage: 80 },
    { rank: 6, name: "PAIGE RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 79, percentage: 79 },
    { rank: 7, name: "LIONEL MESSI", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 75, percentage: 75 },
    { rank: 8, name: "STEVIE WONDER", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 74, percentage: 74 },
    { rank: 9, name: "CLAIRO", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 71, percentage: 71 },
    { rank: 10, name: "CHRISTIAN PULISIC", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", score: 70, percentage: 70 }
  ];

  const feedPosts = [
    {
      id: 1,
      user: "NATE",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "READ 7 DAYS IN A ROW!",
      timeAgo: "45 MINS AGO",
      reactions: ["✅", "❗"],
      comments: 0
    },
    {
      id: 2,
      user: "DREW",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "JUST REACHED TOP 3 IN HIS LEADERBOARD!",
      timeAgo: "1 HOUR AGO",
      reactions: ["🔥", "🤩", "❗"],
      comments: 6
    },
    {
      id: 3,
      user: "JOSH",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "SHARED HIS DAILY RECAP!",
      caption: "'I DROVE BACK TO VT'",
      timeAgo: "3 HOURS AGO",
      reactions: [],
      comments: 4
    },
    {
      id: 4,
      user: "ANDY",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "JUST HIT A PR AT THE GYM!",
      timeAgo: "8 HOURS AGO",
      reactions: ["🔥", "✅", "😀"],
      comments: 2
    },
    {
      id: 5,
      user: "PAULA",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "HAS A NEW LONGEST STREAK FOR DEVOTIONAL!",
      timeAgo: "12 HOURS AGO",
      reactions: ["🙏", "😊", "✅"],
      comments: 4
    },
    {
      id: 6,
      user: "PAIGE",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "STARTED TRACKING A NEW HABIT:MEDITATION!",
      timeAgo: "18 HOURS AGO",
      reactions: ["✅", "❗"],
      comments: 2
    },
    {
      id: 7,
      user: "NATE",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "TRACKED HIS FIRST PERFECT WEEK!",
      timeAgo: "18 HOURS AGO",
      reactions: ["✅", "🔥", "❗"],
      comments: 4
    },
    {
      id: 8,
      user: "ANDY",
      avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      content: "JUST TRACKED HIS 10TH HABIT!",
      timeAgo: "22 HOURS AGO",
      reactions: ["✅", "😀", "❗"],
      comments: 2
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-4 text-center mb-6">
          <h1 className="text-2xl font-bold">DAYONE</h1>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="main">MAIN FEED</TabsTrigger>
            <TabsTrigger value="leaderboard">LEADERBOARD</TabsTrigger>
            <TabsTrigger value="friends">FRIENDS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main">
            <div className="space-y-4">
              {feedPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-start mb-2">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={post.avatar} alt={post.user} />
                      <AvatarFallback>{post.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{post.user} {post.content}</h3>
                          {post.caption && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{post.caption}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{post.timeAgo}</span>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <div className="flex space-x-1 mr-4">
                          {post.reactions.map((reaction, index) => (
                            <span key={index} className="text-lg">{reaction}</span>
                          ))}
                        </div>
                        {post.comments > 0 && (
                          <span className="text-sm text-gray-500">{post.comments} COMMENTS</span>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <ThumbsUp size={16} className="mr-1" /> Like
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <MessageSquare size={16} className="mr-1" /> Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center py-4">
                <Button variant="ghost" className="text-green-700 hover:text-green-800">
                  SEE MORE
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <div className="space-y-4">
              <div className="flex justify-end items-center mb-4 pr-8">
                <h2 className="font-bold text-lg">HABIT SCORE</h2>
              </div>
              
              <div className="space-y-6">
                {leaderboardData.map((item) => (
                  <div key={item.rank} className="flex items-center">
                    <div className="font-bold text-xl w-8 mr-3">{item.rank}</div>
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-3">
                      <p className="font-bold text-lg w-32">{item.name}</p>
                      <Progress value={item.percentage} className="h-2 bg-gray-200 flex-1" indicatorColor="bg-green-500" />
                      <div className="font-bold text-xl w-8 text-right">{item.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="mb-4 flex items-center justify-between">
              <Input 
                placeholder="SEARCH FRIENDS" 
                className="max-w-[65%] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              <Button className="bg-green-700 hover:bg-green-800">
                <UserPlus className="mr-1" size={18} /> +ADD
              </Button>
            </div>
            
            <div className="space-y-4 mt-6">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-lg">{friend.name}</span>
                  </div>
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-2">
                    <MessageCircle size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Social;
