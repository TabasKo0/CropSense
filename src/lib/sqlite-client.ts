// Browser-compatible SQLite client that makes HTTP requests to our API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class SQLiteClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Helper method to make HTTP requests
    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                return {
                    data: null,
                    error: {
                        message: data.error || 'Request failed',
                        status: response.status
                    }
                };
            }

            return {
                data: data.items || data.orders || data.logs || data.user || data,
                error: null
            };
        } catch (error: any) {
            return {
                data: null,
                error: {
                    message: error.message || 'Network error',
                    status: 0
                }
            };
        }
    }

    // Table query builder (mimics Supabase API)
    from(table: string) {
        return new TableQuery(table, this);
    }

    // Auth methods
    get auth() {
        return {
            signUp: async ({ email, password, options = {} }: any) => {
                const username = options.data?.username || email.split('@')[0];
                return this.request('/auth/signup', {
                    method: 'POST',
                    body: { username, email, password }
                });
            },

            signInWithPassword: async ({ email, password }: any) => {
                return this.request('/auth/signin', {
                    method: 'POST',
                    body: { username: email, password }
                });
            },

            signOut: async () => {
                localStorage.removeItem('auth_token');
                return { data: {}, error: null };
            },

            getUser: async () => {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    return { data: { user: null }, error: null };
                }

                return this.request('/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            },

            getSession: async () => {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    return { data: { session: null }, error: null };
                }

                const userResult = await this.request('/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResult.error) {
                    return { data: { session: null }, error: userResult.error };
                }

                return {
                    data: {
                        session: {
                            user: userResult.data,
                            access_token: token
                        }
                    },
                    error: null
                };
            },

            onAuthStateChange: (callback: any) => {
                // Simple implementation for auth state changes
                // In a real app, you might want to use events or polling
                callback('INITIAL_SESSION', null);
                return {
                    data: { subscription: {} },
                    unsubscribe: () => {}
                };
            }
        };
    }
}

class TableQuery {
    private table: string;
    private client: SQLiteClient;
    private queryOptions: any;

    constructor(table: string, client: SQLiteClient) {
        this.table = table;
        this.client = client;
        this.queryOptions = {
            select: '*',
            filters: [],
            orderBy: null,
            limit: null
        };
    }

    select(columns: string = '*') {
        this.queryOptions.select = columns;
        return this;
    }

    eq(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'eq', column, value });
        return this;
    }

    neq(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'neq', column, value });
        return this;
    }

    gt(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'gt', column, value });
        return this;
    }

    gte(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'gte', column, value });
        return this;
    }

    lt(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'lt', column, value });
        return this;
    }

    lte(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'lte', column, value });
        return this;
    }

    like(column: string, value: any) {
        this.queryOptions.filters.push({ type: 'like', column, value });
        return this;
    }

    in(column: string, values: any[]) {
        this.queryOptions.filters.push({ type: 'in', column, values });
        return this;
    }

    order(column: string, options: any = {}) {
        this.queryOptions.orderBy = {
            column,
            ascending: options.ascending !== false
        };
        return this;
    }

    limit(count: number) {
        this.queryOptions.limit = count;
        return this;
    }

    single() {
        this.queryOptions.single = true;
        return this;
    }

    // Execute the query
    async execute() {
        let endpoint = '';
        let options: RequestInit = { method: 'GET' };

        // Map table operations to API endpoints
        switch (this.table) {
            case 'items':
                endpoint = '/items';
                // Add filters as query parameters
                const params = new URLSearchParams();
                this.queryOptions.filters.forEach((filter: any) => {
                    if (filter.type === 'eq' && filter.column === 'uuid') {
                        params.append('uuid', filter.value);
                    }
                });
                if (params.toString()) {
                    endpoint += `?${params.toString()}`;
                }
                break;

            case 'orders':
                // This would need user ID from context
                endpoint = '/orders/user/1'; // Placeholder
                break;

            case 'predictions':
                endpoint = '/logs/user/1'; // Placeholder
                break;

            case 'users':
                endpoint = '/auth/profile';
                break;

            default:
                throw new Error(`Table ${this.table} not supported`);
        }

        const result = await this.client.request(endpoint, options);
        
        // Apply single() filter if requested
        if (this.queryOptions.single && result.data && Array.isArray(result.data)) {
            result.data = result.data[0] || null;
        }

        return result;
    }

    // Insert operation
    async insert(data: any) {
        let endpoint = '';
        const options: RequestInit = {
            method: 'POST',
            body: Array.isArray(data) ? data[0] : data
        };

        switch (this.table) {
            case 'items':
                endpoint = '/items';
                break;
            case 'orders':
                endpoint = '/orders';
                break;
            case 'predictions':
                endpoint = '/logs';
                break;
            default:
                throw new Error(`Insert not supported for table ${this.table}`);
        }

        return this.client.request(endpoint, options);
    }

    // Update operation
    async update(data: any) {
        // This would need to be implemented based on the specific update requirements
        throw new Error('Update operation needs specific implementation');
    }

    // Delete operation
    async delete() {
        // This would need to be implemented based on the specific delete requirements
        throw new Error('Delete operation needs specific implementation');
    }

    // For compatibility with Supabase API
    then(resolve?: any, reject?: any) {
        return this.execute().then(resolve, reject);
    }
}

// Create and export the client instance
export const supabase = new SQLiteClient();