import { useState } from 'react'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { mapMuscle, muscleFromExerciseName, uniqueMuscles } from '../../lib/muscles'

interface Props {
  exerciseName: string
  gifUrl: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[]
}

const POSTERIOR_MUSCLES = new Set<Muscle>([
  'trapezius', 'upper-back', 'lower-back', 'back-deltoids',
  'gluteal', 'hamstring', 'calves',
])

export function ExerciseMediaCard({ exerciseName, gifUrl, primaryMuscle, secondaryMuscles }: Props) {
  const [gifFailed, setGifFailed] = useState(false)

  const primaryId = (primaryMuscle ? mapMuscle(primaryMuscle) : null) ?? muscleFromExerciseName(exerciseName)
  const secondaryIds = (secondaryMuscles ?? []).map(mapMuscle).filter((m): m is Muscle => m !== null)
  const allMuscles = uniqueMuscles([primaryId, ...secondaryIds])

  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: exerciseName, muscles: allMuscles }] : []

  const showGif = !!gifUrl && !gifFailed
  const pipType = primaryId && POSTERIOR_MUSCLES.has(primaryId) ? 'posterior' : 'anterior'

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-bg-elevated" style={{ height: 148 }}>
      {showGif ? (
        <>
          <div className="w-full h-full flex items-center justify-center bg-white px-4">
            <img
              src={gifUrl}
              alt={`${exerciseName} form`}
              className="h-full w-auto max-w-full object-contain"
              loading="eager"
              onError={() => setGifFailed(true)}
            />
          </div>
          {muscleData.length > 0 && (
            <div className="absolute bottom-2 right-2 w-[60px] h-[74px] bg-white/95 rounded-xl p-1 shadow-lift">
              <Model
                data={muscleData}
                style={{ width: '100%', height: '100%' }}
                highlightedColors={['#EA580C', '#FB923C']}
                bodyColor="#D6CFBF"
                type={pipType}
                onClick={() => {}}
              />
            </div>
          )}
        </>
      ) : (
        /* Dual anatomy view — anterior + posterior side by side */
        <div className="w-full h-full flex items-center px-5 gap-2">
          {muscleData.length > 0 ? (
            <>
              <div className="flex-1 h-full flex items-center justify-center">
                <Model
                  data={muscleData}
                  style={{ width: '100%', maxHeight: 128 }}
                  highlightedColors={['#EA580C', '#FB923C']}
                  bodyColor="#C8C1B5"
                  type="anterior"
                  onClick={() => {}}
                />
              </div>
              <div className="w-px h-16 bg-border self-center" />
              <div className="flex-1 h-full flex items-center justify-center">
                <Model
                  data={muscleData}
                  style={{ width: '100%', maxHeight: 128 }}
                  highlightedColors={['#EA580C', '#FB923C']}
                  bodyColor="#C8C1B5"
                  type="posterior"
                  onClick={() => {}}
                />
              </div>
            </>
          ) : (
            <div className="w-full text-center opacity-40">
              <div className="text-3xl mb-1">🏋️</div>
              <p className="text-text-muted text-xs">{exerciseName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
