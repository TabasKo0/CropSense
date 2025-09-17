# CropSense Sample API

A comprehensive sample API for the CropSense agricultural intelligence platform, providing endpoints for crop analysis, weather data, and marketplace functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the API directory:
```bash
cd src/api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production Build
```bash
npm run build
npm start
```

## 📋 API Documentation

### Base URL
```
http://localhost:3001
```

### Health Check
- **GET** `/health` - API health status

### Root Information
- **GET** `/` - API information and available endpoints

## 🌾 Crop Analysis Endpoints

### Get All Crop Analyses
- **GET** `/api/crop-analysis`
- **Query Parameters:**
  - `cropType` - Filter by crop type
  - `fieldId` - Filter by field ID
  - `soilType` - Filter by soil type

### Get Specific Crop Analysis
- **GET** `/api/crop-analysis/:id`

### Create New Crop Analysis
- **POST** `/api/crop-analysis`
- **Body:**
```json
{
  "cropType": "Corn",
  "fieldId": "field-001",
  "area": 45.5,
  "soilType": "Loamy",
  "plantingDate": "2024-04-15"
}
```

### Get AI Recommendations
- **GET** `/api/crop-analysis/:id/recommendations`

## 🌤️ Weather Endpoints

### Current Weather
- **GET** `/api/weather/current`
- **Query Parameters:**
  - `lat` - Latitude (optional)
  - `lng` - Longitude (optional)

### Weather Forecast
- **GET** `/api/weather/forecast`
- **Query Parameters:**
  - `days` - Number of forecast days (1-7, default: 5)
  - `lat` - Latitude (optional)
  - `lng` - Longitude (optional)

### Agricultural Weather Insights
- **GET** `/api/weather/agricultural`

### Agricultural Zones
- **GET** `/api/weather/zones`

### Weather Alerts
- **GET** `/api/weather/alerts`
- **Query Parameters:**
  - `severity` - Alert severity level
  - `active` - Show only active alerts (true/false)

## 🛒 Marketplace Endpoints

### Get All Sellers
- **GET** `/api/marketplace/sellers`
- **Query Parameters:**
  - `speciality` - Filter by speciality
  - `location` - Filter by location
  - `verified` - Filter verified sellers (true/false)
  - `rating` - Minimum rating filter

### Get Specific Seller
- **GET** `/api/marketplace/sellers/:id`

### Get All Products
- **GET** `/api/marketplace/products`
- **Query Parameters:**
  - `category` - Product category
  - `subcategory` - Product subcategory
  - `minPrice` - Minimum price
  - `maxPrice` - Maximum price
  - `inStock` - In stock only (true/false)
  - `search` - Search term

### Get Specific Product
- **GET** `/api/marketplace/products/:id`

### Request Quote
- **POST** `/api/marketplace/quote`
- **Body:**
```json
{
  "productId": "prod-001",
  "sellerId": "seller-001",
  "quantity": 50,
  "message": "Bulk order for spring planting",
  "contactInfo": {
    "name": "John Farmer",
    "email": "john@farm.com",
    "phone": "+1-555-0123",
    "company": "Green Acres Farm"
  }
}
```

### Get Product Categories
- **GET** `/api/marketplace/categories`

## 🛠️ Using the API Client

The API includes TypeScript utilities for easy integration:

```typescript
import { CropAnalysisAPI, WeatherAPI, MarketplaceAPI } from './src/api/utils/apiClient.ts';

// Get crop analyses
const cropData = await CropAnalysisAPI.getAll();

// Get current weather
const weather = await WeatherAPI.getCurrent();

// Get marketplace products
const products = await MarketplaceAPI.getProducts({ category: 'Seeds' });
```

## 📊 Sample Data

The API includes comprehensive mock data for:
- **Crop Analysis**: Corn and soybean analyses with soil data, satellite imagery, and yield predictions
- **Weather**: Current conditions, 5-day forecasts, and agricultural insights
- **Marketplace**: Verified sellers, products with pricing tiers, and quote functionality

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `src/api` directory:
```env
PORT=3001
NODE_ENV=development
API_KEY=your_api_key_here
```

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)

Modify `server.js` to add additional origins.

## 📝 Response Format

All API responses follow this standard format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "total": 10,
  "timestamp": "2024-09-17T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-09-17T10:30:00Z"
}
```

## 🚦 Rate Limiting

The API currently has no rate limiting but can be easily added using middleware like `express-rate-limit`.

## 🔐 Authentication

This is a sample API with no authentication. For production use, implement:
- JWT token authentication
- API key validation
- Role-based access control

## 🧪 Testing

Run the API and test endpoints using:
- **Browser**: Visit `http://localhost:3001` for API information
- **curl**: 
```bash
curl http://localhost:3001/api/crop-analysis
```
- **Postman**: Import the endpoints and test functionality

## 📈 Extending the API

To add new features:
1. Create new route files in `/routes`
3. Add route imports to `src/api/server.js`
4. Update TypeScript types in `src/api/types`
5. Add client utilities in `src/api/utils/apiClient.ts`

## 🤝 Integration with Frontend

This API is designed to work seamlessly with your CropSense React application. The client utilities provide type-safe methods for all endpoints, making integration straightforward.

## 📄 License

MIT License - See LICENSE file for details