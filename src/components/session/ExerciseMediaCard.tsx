import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { mapMuscle, muscleFromExerciseName, uniqueMuscles } from '../../lib/muscles'

interface Props {
  exerciseName: string
  gifUrl: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[]
}

export function ExerciseMediaCard({ exerciseName, gifUrl, primaryMuscle, secondaryMuscles }: Props) {
  const primaryId = (primaryMuscle ? mapMuscle(primaryMuscle) : null) ?? muscleFromExerciseName(exerciseName)
  const secondaryIds = (secondaryMuscles ?? []).map(mapMuscle).filter((m): m is Muscle => m !== null)
  const allMuscles = uniqueMuscles([primaryId, ...secondaryIds])

  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: exerciseName, muscles: allMuscles }] : []

  return (
    <div className="w-full h-[200px] rounded-xl overflow-hidden relative bg-bg-elevated shadow-card">
      {gifUrl ? (
        <>
          {/* GIF as hero */}
          <div className="w-full h-full flex items-center justify-center bg-white px-4">
            <img
              src={gifUrl}
              alt={`${exerciseName} technique`}
              className="h-full w-auto max-w-full object-contain"
              loading="eager"
            />
          </div>

          {/* Body model as picture-in-picture — bottom-right */}
          {muscleData.length > 0 && (
            <div className="absolute bottom-3 right-3 w-[76px] h-[76px] bg-white/95 rounded-xl p-1.5 shadow-lift">
              <Model
                data={muscleData}
                style={{ width: '100%', height: '100%' }}
                highlightedColors={['#EA580C', '#FB923C']}
                bodyColor="#D6CFBF"
                onClick={() => {}}
              />
            </div>
          )}

          {/* Muscle label chip */}
          {primaryMuscle && (
            <div className="absolute top-3 left-3">
              <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                {primaryMuscle}
              </span>
            </div>
          )}
        </>
      ) : (
        /* No GIF — body model fills the card */
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-6">
          {muscleData.length > 0 ? (
            <>
              <Model
                data={muscleData}
                style={{ width: '100%', maxHeight: 165 }}
                highlightedColors={['#EA580C', '#FB923C']}
                bodyColor="#D6CFBF"
                onClick={() => {}}
              />
              {primaryMuscle && (
                <span className="text-accent text-[10px] font-bold uppercase tracking-widest">
                  {primaryMuscle}
                </span>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2">💪</div>
              <p className="text-text-muted text-xs">{exerciseName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
