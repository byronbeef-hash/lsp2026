import { describe, it, expect, beforeEach } from 'vitest'
import { useRecordsStore, useMedicalStore, usePaddockStore, useNotificationStore } from '@/stores/modules'
import { mockRecords, mockMedicalBatches, mockPaddocks, mockNotifications } from '@/lib/mock-data'

describe('useRecordsStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useRecordsStore.setState({
      records: mockRecords,
      searchQuery: '',
      sortField: 'visual_tag',
      sortDirection: 'asc',
      filterBreed: null,
      filterSex: null,
      filterCondition: null,
      selectedIds: [],
    })
  })

  it('initializes with mockRecords', () => {
    const { records } = useRecordsStore.getState()
    expect(records).toEqual(mockRecords)
    expect(records).toHaveLength(20)
  })

  it('search filtering works - searching for "Angus" returns only Angus records', () => {
    useRecordsStore.getState().setSearch('Angus')
    const filtered = useRecordsStore.getState().getFilteredRecords()
    expect(filtered.length).toBeGreaterThan(0)
    for (const record of filtered) {
      const matchesSearch =
        record.visual_tag.toLowerCase().includes('angus') ||
        (record.eid && record.eid.toLowerCase().includes('angus')) ||
        (record.breed && record.breed.toLowerCase().includes('angus')) ||
        (record.notes && record.notes.toLowerCase().includes('angus'))
      expect(matchesSearch).toBe(true)
    }
  })

  it('sort by weight works', () => {
    useRecordsStore.getState().setSort('weight_kg', 'asc')
    const filtered = useRecordsStore.getState().getFilteredRecords()
    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered[i - 1].weight_kg ?? 0
      const curr = filtered[i].weight_kg ?? 0
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })

  it('sort by weight descending works', () => {
    useRecordsStore.getState().setSort('weight_kg', 'desc')
    const filtered = useRecordsStore.getState().getFilteredRecords()
    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered[i - 1].weight_kg ?? 0
      const curr = filtered[i].weight_kg ?? 0
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('filter by breed works', () => {
    useRecordsStore.getState().setFilter('filterBreed', 'Hereford')
    const filtered = useRecordsStore.getState().getFilteredRecords()
    expect(filtered.length).toBeGreaterThan(0)
    for (const record of filtered) {
      expect(record.breed).toBe('Hereford')
    }
  })

  it('toggleSelect adds and removes IDs', () => {
    useRecordsStore.getState().toggleSelect(1)
    expect(useRecordsStore.getState().selectedIds).toContain(1)
    useRecordsStore.getState().toggleSelect(1)
    expect(useRecordsStore.getState().selectedIds).not.toContain(1)
  })

  it('selectAll selects all record IDs', () => {
    useRecordsStore.getState().selectAll()
    expect(useRecordsStore.getState().selectedIds).toHaveLength(mockRecords.length)
  })

  it('clearSelection empties selection', () => {
    useRecordsStore.getState().selectAll()
    useRecordsStore.getState().clearSelection()
    expect(useRecordsStore.getState().selectedIds).toHaveLength(0)
  })

  it('getRecordById returns the correct record', () => {
    const record = useRecordsStore.getState().getRecordById(1)
    expect(record).toBeDefined()
    expect(record?.id).toBe(1)
  })
})

describe('useMedicalStore', () => {
  it('initializes with mockMedicalBatches', () => {
    const { batches } = useMedicalStore.getState()
    expect(batches).toEqual(mockMedicalBatches)
    expect(batches.length).toBeGreaterThan(0)
  })

  it('getBatchById returns correct batch', () => {
    const batch = useMedicalStore.getState().getBatchById(1)
    expect(batch).toBeDefined()
    expect(batch?.id).toBe(1)
  })

  it('filter by status works', () => {
    useMedicalStore.getState().setFilterStatus('completed')
    const filtered = useMedicalStore.getState().getFilteredBatches()
    expect(filtered.length).toBeGreaterThan(0)
    for (const batch of filtered) {
      expect(batch.status).toBe('completed')
    }
    // Reset
    useMedicalStore.getState().setFilterStatus(null)
  })
})

describe('usePaddockStore', () => {
  it('initializes with mockPaddocks', () => {
    const { paddocks } = usePaddockStore.getState()
    expect(paddocks).toEqual(mockPaddocks)
    expect(paddocks.length).toBeGreaterThan(0)
  })

  it('getPaddockById returns correct paddock', () => {
    const paddock = usePaddockStore.getState().getPaddockById(1)
    expect(paddock).toBeDefined()
    expect(paddock?.id).toBe(1)
  })

  it('selectPaddock sets selectedPaddock', () => {
    usePaddockStore.getState().selectPaddock(3)
    expect(usePaddockStore.getState().selectedPaddock).toBe(3)
    usePaddockStore.getState().selectPaddock(null)
    expect(usePaddockStore.getState().selectedPaddock).toBeNull()
  })
})

describe('useNotificationStore', () => {
  it('initializes with mockNotifications', () => {
    const { notifications } = useNotificationStore.getState()
    expect(notifications).toEqual(mockNotifications)
    expect(notifications.length).toBeGreaterThan(0)
  })

  it('getUnreadCount returns correct count', () => {
    const unread = useNotificationStore.getState().getUnreadCount()
    const expectedUnread = mockNotifications.filter((n) => !n.read).length
    expect(unread).toBe(expectedUnread)
  })

  it('filter by type works', () => {
    useNotificationStore.getState().setFilterType('alert')
    const filtered = useNotificationStore.getState().getFilteredNotifications()
    expect(filtered.length).toBeGreaterThan(0)
    for (const notification of filtered) {
      expect(notification.type).toBe('alert')
    }
    // Reset
    useNotificationStore.getState().setFilterType(null)
  })
})
