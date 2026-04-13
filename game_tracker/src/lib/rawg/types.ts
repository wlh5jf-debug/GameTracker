export interface RawgGame {
    id: number;
    name: string;
    released: string | null;
    background_image: string | null;
    rating: number;
    platforms: Array <{
        platform: {
            id: number;
            name: string;
        };
    }> | null;
}

export interface RawgSearchResponse {
    count: number;
    results: RawgGame[];
}