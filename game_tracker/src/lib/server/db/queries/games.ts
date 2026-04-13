import { db } from "$lib/server/db";
import { games } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RawgGame } from "$lib/rawg/types";

export async function getGameByRawgId
(rawgId: number) {
    const result = await db
    .select()
    .from(games)
    .where(eq(games.rawgId, rawgId))
    .limit(1);

    return result[0] ?? null;
}

export async function upsertGame
(rawgGame: RawgGame) {
    const existing = await getGameByRawgId
    (rawgGame.id);
    if (existing) return existing;

    const inserted = await db
    .insert(games)
    .values({
        rawgId: rawgGame.id,
        title: rawgGame.name,
        coverUrl: rawgGame.background_image,
        releaseYear: rawgGame.released
        ? new Date(rawgGame.released).getFullYear(): null
    })
    .returning();

    return inserted[0]
}