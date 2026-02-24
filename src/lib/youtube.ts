/**
 * Generates a YouTube search URL for exercise tutorials.
 * Routes lower-body / hip-hinge / barbell movements to Squat University,
 * and everything else to a broad "proper form tutorial" search.
 */
export function tutorialUrl(exerciseName: string): string {
  const lower = exerciseName.toLowerCase()

  const isSquatUniversityContent =
    /squat|deadlift|hip.?hinge|hip.?thrust|rdl|romanian|single.?leg|lunge|goblet|sumo|front.?squat|box.?squat|clean|snatch|overhead.?press|military.?press|split.?squat|bulgarian|step.?up|leg.?press/.test(
      lower
    )

  const query = isSquatUniversityContent
    ? `squat university ${exerciseName}`
    : `${exerciseName} proper form tutorial`

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
