# 🌱 CropSense - AI-Powered Agricultural Intelligence Platform

![CropSense Homepage](https://github.com/user-attachments/assets/598675b8-f32c-434d-be9c-e068a5d2d2ec)

CropSense is a comprehensive agricultural intelligence platform that leverages artificial intelligence to help farmers optimize crop yields, predict diseases, and make data-driven farming decisions. The platform combines advanced machine learning models with intuitive user interfaces to provide actionable insights for modern agriculture.

## 🚀 Features

### 🔬 AI-Powered Crop Analysis
![Crop Analysis Interface](https://github.com/user-attachments/assets/0c8335a0-bd51-4d17-bcf1-5a8cd1cc3460)

- **Disease Detection**: Upload crop images to detect diseases using deep learning models
- **Yield Prediction**: Predict crop yields based on environmental factors and farming inputs
- **Crop Classification**: Identify crop types and varieties through image analysis
- **Real-time Analysis**: Get instant AI-powered insights for your crops

### 🛒 Agricultural Marketplace
![Marketplace Interface](https://github.com/user-attachments/assets/59cb703f-a3b1-42e7-ab8b-30f4cc59c3a8)

- **Product Trading**: Connect buyers and sellers in the agricultural supply chain
- **Quote Requests**: Request quotes for seeds, fertilizers, and farming equipment
- **Seller Management**: Browse verified agricultural suppliers and vendors
- **Product Categories**: Organized marketplace with multiple agricultural categories

### 🗺️ Smart Soil Mapping
![Soil Map Interface](https://github.com/user-attachments/assets/13ce8f23-e045-4f9b-80e1-bf02371c5f60)

- **Interactive Maps**: Visualize soil conditions and agricultural zones
- **Data Overlays**: Layer weather, satellite, and soil data for comprehensive analysis
- **Geographic Insights**: Location-based agricultural recommendations
- **Environmental Monitoring**: Track environmental conditions affecting crop growth

### 🌤️ Weather Intelligence
- **Current Weather**: Real-time weather data for farming locations
- **Forecasting**: 7-day weather forecasts tailored for agricultural planning
- **Agricultural Alerts**: Weather warnings and recommendations for farming activities
- **Climate Analytics**: Historical weather patterns and trends analysis

### 🔐 Multi-Role Authentication
- **Farmer Dashboard**: Personalized interface for crop monitoring and analysis
- **Admin Panel**: Administrative controls for platform management
- **Proctor System**: Educational oversight for agricultural training programs
- **Secure Authentication**: Role-based access control with Supabase integration

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Shadcn/ui** - High-quality, accessible React components
- **React Router** - Client-side routing for single-page application
- **React Query** - Server state management and data fetching
- **Supabase** - Backend-as-a-Service for authentication and database
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization and charting library

### Backend
- **Python 3.9+** - Core backend programming language
- **Flask** - Lightweight WSGI web application framework
- **PyTorch** - Deep learning framework for AI models
- **scikit-learn** - Machine learning library for data analysis
- **Pandas** - Data manipulation and analysis library
- **NumPy** - Numerical computing library
- **PIL (Pillow)** - Python Imaging Library for image processing
- **Flask-CORS** - Cross-Origin Resource Sharing support

### AI/ML Models
- **Crop Disease Detection**: ResNet-based CNN for plant disease classification
- **Yield Prediction**: Random Forest model for crop yield forecasting
- **Image Classification**: Deep learning models for crop and plant identification

### API Layer
- **Node.js** - JavaScript runtime for API server
- **Express.js** - Web application framework for API endpoints
- **Helmet.js** - Security middleware for Express applications
- **CORS** - Cross-origin resource sharing configuration

## 📦 Installation

### Prerequisites
- **Node.js** 18.0+ and npm
- **Python** 3.9+ and pip
- **Git** for version control

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/TabasKo0/CropSense.git
cd CropSense

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install flask torch torchvision scikit-learn pandas numpy pillow flask-cors joblib

# Start the Flask server
python main.py
```

The backend API will be available at `http://localhost:5000`

### API Server Setup

```bash
# Navigate to API directory
cd src/api

# Install API dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your settings

# Start the API server
npm start
```

The API server will be available at `http://localhost:3001`

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

#### API Server (src/api/.env)
```env
PORT=3001
NODE_ENV=development
API_KEY=your_api_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Model Files
Ensure the following AI model files are present in the `backend/` directory:
- `Agriculture_Yield_Prediction_model_v1_0.joblib` - Yield prediction model
- `disease.pth` - Disease detection model
- `crop.pkl` - Crop classification model

## 🚀 Usage

### Running the Full Application

1. **Start the Backend AI Service**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start the API Server**:
   ```bash
   cd src/api
   npm start
   ```

3. **Start the Frontend**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: `http://localhost:5173`
   - API Server: `http://localhost:3001`
   - Backend AI: `http://localhost:5000`

### Key Workflows

#### Disease Detection
1. Navigate to the Crop Analysis page
2. Upload an image of your crop
3. Get AI-powered disease detection results
4. Receive treatment recommendations

#### Yield Prediction
1. Enter crop and environmental parameters
2. Provide farming input data (fertilizer, pesticide usage)
3. Get predicted yield estimates
4. Plan your farming strategy accordingly

#### Marketplace Trading
1. Browse available agricultural products
2. Filter by category and location
3. Request quotes from verified sellers
4. Complete transactions securely

## 🧪 Testing

### Frontend Testing
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Testing
```bash
# Install test dependencies
pip install pytest requests

# Run tests
pytest tests/

# Test specific model endpoints
python -m unittest test_models.py
```

## 📖 API Documentation

The platform includes comprehensive API documentation for all endpoints:

- **Crop Analysis API**: Disease detection and yield prediction endpoints
- **Weather API**: Current weather, forecasts, and agricultural insights
- **Marketplace API**: Product listings, seller management, and quote requests
- **Authentication API**: User registration, login, and profile management

For detailed API documentation, see [API Documentation](src/api/README.md).

### Sample API Endpoints

```javascript
// Disease Detection
POST /api/crop-analysis/disease-detection
Content-Type: multipart/form-data

// Yield Prediction
POST /api/crop-analysis/yield-prediction
Content-Type: application/json

// Weather Data
GET /api/weather/current?lat=40.7128&lng=-74.0060

// Marketplace Products
GET /api/marketplace/products?category=seeds&limit=10
```

## 🏗️ Project Structure

```
CropSense/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── api/                     # API server code
│   ├── services/               # Frontend services
│   ├── hooks/                  # Custom React hooks
│   └── assets/                 # Static assets
├── backend/                     # Python AI backend
│   ├── main.py                 # Flask application
│   ├── *.pkl, *.pth, *.joblib  # AI model files
│   └── venv/                   # Python virtual environment
├── public/                      # Public static files
├── package.json                # Frontend dependencies
├── tailwind.config.ts          # Tailwind CSS configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # This file
```

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting provider
# (Vercel, Netlify, AWS S3, etc.)
```

### Backend Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Configure environment variables
export FLASK_ENV=production

# Run with production server
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

### Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "main.py"]
```

## 🤝 Contributing

We welcome contributions to CropSense! Please follow these guidelines:

1. **Fork the Repository**: Create your own fork of the project
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your feature or bug fix
4. **Add Tests**: Ensure your code is well-tested
5. **Commit Changes**: `git commit -m 'Add amazing feature'`
6. **Push to Branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Submit your changes for review

### Development Guidelines

- Follow TypeScript best practices for frontend code
- Use Python PEP 8 style guide for backend code
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure cross-browser compatibility

### Code Style

- **Frontend**: ESLint + Prettier configuration
- **Backend**: Black code formatter + Flake8 linting
- **Commits**: Conventional Commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: Agricultural technology specialists
- **AI/ML Engineers**: Machine learning model development
- **UI/UX Designers**: User experience optimization
- **DevOps Engineers**: Infrastructure and deployment

## 📞 Contact

- **Project Repository**: [GitHub - TabasKo0/CropSense](https://github.com/TabasKo0/CropSense)
- **Issues**: [GitHub Issues](https://github.com/TabasKo0/CropSense/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TabasKo0/CropSense/discussions)

## 🙏 Acknowledgments

- **Open Source Community**: For providing excellent tools and libraries
- **Agricultural Experts**: For domain knowledge and validation
- **Machine Learning Community**: For pre-trained models and research
- **React/TypeScript Ecosystem**: For robust frontend development tools
- **Python AI/ML Libraries**: PyTorch, scikit-learn, and related projects

## 🔮 Future Roadmap

- **Mobile Application**: React Native app for field use
- **IoT Integration**: Sensor data integration for real-time monitoring
- **Blockchain**: Supply chain traceability and smart contracts
- **Advanced Analytics**: Predictive analytics and farm optimization
- **Multi-language Support**: Internationalization for global use
- **Drone Integration**: Aerial imagery analysis and monitoring
- **Climate Change Adaptation**: Climate-resilient farming recommendations

---

**CropSense** - Empowering farmers with AI-driven agricultural intelligence for sustainable and productive farming. 🌱