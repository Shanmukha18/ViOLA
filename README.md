# ViOLA - VIT Ride Sharing Platform

A full-stack ride-sharing application designed specifically for VIT students, enabling safe and cost-effective carpooling within the VIT community.

## Overview

ViOLA (VIT Ride Sharing) is a comprehensive ride-sharing platform that connects VIT students for safe and affordable transportation. The application features real-time chat, ride management, and a user-friendly interface designed specifically for the VIT community.

### Key Highlights

- **🔐 Secure Authentication**: Google OAuth2 integration for VIT email addresses
- **💬 Real-time Chat**: WebSocket-based messaging system
- **📍 Location-based Search**: Advanced filtering for ride discovery
- **📱 Responsive Design**: Optimized for desktop and mobile devices
- **🔔 Real-time Notifications**: Instant updates for new messages and rides

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Router**: Client-side routing
- **React Query**: Server state management
- **WebSocket**: Real-time communication

### Backend
- **Spring Boot 3**: Java-based REST API framework
- **Java 17**: Modern Java with latest features
- **Spring Security**: Authentication and authorization
- **Spring WebSocket**: Real-time messaging support
- **JWT**: JSON Web Token authentication
- **Maven**: Dependency management and build tool

### Database
- **PostgreSQL**: Reliable relational database
- **HikariCP**: High-performance connection pooling
- **JPA/Hibernate**: Object-relational mapping

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│  (Spring Boot)  │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └─────────────►│   WebSocket     │
                        │   (Real-time)   │
                        └─────────────────┘
```

### Frontend Architecture
- **Component-based**: Modular React components
- **Context API**: Global state management
- **Custom Hooks**: Reusable logic
- **Service Layer**: API communication abstraction

### Backend Architecture
- **RESTful API**: Standard HTTP endpoints
- **Layered Architecture**: Controller → Service → Repository
- **WebSocket Support**: Real-time messaging
- **Security Layer**: JWT authentication and authorization

## 🚀 Installation

### Environment Variables

#### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Backend (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/viola_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your-jwt-secret
jwt.expiration=86400000

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret
```

## 📖 Usage

### For Students

1. **Sign In**: Use your VIT email address to authenticate via Google
2. **Browse Rides**: Search for available rides using filters
3. **Create Rides**: Post your own rides for others to join
4. **Chat**: Communicate with ride participants in real-time
5. **Manage Profile**: Update your profile and view ride history

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth2 authentication
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Ride Endpoints
- `GET /api/rides` - Get all rides
- `POST /api/rides` - Create new ride
- `GET /api/rides/{id}` - Get specific ride
- `PUT /api/rides/{id}` - Update ride
- `DELETE /api/rides/{id}` - Delete ride

### Chat Endpoints
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/{rideId}` - Get messages for ride
- `POST /api/chat/messages` - Send message

### WebSocket Endpoints
- `ws://localhost:8081/ws/chat` - Real-time chat connection


## 📸 Screenshots

### Home Page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fac0d963-cd8b-4c10-bf88-c0ca274a2cf7" />

### Ride Creation
<img width="1755" height="1802" alt="image" src="https://github.com/user-attachments/assets/583bfb09-5ccd-494b-a567-a43ae846bb0c" />

### Chat Interface
<img width="1755" height="1536" alt="image" src="https://github.com/user-attachments/assets/3f1cd138-307e-4705-bb5b-fcc1966dfd06" />

### User Profile
![WhatsApp Image 2025-08-24 at 12 02 32_9a845899](https://github.com/user-attachments/assets/08a6ff50-d68c-41f2-ae50-3dc31ace2dca)

### Ride Cards
<img width="1856" height="1562" alt="image" src="https://github.com/user-attachments/assets/96b41224-727e-44af-bcc9-966908a66ba2" />



### Project Structure
```
viola/
├── client-side/                 # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── server-side/                # Spring Boot backend
│   ├── src/main/java/
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic
│   │   ├── repository/        # Data access layer
│   │   ├── entity/            # Database entities
│   │   ├── dto/               # Data transfer objects
│   │   ├── security/          # Security configuration
│   │   └── config/            # Application configuration
│   └── src/main/resources/    # Configuration files
└── docs/                      # Documentation
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the VIT Community**

![ViOLA Logo](https://via.placeholder.com/200x200/395B64/FFFFFF?text=ViOLA)
