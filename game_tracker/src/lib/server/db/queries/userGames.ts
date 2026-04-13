import  { db } from "$lib/server/db";
import { userGames } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { applyStatusTransitions } from "../../../utils/statusTransitions";

export async function getUserGames
(userId: string) {
    return db.query.userGames.findMany({
        where: eq(userGames.userId, userId),
        with: { game: true }
    });
}

export async function addGameToLibrary
(userId: string, gameId: string) {
    const existing = await db
    .select()
    .from(userGames)
    .where(
        and(
            eq(userGames.userId,userId),
            eq(userGames.gameId, gameId)
        )
    )
    .limit(1);

    if (existing[0]) return existing[0];

    const inserted = await db
    .insert(userGames)
    .values({ userId, gameId })
    .returning();

    return inserted[0];

}

export async function updateUserGame({
    id,
    userId,
    status,
    rating,
    hoursPlayed,
    completionPercentage
}: {
    id: string;
    userId: string;
    status: string;
    rating: number | null;
    hoursPlayed: number | null;
    completionPercentage: number | null;
}) {
    const current = await db
    .select()
    .from(userGames)
    .where(and(eq(userGames.id, id), eq(userGames.userId, userId)))
    .limit(1);

    if (!current[0]) throw new Error("Game not found");

    const transitions = applyStatusTransitions(current[0], status);

    await db
       .update(userGames)
       .set({
        status: status as typeof userGames.status._.data,
        rating,
        hoursPlayed,
        completionPercentage: completionPercentage ?? current[0].completionPercentage,
        updatedAt: new Date(),
        ...transitions
       })
       .where(and(eq(userGames.id, id), eq(userGames.userId, userId)));
}