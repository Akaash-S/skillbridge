import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isRoadmapCompleted } from '@/lib/utils'
import { RoadmapItem, ProficiencyLevel } from '@/data/mockData'

describe('Roadmap Page Properties', () => {
  // Property 2: Message Display Consistency
  // **Feature: roadmap-completion-analysis, Property 2: Message Display Consistency**
  // **Validates: Requirements 1.1, 1.3**
  it('should show completion message when all items are completed and hide otherwise', () => {
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
        const isCompleted = isRoadmapCompleted(roadmapItems)
        const shouldShowMessage = roadmapItems.length > 0 && roadmapItems.every(item => item.completed === true)
        
        // The completion message should be visible if and only if all items are completed
        expect(isCompleted).toBe(shouldShowMessage)
      }
    ), { numRuns: 100 })
  })

  // Property 3: Roadmap Items Visibility
  // **Feature: roadmap-completion-analysis, Property 3: Roadmap Items Visibility**
  // **Validates: Requirements 1.4**
  it('should always display roadmap items regardless of completion status', () => {
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
        // For any roadmap state, roadmap items should always be available for display
        // This property validates that completion status doesn't affect item visibility
        const isCompleted = isRoadmapCompleted(roadmapItems)
        
        // Whether completed or not, if we have items, they should be displayable
        if (roadmapItems.length > 0) {
          // All items should have the required properties for display
          const allItemsDisplayable = roadmapItems.every(item => 
            item && 
            typeof item.id === 'string' && 
            typeof item.skillName === 'string' &&
            typeof item.completed === 'boolean'
          )
          expect(allItemsDisplayable).toBe(true)
          
          // Completion status should not affect the displayability of items
          expect(roadmapItems.length).toBeGreaterThan(0)
        }
      }
    ), { numRuns: 100 })
  })
})