import { JSONFilePreset } from "lowdb/node";
const defaultData = { keys: [], reactionRoles: [] };
export const Database = await JSONFilePreset("./db.json", defaultData);
