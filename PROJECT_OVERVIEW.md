# Human Rights Legal Aid Platform (LEHELP)

## Project Vision
A secure, AI-enhanced platform connecting human rights lawyers and activists with vulnerable individuals seeking legal support.

## Technology Stack

### Frontend
- React with TypeScript
- Progressive Web App (PWA)
- React Native for mobile apps
- Material-UI for accessible components
- i18next for internationalization

### Backend
- Node.js with Express/Fastify
- Python for AI/ML services
- Microservices architecture
- GraphQL and REST APIs
- Message queue (RabbitMQ)

### Database
- PostgreSQL (primary relational data)
- MongoDB (document storage)
- Redis (caching)
- Elasticsearch (search)

### AI/ML
- TensorFlow/PyTorch for models
- Transformers for NLP tasks
- Custom matching algorithms
- Privacy-preserving ML techniques

### Security
- End-to-end encryption (Signal Protocol)
- AES-256 encryption at rest
- TLS 1.3 in transit
- Zero-knowledge architecture
- Multi-factor authentication

### Infrastructure
- Docker containers
- Kubernetes orchestration
- Multi-region deployment
- CI/CD with GitHub Actions

## Project Structure

```
/backend          - Backend services
  /api-gateway    - API gateway service
  /auth-service   - Authentication & authorization
  /case-service   - Case management
  /matching-service - AI-powered case matching
  /messaging-service - Encrypted communications
  /document-service - Document management
  /analytics-service - Reporting & analytics
  
/frontend         - Web application
  /client-portal  - Client-facing interface
  /lawyer-portal  - Lawyer dashboard
  /admin-portal   - Platform administration
  
/mobile           - React Native mobile apps
  /ios            - iOS application
  /android        - Android application
  
/ai-services      - Machine learning services
  /nlp-service    - Natural language processing
  /matching-engine - Case-lawyer matching
  /pattern-recognition - Systemic issue detection
  
/shared           - Shared libraries and utilities
  /encryption     - Encryption utilities
  /types          - TypeScript type definitions
  /i18n           - Internationalization resources
  
/infrastructure   - Deployment and DevOps
  /docker         - Docker configurations
  /kubernetes     - K8s manifests
  /terraform      - Infrastructure as code
  
/docs             - Documentation
/tests            - Integration and E2E tests
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker and Docker Compose
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development databases
docker-compose up -d postgres mongodb redis

# Run database migrations
npm run migrate

# Start backend services
npm run dev:backend

# Start frontend application
npm run dev:frontend

# Start AI services
cd ai-services && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Core Features - Phase 1

### Implemented
- [x] Secure user authentication with MFA
- [x] Anonymous registration for vulnerable users
- [x] End-to-end encrypted messaging
- [x] Basic case intake and triage
- [x] Case-lawyer matching algorithm
- [x] Document upload with encryption
- [x] Multi-language support (10 languages)
- [x] Mobile-responsive interface

### In Progress
- [ ] AI-powered document analysis
- [ ] Pattern recognition across cases
- [ ] Video conferencing integration
- [ ] Offline-first capabilities
- [ ] Advanced analytics dashboard

## Security Highlights

- **Zero-knowledge architecture** - Platform cannot decrypt user data
- **End-to-end encryption** - All communications encrypted
- **No IP logging** - Vulnerable user privacy protected
- **Distributed hosting** - Data in privacy-friendly jurisdictions
- **Regular security audits** - Quarterly penetration testing
- **Emergency protocols** - Panic button and duress codes

## Accessibility Features

- WCAG 2.1 AAA compliant
- Screen reader optimized
- Keyboard navigation
- High contrast mode
- Multi-language support (50+ languages planned)
- Low-bandwidth mode
- Offline functionality

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and code of conduct.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see [LICENSE.md](./LICENSE.md) for details.

## Security

For security concerns, please email security@lehelp.org. Do not create public issues for security vulnerabilities.

## Support

- Documentation: https://docs.lehelp.org
- Email: support@lehelp.org
- Community Forum: https://community.lehelp.org

## Acknowledgments

Built with support from human rights organizations worldwide. Special thanks to our partner organizations and the open-source community.
