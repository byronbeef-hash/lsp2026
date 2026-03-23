import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn() utility function', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined and null inputs', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('merges tailwind classes correctly (last wins)', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })

  it('merges conflicting tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })

  it('handles array-like inputs via clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})

describe('CSV export generation logic', () => {
  it('generates correct CSV format from record data', () => {
    // Replicate the CSV generation logic from the store
    const records = [
      {
        visual_tag: 'AU-0142',
        eid: '982000411234567',
        sex: 'Female',
        breed: 'Angus',
        weight_kg: 485,
        condition: 'Good',
        date_of_birth: '2022-03-15',
      },
      {
        visual_tag: 'AU-0143',
        eid: null,
        sex: 'Male',
        breed: 'Hereford',
        weight_kg: 620,
        condition: 'Excellent',
        date_of_birth: null,
      },
    ]

    const headers = 'Visual Tag,EID,Sex,Breed,Weight (kg),Condition,Date of Birth\n'
    const csv =
      headers +
      records
        .map(
          (r) =>
            `${r.visual_tag},${r.eid || ''},${r.sex || ''},${r.breed || ''},${r.weight_kg || ''},${r.condition || ''},${r.date_of_birth || ''}`,
        )
        .join('\n')

    expect(csv).toContain('Visual Tag,EID,Sex,Breed,Weight (kg),Condition,Date of Birth')
    expect(csv).toContain('AU-0142,982000411234567,Female,Angus,485,Good,2022-03-15')
    expect(csv).toContain('AU-0143,,Male,Hereford,620,Excellent,')
  })

  it('handles empty records', () => {
    const records: { visual_tag: string; eid: string | null; sex: string | null; breed: string | null; weight_kg: number | null; condition: string | null; date_of_birth: string | null }[] = []
    const headers = 'Visual Tag,EID,Sex,Breed,Weight (kg),Condition,Date of Birth\n'
    const csv = headers + records.map(() => '').join('\n')
    expect(csv).toBe('Visual Tag,EID,Sex,Breed,Weight (kg),Condition,Date of Birth\n')
  })
})
