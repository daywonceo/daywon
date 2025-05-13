
export const vibrate = (pattern?: number | number[]) => {
  if (!pattern) {
    // Default short vibration
    pattern = 15;
  }
  
  // Check if vibration API is supported
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
    return true;
  }
  return false;
};

export const hapticSuccess = () => vibrate([15, 50, 15]);
export const hapticError = () => vibrate([100, 50, 100]);
export const hapticLight = () => vibrate(10);
export const hapticMedium = () => vibrate(20);
export const hapticHeavy = () => vibrate(35);
