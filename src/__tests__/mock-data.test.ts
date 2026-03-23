import { describe, it, expect } from 'vitest'
import {
  mockRecords,
  mockMedicalBatches,
  mockPaddocks,
  animalWeightHistory,
} from '@/lib/mock-data'

describe('mockRecords', () => {
  it('has exactly 20 entries', () => {
    expect(mockRecords).toHaveLength(20)
  })

  it('all records have required fields (id, uuid, visual_tag, eid, weight_kg)', () => {
    for (const record of mockRecords) {
      expect(record).toHaveProperty('id')
      expect(record).toHaveProperty('uuid')
      expect(record).toHaveProperty('visual_tag')
      expect(record).toHaveProperty('eid')
      expect(record).toHaveProperty('weight_kg')
    }
  })

  it('all EIDs are unique', () => {
    const eids = mockRecords.map((r) => r.eid).filter(Boolean)
    const uniqueEids = new Set(eids)
    expect(uniqueEids.size).toBe(eids.length)
  })

  it('all visual_tags follow AU-XXXX format', () => {
    const pattern = /^AU-\d{4}$/
    for (const record of mockRecords) {
      expect(record.visual_tag).toMatch(pattern)
    }
  })

  it('weight_kg is within realistic range (100-900)', () => {
    for (const record of mockRecords) {
      expect(record.weight_kg).toBeGreaterThanOrEqual(100)
      expect(record.weight_kg).toBeLessThanOrEqual(900)
    }
  })
})

describe('mockMedicalBatches', () => {
  it('has entries', () => {
    expect(mockMedicalBatches.length).toBeGreaterThan(0)
  })

  it('animal references in batches match actual record visual tags', () => {
    const validTags = new Set(mockRecords.map((r) => r.visual_tag))
    for (const batch of mockMedicalBatches) {
      for (const tag of batch.animals) {
        expect(validTags.has(tag)).toBe(true)
      }
    }
  })
})

describe('mockPaddocks', () => {
  it('coordinates are in Nimbin area (lat ~-28.5 to -28.7)', () => {
    for (const paddock of mockPaddocks) {
      expect(paddock.lat).toBeGreaterThanOrEqual(-28.7)
      expect(paddock.lat).toBeLessThanOrEqual(-28.5)
    }
  })
})

describe('animalWeightHistory', () => {
  it('has entries for multiple animals', () => {
    const keys = Object.keys(animalWeightHistory)
    expect(keys.length).toBeGreaterThan(0)
  })

  it('each entry has required AnimalWeightRecord fields', () => {
    for (const [, records] of Object.entries(animalWeightHistory)) {
      for (const record of records) {
        expect(record).toHaveProperty('date')
        expect(record).toHaveProperty('weight_kg')
        expect(record).toHaveProperty('adg')
      }
    }
  })
})
