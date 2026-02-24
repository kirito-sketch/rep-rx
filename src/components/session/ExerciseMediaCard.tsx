import { useState } from 'react'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { mapMuscle, muscleFromExerciseName, uniqueMuscles } from '../../lib/muscles'

interface Props {
  exerciseName: string
  gifUrl: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[]
}

export function ExerciseMediaCard({ exerciseName, gifUrl, primaryMuscle, secondaryMuscles }: Props) {
  const [gifFailed, setGifFailed] = useState(false)

  const primaryId = (primaryMuscle ? mapMuscle(primaryMuscle) : null) ?? muscleFromExerciseName(exerciseName)
  const secondaryIds = (secondaryMuscles ?? []).map(mapMuscle).filter((m): m is Muscle => m !== null)
  const allMuscles = uniqueMuscles([primaryId, ...secondaryIds])

  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: exerciseName, muscles: allMuscles }] : []

  const showGif = gifUrl && !gifFailed
  const displayLabel = primaryMuscle ?? (allMuscles[0] ?? null)

  return (
    <div className="w-full h-[200px] rounded-xl overflow-hidden relative bg-bg-elevated shadow-card">
      {showGif ? (
        <>
          {/* GIF hero */}
          <div className="w-full h-full flex items-center justify-center bg-white px-4">
            <img
              src={gifUrl}
              alt={`${exerciseName} technique`}
              className="h-full w-auto max-w-full object-contain"
              loading="eager"
              onError={() => setGifFailed(true)}
            />
          </div>

          {/* Body model PiP — bottom-right */}
          {muscleData.length > 0 && (
            <div className="absolute bottom-3 right-3 w-[72px] h-[88px] bg-white/95 rounded-xl p-1.5 shadow-lift flex flex-col">
              <div className="flex-1">
                <Model
                  data={muscleData}
                  style={{ width: '100%', height: '100%' }}
                  highlightedColors={['#EA580C', '#FB923C']}
                  bodyColor="#D6CFBF"
                  type="anterior"
                  onClick={() => {}}
                />
              </div>
            </div>
          )}

          {/* Muscle label chip */}
          {displayLabel && (
            <div className="absolute top-3 left-3">
              <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                {displayLabel}
              </span>
            </div>
          )}
        </>
      ) : (
        /* No GIF or GIF failed — dual anterior/posterior body diagram */
        <div className="w-full h-full flex flex-col">
          {/* Label bar */}
          <div className="flex-none flex items-center justify-between px-4 pt-3 pb-1">
            {displayLabel ? (
              <span className="text-accent text-[10px] font-bold uppercase tracking-widest">
                {displayLabel}
              </span>
            ) : (
              <span className="text-text-muted text-[10px] uppercase tracking-widest">Muscles</span>
            )}
            <div className="flex gap-2 text-[9px] text-text-muted font-medium uppercase tracking-wide">
              <span>Front</span>
              <span className="opacity-40">·</span>
              <span>Back</span>
            </div>
          </div>

          {/* Two-panel diagram */}
          <div className="flex-1 flex items-center justify-center px-4 gap-2">
            {muscleData.length > 0 ? (
              <>
                <div className="flex-1 h-full flex items-center justify-center">
                  <Model
                    data={muscleData}
                    style={{ width: '100%', maxHeight: 145 }}
                    highlightedColors={['#EA580C', '#FB923C']}
                    bodyColor="#D6CFBF"
                    type="anterior"
                    onClick={() => {}}
                  />
                </div>
                <div className="w-px h-24 bg-border-subtle self-center" />
                <div className="flex-1 h-full flex items-center justify-center">
                  <Model
                    data={muscleData}
                    style={{ width: '100%', maxHeight: 145 }}
                    highlightedColors={['#EA580C', '#FB923C']}
                    bodyColor="#D6CFBF"
                    type="posterior"
                    onClick={() => {}}
                  />
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">💪</div>
                <p className="text-text-muted text-xs">{exerciseName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
