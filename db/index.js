import { JSONFilePreset } from "lowdb/node";
const defaultData = { keys: [], reactionRoles: [], greetingKey: 1000 };
export const Database = await JSONFilePreset("./db.json", defaultData);
