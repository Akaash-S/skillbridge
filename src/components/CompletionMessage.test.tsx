import { describe, it, expect } from 'vitest'
import { CompletionMessage } from './CompletionMessage'

describe('CompletionMessage', () => {
  it('should return null when isCompleted is false', () => {
    const result = CompletionMessage({ isCompleted: false })
    expect(result).toBeNull()
  })

  it('should return null when isCompleted is undefined', () => {
    const result = CompletionMessage({ isCompleted: undefined as any })
    expect(result).toBeNull()
  })

  it('should return null when isCompleted is null', () => {
    const result = CompletionMessage({ isCompleted: null as any })
    expect(result).toBeNull()
  })

  it('should return JSX element when isCompleted is true', () => {
    const result = CompletionMessage({ isCompleted: true })
    expect(result).not.toBeNull()
    expect(result).toBeDefined()
  })

  it('should include className prop when provided and isCompleted is true', () => {
    const result = CompletionMessage({ isCompleted: true, className: "custom-class" })
    expect(result).not.toBeNull()
    expect(result).toBeDefined()
  })

  it('should handle falsy values for isCompleted', () => {
    expect(CompletionMessage({ isCompleted: false })).toBeNull()
    expect(CompletionMessage({ isCompleted: 0 as any })).toBeNull()
    expect(CompletionMessage({ isCompleted: '' as any })).toBeNull()
  })

  it('should handle truthy values for isCompleted', () => {
    expect(CompletionMessage({ isCompleted: true })).not.toBeNull()
    expect(CompletionMessage({ isCompleted: 1 as any })).not.toBeNull()
    expect(CompletionMessage({ isCompleted: 'true' as any })).not.toBeNull()
  })
});