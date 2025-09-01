import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
export const trackedSitesTable = pgTable("sites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  display_name: text().notNull(),
  url: text().notNull(),
  channel_to_notify: text().notNull(),
  should_ping: boolean().notNull(),
  actively_tracked: boolean().default(true).notNull(),
  date_added: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
export const uptimeRecordsTable = pgTable("records", {
  id: uuid()
    .default(sql`uuid_generate_v7()`)
    .primaryKey()
    .defaultRandom(),
  site_id: integer().references(() => trackedSitesTable.id, {
    onDelete: "cascade",
  }),
  up: boolean().notNull(),
  details: text(),
  response_time_ms: doublePrecision(),
  time_checked: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
