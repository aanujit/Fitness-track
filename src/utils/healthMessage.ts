export const getHealthMessage = (currentSteps: number, goal: number): string => {
  if (goal === 0) return 'Set a daily goal to get started!';
  
  const percentage = currentSteps / goal;
  
  if (percentage < 0.3) {
    return "Let's get started — a short walk can boost your energy.";
  } else if (percentage < 0.7) {
    return "Great progress, keep going!";
  } else if (percentage < 1.0) {
    return "Almost at your goal — finish strong.";
  } else {
    return "Goal achieved! Excellent work today.";
  }
};
