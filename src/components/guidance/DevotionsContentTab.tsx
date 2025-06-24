
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DevotionModal from "./DevotionModal";

const DevotionsContentTab = () => {
  const [selectedDevotion, setSelectedDevotion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const devotions = [
    {
      id: 1,
      title: "Walking in Grace",
      author: "Daily Devotional",
      excerpt: "Grace isn't just God's gift of salvation; it's His daily empowerment for living...",
      verse: "Ephesians 2:8-9",
      category: "Grace",
      fullContent: `Grace isn't just God's gift of salvation; it's His daily empowerment for living.

Every morning we wake up to new mercies, fresh opportunities to experience God's unmerited favor. The apostle Paul reminds us in Ephesians that we are saved by grace through faith, and this salvation is not our own doing—it is the gift of God.

But grace doesn't end at salvation. It continues to flow into every aspect of our lives. When we fail, grace picks us up. When we're weak, grace gives us strength. When we're overwhelmed, grace provides peace that surpasses understanding.

Consider how you can extend this same grace to others today. Just as God has been patient with you, be patient with those around you. Let the grace you've received overflow into your relationships, your work, and your daily interactions.`
    },
    {
      id: 2,
      title: "Finding Peace in the Storm",
      author: "Max Lucado",
      excerpt: "When life's storms rage around us, we can find our anchor in Christ's unchanging love...",
      verse: "Psalm 46:10",
      category: "Peace",
      fullContent: `When life's storms rage around us, we can find our anchor in Christ's unchanging love.

The disciples experienced this firsthand when Jesus calmed the storm on the Sea of Galilee. In that moment, they learned that the same voice that speaks peace to the waves can speak peace to their hearts.

"Be still, and know that I am God" - these words from Psalm 46:10 remind us that in the midst of life's chaos, we can find rest in God's sovereignty. He is not surprised by our circumstances, nor is He overwhelmed by our problems.

Today, whatever storm you're facing, remember that Christ is in your boat. He may not immediately calm the external storm, but He can certainly calm the storm within your heart. Trust in His perfect timing and His perfect love.`
    },
    {
      id: 3,
      title: "The Power of Prayer",
      author: "Charles Spurgeon",
      excerpt: "Prayer is not overcoming God's reluctance, but laying hold of His willingness...",
      verse: "1 Thessalonians 5:17",
      category: "Prayer",
      fullContent: `Prayer is not overcoming God's reluctance, but laying hold of His willingness.

Too often we approach prayer as if we need to convince God to care about our needs. But the truth is, God already knows what we need before we ask. He delights in our prayers not because He needs information, but because He desires relationship.

When Paul instructs us to "pray without ceasing," he's not suggesting we walk around with our eyes closed, muttering words all day. Rather, he's calling us to maintain a constant awareness of God's presence, to live in ongoing conversation with our heavenly Father.

Prayer changes things, but more importantly, prayer changes us. As we spend time in God's presence, our hearts align with His. Our desires begin to mirror His desires. Our will becomes submitted to His perfect will.

Make prayer a priority today. Don't wait for a crisis to drive you to your knees—cultivate a lifestyle of constant communion with God.`
    }
  ];

  const handleDevotionClick = (devotion: any) => {
    setSelectedDevotion(devotion);
    setIsModalOpen(true);
  };

  const handleSaveDevotion = () => {
    // TODO: Implement save devotion functionality with Supabase
    toast({
      title: "Devotion saved",
      description: "This devotion has been added to your saved collection.",
    });
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Daily Devotions
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Thoughtful reflections to deepen your faith journey
        </p>
      </div>

      {devotions.map((devotion) => (
        <Card 
          key={devotion.id} 
          className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleDevotionClick(devotion)}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1 text-sm sm:text-base">
                  {devotion.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                  by {devotion.author}
                </p>
                <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  {devotion.category}
                </span>
              </div>
              <Heart 
                className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveDevotion();
                }}
              />
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {devotion.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                Key Verse: {devotion.verse}
              </div>
              <div className="text-xs text-gray-400">
                Tap to read full devotion
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedDevotion && (
        <DevotionModal
          devotion={selectedDevotion}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDevotion}
        />
      )}
    </div>
  );
};

export default DevotionsContentTab;
