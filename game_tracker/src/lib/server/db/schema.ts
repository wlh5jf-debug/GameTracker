import { pgTable, pgEnum, uuid, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export * from './auth.schema';
import { user } from './auth.schema';

export const gameStatusEnum = pgEnum(
"game_status",
[
"backlog",
"playing",
"completed",
"dropped"
]);

export const games = pgTable("games", {
	id: uuid("id").primaryKey().defaultRandom(),
	rawgId: integer("rawg_id").notNull().unique(),
	title: text("title").notNull(),
	coverUrl: text("cover_url"),
	releaseYear: integer("release_year"),
	createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
	uniqueIndex("rawg_id_idx").on(table.rawgId)
]);


// id, userId, gameId, status, rating, completionPercentage, hoursPlayed, startedAt, completedAt, createdAt, updatedAt

export const userGames = pgTable("user_games", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => user.id,{onDelete: "cascade"}),
	gameId: uuid("game_id").notNull().references(() => games.id,{onDelete: "cascade"}),
	status: gameStatusEnum("status").notNull().default("backlog"),
	rating: integer("rating"),
	completionPercentage: integer("completion_percentage").notNull().default(0),
	hoursPlayed: integer("hours_played"),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()



})

export const userGamesRelations = relations(userGames, ({ one }) => ({
    game: one(games, {
        fields: [userGames.gameId],
        references: [games.id]
    })
}));

export const gamesRelations = relations(games, ({ many }) => ({
    userGames: many(userGames)
}));