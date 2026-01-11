import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isRoadmapCompleted } from './utils'
import { RoadmapItem, ProficiencyLevel } from '@/data/mockData'

describe('isRoadmapCompleted', () => {
  // Property 1: Completion Detection Accuracy
  // **Feature: roadmap-completion-analysis, Property 1: Completion Detection Accuracy**
  // **Validates: Requirements 1.2**
  it('should return true if and only if all items have completed=true', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string(),
        skillId: fc.string(),
        skillName: fc.string(),
        resources: fc.array(fc.record({
          id: fc.string(),
          title: fc.string(),
          url: fc.string(),
          type: fc.constantFrom('course', 'tutorial', 'documentation', 'video'),
          duration: fc.string(),
          provider: fc.string()
        })),
        difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced') as fc.Arbitrary<ProficiencyLevel>,
        estimatedTime: fc.string(),
        completed: fc.boolean()
      })),
      (roadmapItems: RoadmapItem[]) => {
        const result = isRoadmapCompleted(roadmapItems)
        const expectedResult = roadmapItems.length > 0 && roadmapItems.every(item => item.completed === true)
        
        expect(result).toBe(expectedResult)
      }
    ), { numRuns: 100 })
  })

  // Edge case tests
  it('should return false for empty arrays', () => {
    expect(isRoadmapCompleted([])).toBe(false)
  })

  it('should return false for undefined input', () => {
    expect(isRoadmapCompleted(undefined as any)).toBe(false)
  })

  it('should return false for null input', () => {
    expect(isRoadmapCompleted(null as any)).toBe(false)
  })

  it('should handle malformed item data gracefully', () => {
    const malformedItems = [
      { id: 'test', completed: true } as any,
      null as any,
      { id: 'test2', completed: false } as any
    ]
    expect(isRoadmapCompleted(malformedItems)).toBe(false)
  })

  // Unit tests for specific examples
  it('should return true when all items are completed', () => {
    const completedItems: RoadmapItem[] = [
      {
        id: 'item1',
        skillId: 'skill1',
        skillName: 'Test Skill 1',
        resources: [],
        difficulty: 'beginner',
        estimatedTime: '10 hours',
        completed: true
      },
      {
        id: 'item2',
        skillId: 'skill2',
        skillName: 'Test Skill 2',
        resources: [],
        difficulty: 'intermediate',
        estimatedTime: '15 hours',
        completed: true
      }
    ]
    expect(isRoadmapCompleted(completedItems)).toBe(true)
  })

  it('should return false when some items are not completed', () => {
    const mixedItems: RoadmapItem[] = [
      {
        id: 'item1',
        skillId: 'skill1',
        skillName: 'Test Skill 1',
        resources: [],
        difficulty: 'beginner',
        estimatedTime: '10 hours',
        completed: true
      },
      {
        id: 'item2',
        skillId: 'skill2',
        skillName: 'Test Skill 2',
        resources: [],
        difficulty: 'intermediate',
        estimatedTime: '15 hours',
        completed: false
      }
    ]
    expect(isRoadmapCompleted(mixedItems)).toBe(false)
  })

  it('should return false when no items are completed', () => {
    const incompleteItems: RoadmapItem[] = [
      {
        id: 'item1',
        skillId: 'skill1',
        skillName: 'Test Skill 1',
        resources: [],
        difficulty: 'beginner',
        estimatedTime: '10 hours',
        completed: false
      },
      {
        id: 'item2',
        skillId: 'skill2',
        skillName: 'Test Skill 2',
        resources: [],
        difficulty: 'intermediate',
        estimatedTime: '15 hours',
        completed: false
      }
    ]
    expect(isRoadmapCompleted(incompleteItems)).toBe(false)
  })
})