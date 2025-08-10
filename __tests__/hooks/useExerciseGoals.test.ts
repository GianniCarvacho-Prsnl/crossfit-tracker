import { renderHook, act, waitFor } from '@testing-library/react'
import { useExerciseGoals } from '@/hooks/useExerciseGoals'
import { AppError, ErrorType } from '@/utils/errorHandling'
import type { ExerciseGoals, NewExerciseGoals, UpdateExerciseGoals } from '@/types/database'

// Mock the ExerciseGoalsService
jest.mock('@/services/exerciseGoalsService', () => ({
  ExerciseGoalsService: {
    getUserExerciseGoals: jest.fn(),
    createExerciseGoal: jest.fn(),
    updateExerciseGoal: jest.fn(),
    deleteExerciseGoal: jest.fn(),
    setExerciseGoal: jest.fn(),
    getUpcomingGoals: jest.fn(),
  }
}))

import { ExerciseGoalsService } from '@/services/exerciseGoalsService'

const mockExerciseGoalsService = ExerciseGoalsService as jest.Mocked<typeof ExerciseGoalsService>

const mockGoal1: ExerciseGoals = {
  id: 'goal-1',
  user_id: 'user-1',
  exercise_id: 1,
  target_1rm_lbs: 225,
  target_date: '2024-12-31',
  notes: 'Goal for deadlift',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockGoal2: ExerciseGoals = {
  id: 'goal-2',
  user_id: 'user-1',
  exercise_id: 2,
  target_1rm_lbs: 185,
  target_date: '2024-06-30',
  notes: 'Goal for squat',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockGoals = [mockGoal1, mockGoal2]

const mockNewGoal: NewExerciseGoals = {
  user_id: 'user-1',
  exercise_id: 3,
  target_1rm_lbs: 155,
  target_date: '2024-09-30',
  notes: 'Goal for bench press'
}

describe('useExerciseGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockImplementation(() => new Promise(() => {}))
    
    const { result } = renderHook(() => useExerciseGoals('user-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.goals).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('should fetch goals successfully', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.goals).toEqual(mockGoals)
    expect(result.current.error).toBe(null)
    expect(mockExerciseGoalsService.getUserExerciseGoals).toHaveBeenCalledWith('user-1')
  })

  it('should handle fetch goals error', async () => {
    const error = new AppError('Goals not found', ErrorType.DATABASE, 'Not found')
    mockExerciseGoalsService.getUserExerciseGoals.mockRejectedValue(error)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.goals).toEqual([])
    expect(result.current.error).toEqual(error)
  })

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useExerciseGoals(''))

    expect(result.current.loading).toBe(false)
    expect(mockExerciseGoalsService.getUserExerciseGoals).not.toHaveBeenCalled()
  })

  it('should create goal successfully', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const newGoal = { ...mockNewGoal, id: 'goal-3', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' }
    mockExerciseGoalsService.createExerciseGoal.mockResolvedValue(newGoal)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let createdGoal: ExerciseGoals | undefined
    await act(async () => {
      createdGoal = await result.current.createGoal(mockNewGoal)
    })

    expect(createdGoal).toEqual(newGoal)
    expect(result.current.goals).toEqual([newGoal, ...mockGoals])
    expect(result.current.error).toBe(null)
    expect(mockExerciseGoalsService.createExerciseGoal).toHaveBeenCalledWith(mockNewGoal)
  })

  it('should handle create goal error', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const error = new AppError('Create failed', ErrorType.DATABASE, 'Database error')
    mockExerciseGoalsService.createExerciseGoal.mockRejectedValue(error)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.createGoal(mockNewGoal)).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should update goal successfully', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const updatedGoal = { ...mockGoal1, target_1rm_lbs: 235 }
    mockExerciseGoalsService.updateExerciseGoal.mockResolvedValue(updatedGoal)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateExerciseGoals = { target_1rm_lbs: 235 }
    let updatedResult: ExerciseGoals | undefined

    await act(async () => {
      updatedResult = await result.current.updateGoal('goal-1', updates)
    })

    expect(updatedResult).toEqual(updatedGoal)
    expect(result.current.goals.find(g => g.id === 'goal-1')).toEqual(updatedGoal)
    expect(mockExerciseGoalsService.updateExerciseGoal).toHaveBeenCalledWith('goal-1', updates)
  })

  it('should handle update goal error', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const error = new AppError('Update failed', ErrorType.DATABASE, 'Database error')
    mockExerciseGoalsService.updateExerciseGoal.mockRejectedValue(error)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateExerciseGoals = { target_1rm_lbs: 235 }

    await act(async () => {
      await expect(result.current.updateGoal('goal-1', updates)).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should delete goal successfully', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    mockExerciseGoalsService.deleteExerciseGoal.mockResolvedValue()

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteGoal('goal-1')
    })

    expect(result.current.goals).toEqual([mockGoal2])
    expect(mockExerciseGoalsService.deleteExerciseGoal).toHaveBeenCalledWith('goal-1')
  })

  it('should handle delete goal error', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const error = new AppError('Delete failed', ErrorType.DATABASE, 'Database error')
    mockExerciseGoalsService.deleteExerciseGoal.mockRejectedValue(error)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.deleteGoal('goal-1')).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should set goal for new exercise', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const newGoal = { ...mockNewGoal, id: 'goal-3', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' }
    mockExerciseGoalsService.setExerciseGoal.mockResolvedValue(newGoal)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const goalData = { target_1rm_lbs: 155, target_date: '2024-09-30', notes: 'Goal for bench press' }
    let setGoalResult: ExerciseGoals | undefined

    await act(async () => {
      setGoalResult = await result.current.setGoal(3, goalData)
    })

    expect(setGoalResult).toEqual(newGoal)
    expect(result.current.goals).toEqual([newGoal, ...mockGoals])
    expect(mockExerciseGoalsService.setExerciseGoal).toHaveBeenCalledWith('user-1', 3, goalData)
  })

  it('should set goal for existing exercise (update)', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const updatedGoal = { ...mockGoal1, target_1rm_lbs: 245 }
    mockExerciseGoalsService.setExerciseGoal.mockResolvedValue(updatedGoal)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const goalData = { target_1rm_lbs: 245, target_date: '2024-12-31', notes: 'Updated goal for deadlift' }
    let setGoalResult: ExerciseGoals | undefined

    await act(async () => {
      setGoalResult = await result.current.setGoal(1, goalData)
    })

    expect(setGoalResult).toEqual(updatedGoal)
    expect(result.current.goals.find(g => g.exercise_id === 1)).toEqual(updatedGoal)
    expect(mockExerciseGoalsService.setExerciseGoal).toHaveBeenCalledWith('user-1', 1, goalData)
  })

  it('should handle set goal error', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const error = new AppError('Set goal failed', ErrorType.DATABASE, 'Database error')
    mockExerciseGoalsService.setExerciseGoal.mockRejectedValue(error)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const goalData = { target_1rm_lbs: 155, target_date: '2024-09-30', notes: 'Goal for bench press' }

    await act(async () => {
      await expect(result.current.setGoal(3, goalData)).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should get goal by exercise', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const goal = result.current.getGoalByExercise(1)
    expect(goal).toEqual(mockGoal1)

    const nonExistentGoal = result.current.getGoalByExercise(999)
    expect(nonExistentGoal).toBeUndefined()
  })

  it('should get upcoming goals successfully', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const upcomingGoals = [mockGoal2] // Goal with target_date: '2024-06-30'
    mockExerciseGoalsService.getUpcomingGoals.mockResolvedValue(upcomingGoals)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let upcoming: ExerciseGoals[] | undefined

    await act(async () => {
      upcoming = await result.current.getUpcomingGoals(30)
    })

    expect(upcoming).toEqual(upcomingGoals)
    expect(mockExerciseGoalsService.getUpcomingGoals).toHaveBeenCalledWith('user-1', 30)
  })

  it('should get upcoming goals with default days ahead', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    mockExerciseGoalsService.getUpcomingGoals.mockResolvedValue([])

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.getUpcomingGoals()
    })

    expect(mockExerciseGoalsService.getUpcomingGoals).toHaveBeenCalledWith('user-1', 30)
  })

  it('should handle get upcoming goals error', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)
    const error = new AppError('Get upcoming failed', ErrorType.DATABASE, 'Database error')
    mockExerciseGoalsService.getUpcomingGoals.mockRejectedValue(error)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.getUpcomingGoals()).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should refetch goals data', async () => {
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)

    const { result } = renderHook(() => useExerciseGoals('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the mock to verify refetch calls the service again
    mockExerciseGoalsService.getUserExerciseGoals.mockClear()
    mockExerciseGoalsService.getUserExerciseGoals.mockResolvedValue(mockGoals)

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockExerciseGoalsService.getUserExerciseGoals).toHaveBeenCalledWith('user-1')
  })
})