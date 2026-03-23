import { describe, it, expect } from 'vitest'
import { mockRecords, mockMedicalBatches, mockPaddocks, animalWeightHistory } from '@/lib/mock-data'
import type {
  LivestockRecord,
  MedicalBatch,
  Paddock,
  AnimalWeightRecord,
} from '@/types'

describe('LivestockRecord interface matches mock data shape', () => {
  it('each mockRecord conforms to LivestockRecord shape', () => {
    const requiredStringFields: (keyof LivestockRecord)[] = [
      'uuid', 'visual_tag', 'created_at', 'updated_at',
    ]
    const requiredNumberFields: (keyof LivestockRecord)[] = ['id']
    const requiredBooleanFields: (keyof LivestockRecord)[] = ['is_pregnant', 'is_dehorn']
    const nullableStringFields: (keyof LivestockRecord)[] = [
      'eid', 'sex', 'breed', 'condition', 'date_of_birth',
      'date_of_sale', 'date_of_death', 'record_date', 'notes',
      'mother_visual_tag', 'father_visual_tag', 'profile_image', 'farm_uuid',
    ]
    const nullableNumberFields: (keyof LivestockRecord)[] = [
      'weight_kg', 'weight_lb', 'paddock_id',
    ]

    for (const record of mockRecords) {
      for (const field of requiredStringFields) {
        expect(typeof record[field]).toBe('string')
      }
      for (const field of requiredNumberFields) {
        expect(typeof record[field]).toBe('number')
      }
      for (const field of requiredBooleanFields) {
        expect(typeof record[field]).toBe('boolean')
      }
      for (const field of nullableStringFields) {
        const val = record[field]
        expect(val === null || typeof val === 'string').toBe(true)
      }
      for (const field of nullableNumberFields) {
        const val = record[field]
        expect(val === null || typeof val === 'number').toBe(true)
      }
    }
  })
})

describe('MedicalBatch interface matches mock data shape', () => {
  it('each mockMedicalBatch conforms to MedicalBatch shape', () => {
    for (const batch of mockMedicalBatches) {
      expect(typeof batch.id).toBe('number')
      expect(typeof batch.uuid).toBe('string')
      expect(typeof batch.batch_name).toBe('string')
      expect(['active', 'completed', 'scheduled']).toContain(batch.status)
      expect(typeof batch.treatment_type).toBe('string')
      expect(typeof batch.medication).toBe('string')
      expect(typeof batch.dosage).toBe('string')
      expect(typeof batch.administered_by).toBe('string')
      expect(typeof batch.animal_count).toBe('number')
      expect(Array.isArray(batch.animals)).toBe(true)
      for (const animal of batch.animals) {
        expect(typeof animal).toBe('string')
      }
      expect(typeof batch.scheduled_date).toBe('string')
      expect(batch.completed_date === null || typeof batch.completed_date === 'string').toBe(true)
      expect(batch.notes === null || typeof batch.notes === 'string').toBe(true)
      expect(batch.farm_uuid === null || typeof batch.farm_uuid === 'string').toBe(true)
      expect(typeof batch.created_at).toBe('string')
    }
  })
})

describe('Paddock interface matches mock data shape', () => {
  it('each mockPaddock conforms to Paddock shape', () => {
    for (const paddock of mockPaddocks) {
      expect(typeof paddock.id).toBe('number')
      expect(typeof paddock.uuid).toBe('string')
      expect(typeof paddock.name).toBe('string')
      expect(typeof paddock.area_hectares).toBe('number')
      expect(typeof paddock.capacity).toBe('number')
      expect(typeof paddock.current_count).toBe('number')
      expect(['active', 'resting', 'maintenance']).toContain(paddock.status)
      expect(typeof paddock.pasture_type).toBe('string')
      expect(typeof paddock.water_source).toBe('boolean')
      expect(typeof paddock.lat).toBe('number')
      expect(typeof paddock.lng).toBe('number')
      expect(paddock.farm_uuid === null || typeof paddock.farm_uuid === 'string').toBe(true)
      expect(typeof paddock.created_at).toBe('string')
      // polygon is optional
      if (paddock.polygon) {
        expect(Array.isArray(paddock.polygon)).toBe(true)
        for (const coord of paddock.polygon) {
          expect(coord).toHaveLength(2)
          expect(typeof coord[0]).toBe('number')
          expect(typeof coord[1]).toBe('number')
        }
      }
    }
  })
})

describe('AnimalWeightRecord interface matches animalWeightHistory data', () => {
  it('each weight record conforms to AnimalWeightRecord shape', () => {
    for (const [tag, records] of Object.entries(animalWeightHistory)) {
      expect(typeof tag).toBe('string')
      expect(records.length).toBeGreaterThan(0)
      for (const record of records) {
        expect(typeof record.date).toBe('string')
        expect(typeof record.weight_kg).toBe('number')
        expect(record.adg === null || typeof record.adg === 'number').toBe(true)
        if (record.note !== undefined) {
          expect(typeof record.note).toBe('string')
        }
      }
    }
  })
})
