
export const getWorkoutTypesForPlan = (planType: string): string[] => {
  switch (planType) {
    case 'push_pull_legs':
      return ['push', 'pull', 'legs'];
    case 'upper_lower':
      return ['upper', 'lower'];
    case 'full_body':
      return ['full_body'];
    case 'chest_back_shoulders_arms_legs':
      return ['chest_back', 'shoulders_arms', 'legs'];
    default:
      return ['full_body'];
  }
};
