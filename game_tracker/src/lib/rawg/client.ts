import { env } from "$env/dynamic/private";
import type { RawgGame, RawgSearchResponse } from "./types";

const BASE_URL = "http://api.rawg.io/api";

export async function searchGames(query: string): Promise<RawgGame[]> {
    if (!query || query.trim().length === 0) return [];

    const params = new URLSearchParams({
        key: env.RAWG_API_KEY ?? "",
        search: query.trim(),
        page_size:"10"
    });

    const response = await fetch(`${BASE_URL}/games?${params}`);

    if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`);
    }

    const data: RawgSearchResponse = await response.json();
    return data.results;
}

export async function getGameById(rawgId: number): Promise<RawgGame | null> {
    const params = new URLSearchParams({
        key: env.RAWG_API_KEY ?? "",
    });

    const response = await fetch(`${BASE_URL}/games/${rawgId}?${params}`);

    if (!response.ok) return null;

    return response.json();
}