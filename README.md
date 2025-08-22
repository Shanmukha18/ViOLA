# 🚗 ViOLA - VIT's Cab Ride Sharing Platform

A modern, secure, and user-friendly cab ride sharing platform exclusively for VIT students. Built with React, Spring Boot, and PostgreSQL.

## ✨ Features

- **🔐 Secure Authentication**: Google OAuth2 restricted to @vit.ac.in domain
- **🚗 Ride Management**: Post, view, and manage cab rides
- **💬 Real-time Chat**: In-app messaging between students
- **🔍 Smart Search**: Filter rides by location, time, and price
- **📱 Responsive Design**: Works seamlessly on all devices
- **🛡️ Student Verification**: Automatic verification for VIT students
- **📞 Customer Support**: Multiple support channels

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 19** with modern hooks and functional components
- **Vite** for fast development and building
- **TailwindCSS** for beautiful, responsive UI
- **React Query** for efficient API state management
- **React Router** for navigation
- **WebSocket** support for real-time features

### Backend (Spring Boot)
- **Spring Boot 3.5.5** with Java 24
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **WebSocket** support for real-time communication
- **PostgreSQL** as the primary database
- **Lombok** for reducing boilerplate code

## 🚀 Quick Start

### Prerequisites
- Java 24 or higher
- Node.js 18 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ViOLA
   ```

2. **Configure PostgreSQL**
   ```bash
   # Create database
   createdb viola_cab_sharing
   
   # Update application.properties with your database credentials
   # server-side/src/main/resources/application.properties
   ```

3. **Configure Google OAuth2**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Update `application.properties` with your client ID and secret

4. **Start the backend**
   ```bash
   cd server-side
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd client-side
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
ViOLA/
├── client-side/                 # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React contexts (Auth)
│   │   ├── pages/              # Page components
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # App entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── server-side/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/viola/server_side/
│   │       ├── config/         # Configuration classes
│   │       ├── controller/     # REST controllers
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── entity/         # JPA entities
│   │       ├── repository/     # Data repositories
│   │       ├── security/       # Security configuration
│   │       └── service/        # Business logic services
│   ├── pom.xml                 # Maven dependencies
│   └── application.properties  # Application configuration
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server-side` directory:

```properties
# Database
DB_URL=jdbc:postgresql://localhost:5432/viola_cab_sharing
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
JWT_EXPIRATION=86400000

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Database Schema

The application will automatically create the necessary tables on startup:

- **users**: User profiles and authentication
- **rides**: Ride information and details
- **messages**: Chat messages between users

## 🧪 Testing

### Backend Tests
```bash
cd server-side
mvn test
```

### Frontend Tests
```bash
cd client-side
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file: `mvn clean package`
2. Deploy to your preferred platform (AWS, Azure, Heroku, etc.)
3. Set environment variables for production

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Domain Restriction**: Only @vit.ac.in emails allowed
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: JPA/Hibernate with parameterized queries

## 📱 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth2 login
- `GET /api/auth/me` - Get current user profile

### Rides
- `GET /api/rides` - Get all active rides
- `POST /api/rides` - Create a new ride
- `GET /api/rides/{id}` - Get ride by ID
- `PUT /api/rides/{id}` - Update ride
- `DELETE /api/rides/{id}` - Deactivate ride
- `GET /api/rides/my-rides` - Get user's rides

### WebSocket
- `/ws` - WebSocket endpoint for real-time chat

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@viola.ac.in
- **Phone**: +91-44-3993-9999
- **In-App**: Use the chat feature in the application

## 🙏 Acknowledgments

- VIT University for supporting this project
- Spring Boot team for the excellent framework
- React team for the amazing frontend library
- All contributors and beta testers

---

**Built with ❤️ for VIT students by VIT students**
