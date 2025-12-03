import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Star, 
  CheckCircle, 
  Play, 
  Heart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Lightbulb,
  Package
} from 'lucide-react';
import { EnhancedActivity } from '@/data/enhancedActivities';
import { useActivityPreferences } from '@/hooks/useActivityPreferences';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedActivityCardProps {
  activity: EnhancedActivity;
  showFullDetails?: boolean;
  onStartActivity?: (activityId: string) => void;
  hideTags?: boolean;
}

const EnhancedActivityCard: React.FC<EnhancedActivityCardProps> = ({
  activity,
  showFullDetails = false,
  onStartActivity,
  hideTags = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showFullDetails);
  const { preferences, addFavorite, removeFavorite, markInProgress, markCompleted } = useActivityPreferences();
  const { toast } = useToast();

  const isFavorited = preferences.favoriteActivities.includes(activity.id);
  const isCompleted = preferences.completedActivities.includes(activity.id);
  const inProgress = preferences.inProgressActivities.includes(activity.id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      removeFavorite(activity.id);
      toast({ title: "Removed from favorites" });
    } else {
      addFavorite(activity.id);
      toast({ title: "Added to favorites" });
    }
  };

  const handleStartActivity = () => {
    markInProgress(activity.id);
    onStartActivity?.(activity.id);
    toast({ title: "Activity started!", description: "Good luck with your new adventure!" });
  };

  const handleCompleteActivity = () => {
    markCompleted(activity.id);
    toast({ title: "Activity completed!", description: "Great job! Check out similar activities below." });
  };

  const formatDuration = (duration: EnhancedActivity['duration']) => {
    const { min, max, unit } = duration;
    const timeStr = min === max ? `${min}` : `${min}-${max}`;
    return `${timeStr} ${unit}`;
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              {activity.title}
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
              {inProgress && <Play className="w-5 h-5 text-blue-600" />}
            </CardTitle>
            {!hideTags && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getDifficultyColor(activity.difficulty)}>
                  {activity.difficulty}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {activity.category}
                </Badge>
                <Badge className={getCostColor(activity.estimatedCost)}>
                  {activity.estimatedCost === 'free' ? 'Free' : `${activity.estimatedCost} cost`}
                </Badge>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className={isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {activity.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatDuration(activity.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="capitalize">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="capitalize">{activity.socialAspect}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="capitalize">{activity.energyLevel} energy</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">
                {isExpanded ? 'Show Less' : 'Show Details'}
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" />
                Instructions
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {activity.detailedInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4" />
                  Materials Needed
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {activity.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
                {activity.optionalMaterials && activity.optionalMaterials.length > 0 && (
                  <>
                    <h5 className="font-medium mt-2 mb-1 text-sm">Optional:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                      {activity.optionalMaterials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" />
                  Benefits
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {activity.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>

            {activity.skillsLearned.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.skillsLearned.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activity.externalResources && activity.externalResources.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Additional Resources</h4>
                  <div className="space-y-2">
                    {activity.externalResources.map((resource, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-2 text-left"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{resource.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2 mt-4">
          {!isCompleted && !inProgress && (
            <Button onClick={handleStartActivity} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Activity
            </Button>
          )}
          {inProgress && !isCompleted && (
            <Button onClick={handleCompleteActivity} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
          {isCompleted && (
            <Button variant="outline" className="flex-1" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedActivityCard;