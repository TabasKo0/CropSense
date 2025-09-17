# CropSense Authentication Setup

## Environment Variables Configuration

### Required Steps:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard: https://supabase.com/dashboard/project/nyxmlsbfjmpycttacdzx
   - Navigate to Settings > API
   - Copy the following values:
     - Project URL (for `SUPABASE_URL`)
     - `anon` `public` key (for `SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`)
     - `service_role` `secret` key (for `SUPABASE_SERVICE_KEY`) ⚠️ **Keep this secret!**

3. **Generate a secure JWT secret:**
   ```bash
   # On macOS/Linux:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   [System.Convert]::ToBase64String((1..32 | ForEach {Get-Random -Maximum 256}))
   
   # Or use an online generator: https://generate.plus/en/base64
   ```

4. **Get OpenWeatherMap API key:**
   - Sign up at: https://openweathermap.org/api
   - Get your free API key
   - Add it to `VITE_OPENWEATHER_API_KEY`

### Example .env file:
```env
# Frontend (Client-side)
VITE_SUPABASE_PROJECT_ID="nyxmlsbfjmpycttacdzx"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://nyxmlsbfjmpycttacdzx.supabase.co"
VITE_OPENWEATHER_API_KEY="your_openweather_api_key"

# Backend (Server-side)
SUPABASE_URL="https://nyxmlsbfjmpycttacdzx.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # service_role key
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."    # anon public key
JWT_SECRET="your_32_character_minimum_secure_random_string"
```

## Security Notes:

- ⚠️ **Never commit `.env` files to version control**
- ⚠️ **Keep `SUPABASE_SERVICE_KEY` secret** - it has admin privileges
- ⚠️ **Use a strong, random JWT_SECRET** (minimum 32 characters)
- ✅ **Only `VITE_` prefixed variables are exposed to the frontend**

## Installation & Setup:

1. Install dependencies:
   ```bash
   npm install dotenv
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The auth API will validate your environment configuration on startup.

## Troubleshooting:

- **"Missing required environment variables"**: Check your `.env` file has all required variables
- **"JWT_SECRET should be at least 32 characters"**: Generate a longer secret key
- **Weather API not working**: Verify your OpenWeatherMap API key is correct
- **Supabase errors**: Check your project URL and API keys in Supabase dashboard