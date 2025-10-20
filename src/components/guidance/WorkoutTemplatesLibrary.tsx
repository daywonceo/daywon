import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookmarkPlus, 
  Trash2, 
  Play, 
  Users, 
  Clock,
  TrendingUp 
} from "lucide-react";
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkoutTemplatesLibraryProps {
  onSelectTemplate: (template: any) => void;
}

export const WorkoutTemplatesLibrary = ({ onSelectTemplate }: WorkoutTemplatesLibraryProps) => {
  const { userTemplates, publicTemplates, deleteTemplate, incrementUsage, isLoading } = useWorkoutTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleUseTemplate = (template: any) => {
    incrementUsage(template.id);
    onSelectTemplate(template);
  };

  const TemplateCard = ({ template, showDelete = false }: { template: any; showDelete?: boolean }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            {template.description && (
              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
            )}
          </div>
          {showDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTemplate(template.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{template.workout_type}</Badge>
          <Badge variant="outline">{template.difficulty}</Badge>
          {template.estimated_duration_minutes && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {template.estimated_duration_minutes}min
            </Badge>
          )}
          {template.is_public && (
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              Public
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>Used {template.times_used} times</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleUseTemplate(template)}
            className="flex-1 gap-2"
          >
            <Play className="w-4 h-4" />
            Start Workout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTemplate(template)}
          >
            Preview
          </Button>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Workout Templates</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <BookmarkPlus className="w-4 h-4" />
            Save Current as Template
          </Button>
        </div>

        <Tabs defaultValue="my-templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-templates">
              My Templates ({userTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="public">
              Community ({publicTemplates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-templates" className="space-y-4 mt-4">
            {userTemplates.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No saved templates yet. Complete a workout and save it as a template!
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {userTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} showDelete />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {publicTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              {selectedTemplate?.description && (
                <p className="text-muted-foreground">{selectedTemplate.description}</p>
              )}
              
              <div className="space-y-2">
                <h4 className="font-semibold">Exercises:</h4>
                {selectedTemplate?.exercises?.map((exercise: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                className="w-full gap-2"
              >
                <Play className="w-4 h-4" />
                Start This Workout
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
