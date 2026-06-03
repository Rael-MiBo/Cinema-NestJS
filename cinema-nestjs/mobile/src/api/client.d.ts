export declare function getToken(): Promise<string | null>;
export declare function setToken(token: string | null): Promise<void>;
export declare function api<T>(path: string, options?: RequestInit & {
    auth?: boolean;
}): Promise<T>;
