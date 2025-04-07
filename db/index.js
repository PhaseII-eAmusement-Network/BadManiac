import { JSONFilePreset } from 'lowdb/node'
const defaultData = { keys: [] }
export const Database = await JSONFilePreset('./db.json', defaultData)