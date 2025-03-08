/**
 * Enum representing the types of activities that can be performed at a rink
 */
enum ActivityType {
  // Recreational activities
  RECREATIONAL_SKATING = 'recreational_skating',
  PUBLIC_SKATING = 'public_skating',
  
  // Hockey activities
  HOCKEY_PRACTICE = 'hockey_practice',
  HOCKEY_GAME = 'hockey_game',
  HOCKEY_TOURNAMENT = 'hockey_tournament',
  HOCKEY_CLINIC = 'hockey_clinic',
  STICK_AND_PUCK = 'stick_and_puck',
  DROP_IN_HOCKEY = 'drop_in_hockey',
  
  // Figure skating activities
  FIGURE_SKATING_PRACTICE = 'figure_skating_practice',
  FIGURE_SKATING_COMPETITION = 'figure_skating_competition',
  FIGURE_SKATING_LESSON = 'figure_skating_lesson',
  
  // Other activities
  BROOMBALL = 'broomball',
  CURLING = 'curling',
  SPEED_SKATING = 'speed_skating',
  BIRTHDAY_PARTY = 'birthday_party',
  SPECIAL_EVENT = 'special_event',
  OTHER = 'other'
}

/**
 * Get a human-readable label for an activity type
 * @param activityType The activity type
 * @returns A human-readable label
 */
export function getActivityTypeLabel(activityType: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    [ActivityType.RECREATIONAL_SKATING]: 'Open Skate',
    [ActivityType.PUBLIC_SKATING]: 'Public Skating',
    [ActivityType.HOCKEY_PRACTICE]: 'Practice',
    [ActivityType.HOCKEY_GAME]: 'Game',
    [ActivityType.HOCKEY_TOURNAMENT]: 'Hockey Tournament',
    [ActivityType.HOCKEY_CLINIC]: 'Skills Session',
    [ActivityType.STICK_AND_PUCK]: 'Stick and Puck',
    [ActivityType.DROP_IN_HOCKEY]: 'Drop-in Hockey',
    [ActivityType.FIGURE_SKATING_PRACTICE]: 'Figure Skating Practice',
    [ActivityType.FIGURE_SKATING_COMPETITION]: 'Figure Skating Competition',
    [ActivityType.FIGURE_SKATING_LESSON]: 'Figure Skating Lesson',
    [ActivityType.BROOMBALL]: 'Broomball',
    [ActivityType.CURLING]: 'Curling',
    [ActivityType.SPEED_SKATING]: 'Speed Skating',
    [ActivityType.BIRTHDAY_PARTY]: 'Birthday Party',
    [ActivityType.SPECIAL_EVENT]: 'Special Event',
    [ActivityType.OTHER]: 'Other'
  };
  
  return labels[activityType] || 'Unknown Activity';
}

/**
 * Get all activity types grouped by category
 * @returns An object with activity types grouped by category
 */
export function getActivityTypesByCategory(): Record<string, ActivityType[]> {
  return {
    'Recreational': [
      ActivityType.RECREATIONAL_SKATING,
      ActivityType.PUBLIC_SKATING
    ],
    'Hockey': [
      ActivityType.HOCKEY_PRACTICE,
      ActivityType.HOCKEY_GAME,
      ActivityType.HOCKEY_TOURNAMENT,
      ActivityType.HOCKEY_CLINIC,
      ActivityType.STICK_AND_PUCK,
      ActivityType.DROP_IN_HOCKEY
    ],
    'Figure Skating': [
      ActivityType.FIGURE_SKATING_PRACTICE,
      ActivityType.FIGURE_SKATING_COMPETITION,
      ActivityType.FIGURE_SKATING_LESSON
    ],
    'Other': [
      ActivityType.BROOMBALL,
      ActivityType.CURLING,
      ActivityType.SPEED_SKATING,
      ActivityType.BIRTHDAY_PARTY,
      ActivityType.SPECIAL_EVENT,
      ActivityType.OTHER
    ]
  };
}

export default ActivityType;
