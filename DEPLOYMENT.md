# ViOLA - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- Node.js 18+ (for frontend)
- Java 24+ (for backend)
- PostgreSQL 15+ (for database)
- Nginx (for reverse proxy, optional)

### 🔒 Security Checklist

#### Environment Variables
1. **Frontend (.env)**
   ```bash
   VITE_API_BASE_URL=https://your-api-domain.com
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

2. **Backend (application.properties)**
   ```bash
   # Database
   spring.datasource.url=jdbc:postgresql://your-db-host:5432/viola_cab_sharing
   spring.datasource.username=your-db-username
   spring.datasource.password=your-secure-db-password
   
   # JWT
   jwt.secret=your-very-long-and-secure-jwt-secret-key
   jwt.expiration=86400000
   
   # Google OAuth2
   spring.security.oauth2.client.registration.google.client-id=your-google-client-id
   spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret
   
   # CORS
   app.cors.allowed-origins=https://your-frontend-domain.com
   
   # Server
   server.port=8081
   ```

### 🏗️ Build Process

#### Frontend Build
```bash
cd client-side
npm install
npm run build:prod
```

#### Backend Build
```bash
# Using IntelliJ IDEA (Recommended)
# 1. Open the project in IntelliJ IDEA
# 2. Build the project (Build > Build Project)
# 3. The JAR file will be generated in target/ directory

# Alternative: Using Maven (if installed)
cd server-side
mvn clean package -DskipTests
```

### 🐳 Docker Deployment (Optional)

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
FROM openjdk:24-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]
```

### 🔧 Production Configuration

#### Database Setup
1. Create PostgreSQL database
2. Set up proper user permissions
3. Configure connection pooling
4. Enable SSL connections

#### SSL/TLS Configuration
1. Obtain SSL certificates
2. Configure HTTPS for frontend
3. Configure HTTPS for backend API
4. Update CORS origins to use HTTPS

#### Monitoring & Logging
1. Set up application monitoring
2. Configure log aggregation
3. Set up error tracking
4. Monitor database performance

### 🚨 Security Considerations

#### Frontend Security
- ✅ Environment variables properly configured
- ✅ No hardcoded API URLs
- ✅ HTTPS enforced
- ✅ CORS properly configured
- ✅ No debug logs in production

#### Backend Security
- ✅ JWT secret externalized
- ✅ Database credentials secured
- ✅ CORS restricted to specific origins
- ✅ Input validation implemented
- ✅ SQL injection protection (JPA)
- ✅ XSS protection (Spring Security)

#### Database Security
- ✅ Strong passwords
- ✅ SSL connections
- ✅ Proper user permissions
- ✅ Regular backups

### 📊 Performance Optimization

#### Frontend
- ✅ Code splitting implemented
- ✅ Assets optimized
- ✅ Bundle size minimized
- ✅ Caching configured

#### Backend
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Caching strategies
- ✅ Load balancing ready

### 🔄 CI/CD Pipeline

#### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Your deployment script
```

### 📝 Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] CORS origins updated
- [ ] Google OAuth2 redirect URIs updated
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Security scanning completed

### 🆘 Troubleshooting

#### Common Issues
1. **CORS Errors**: Check `app.cors.allowed-origins` configuration
2. **JWT Issues**: Verify JWT secret and expiration settings
3. **Database Connection**: Check connection string and credentials
4. **Google OAuth**: Verify client ID and redirect URIs

#### Logs Location
- Frontend: Browser console / Network tab
- Backend: Application logs / Spring Boot logs
- Database: PostgreSQL logs

### 📞 Support
For deployment issues, contact: shanmukha.thadavarthi@gmail.com
