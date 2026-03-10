export interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
}

export interface DayRoutine {
  id: string
  title: string
  focus: string
  exercises: Exercise[]
}

export type RoutineType = Record<string, DayRoutine>

export const routine: RoutineType = {
  day1: {
    id: 'day1',
    title: 'Día 1: Torso A',
    focus: 'Pecho / Grosor Espalda',
    exercises: [
      { id: 'd1_1', name: 'Press Inclinado c/ Mancuernas (30°)', sets: 3, reps: '8-10' },
      { id: 'd1_2', name: 'Remo con Barra o Mancuerna', sets: 3, reps: '8-10' },
      { id: 'd1_3', name: 'Press Plano c/ Mancuernas o Máquina', sets: 2, reps: '8-12' },
      { id: 'd1_4', name: 'Jalón al Pecho en Polea (o Dominadas)', sets: 3, reps: '8-10' },
      { id: 'd1_5', name: 'Elevaciones Laterales c/ Mancuernas', sets: 3, reps: '12-15' },
      { id: 'd1_6', name: 'Curl de Bíceps Inclinado c/ Mancuernas', sets: 3, reps: '10-12' },
      { id: 'd1_7', name: 'Extensión de Tríceps en Polea o Copa', sets: 3, reps: '10-12' },
    ]
  },
  day2: {
    id: 'day2',
    title: 'Día 2: Pierna A',
    focus: 'Cuádriceps',
    exercises: [
      { id: 'd2_1', name: 'Sentadilla Libre o Búlgara c/ Mancuernas', sets: 3, reps: '6-10' },
      { id: 'd2_2', name: 'Prensa de Piernas o Zancadas', sets: 3, reps: '10-12' },
      { id: 'd2_3', name: 'Peso Muerto Rumano', sets: 3, reps: '8-10' },
      { id: 'd2_4', name: 'Curl de Isquios (Máquina)', sets: 3, reps: '10-12' },
      { id: 'd2_5', name: 'Elevación de Talones de Pie (pausa 2s)', sets: 4, reps: '10-15' },
    ]
  },
  day4: {
    id: 'day4',
    title: 'Día 4: Torso B',
    focus: 'Hombro / Amplitud Espalda',
    exercises: [
      { id: 'd4_1', name: 'Press Militar c/ Mancuernas', sets: 3, reps: '8-10' },
      { id: 'd4_2', name: 'Dominadas (Libres o Asistidas)', sets: 3, reps: 'Fallo' },
      { id: 'd4_3', name: 'Cruces en Polea o Aperturas', sets: 3, reps: '12-15' },
      { id: 'd4_4', name: 'Remo en Polea Baja', sets: 3, reps: '10-12' },
      { id: 'd4_5', name: 'Elevaciones Laterales en Polea/Manc.', sets: 4, reps: '12-15' },
      { id: 'd4_6', name: 'Curl de Bíceps Martillo', sets: 3, reps: '10-12' },
      { id: 'd4_7', name: 'Press Francés', sets: 3, reps: '10-12' },
    ]
  },
  day5: {
    id: 'day5',
    title: 'Día 5: Pierna B',
    focus: 'Isquios / Glúteos',
    exercises: [
      { id: 'd5_1', name: 'Peso Muerto Rumano (Pesado)', sets: 3, reps: '6-8' },
      { id: 'd5_2', name: 'Hip Thrust o Puente a una pierna', sets: 3, reps: '8-12' },
      { id: 'd5_3', name: 'Sentadilla Hack, Prensa o Frontal', sets: 3, reps: '10-12' },
      { id: 'd5_4', name: 'Extensión de Cuádriceps (Máquina)', sets: 3, reps: '12-15' },
      { id: 'd5_5', name: 'Elevación de Talones Sentado', sets: 4, reps: '12-15' },
    ]
  }
}
