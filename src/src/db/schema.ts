import Dexie, { type Table } from 'dexie'

export interface SiteRecord {
  id: string
  ownerId: string
  name: string
  boundary: Array<{ x: number; y: number }>
  createdAt: number
  updatedAt: number
}

export interface BuildingRecord {
  id: string
  ownerId: string
  siteId: string
  name: string
  kind: 'house' | 'shed' | 'garage' | 'other'
  x: number
  y: number
  rotation: number
  width: number
  depth: number
  height: number
  updatedAt: number
}

export interface ObjectRecord {
  id: string
  ownerId: string
  buildingId: string
  catalogId: string
  x: number
  y: number
  z: number
  rotation: number
  updatedAt: number
}

export interface SyncQueueEntry {
  id?: number
  entity: 'site' | 'building' | 'object'
  entityId: string
  op: 'put' | 'delete'
  payload: unknown
  createdAt: number
}

export class AppDB extends Dexie {
  sites!: Table<SiteRecord, string>
  buildings!: Table<BuildingRecord, string>
  objects!: Table<ObjectRecord, string>
  syncQueue!: Table<SyncQueueEntry, number>

  constructor(uid: string) {
    // Отдельная локальная база на пользователя: если с одного устройства
    // заходят разные люди, данные друг друга они локально не увидят.
    super('site-3d-planner-' + uid)
    this.version(1).stores({
      sites: 'id, ownerId, updatedAt',
      buildings: 'id, ownerId, siteId, updatedAt',
      objects: 'id, ownerId, buildingId, updatedAt',
      syncQueue: '++id, entity, entityId, createdAt'
    })
  }
}

const instances = new Map<string, AppDB>()

export function getDb(uid: string): AppDB {
  if (!instances.has(uid)) {
    instances.set(uid, new AppDB(uid))
  }
  return instances.get(uid)!
}
