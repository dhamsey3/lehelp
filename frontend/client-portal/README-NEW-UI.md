# LEHELP Frontend - New UI Implementation

## Overview

This is the completely redesigned frontend for the LEHELP (Legal Aid Platform for Human Rights Cases) platform. The new UI features a modern, professional design with enhanced security indicators and role-based dashboards.

## Design System

### Colors
- **Primary**: Indigo (#4F46E5, #6366F1)
- **Secondary**: Purple (#7C3AED, #8B5CF6)
- **Neutral**: Grays (#1F2937, #374151, #6B7280, #F9FAFB)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### Typography
- Clean, modern sans-serif font stack
- Hierarchy: h1 (3rem) → h2 (2.25rem) → h3 (1.875rem) → h4 (1.5rem)
- Body text: 1rem (16px) with 1.6 line-height

### Spacing
- 8px grid system (8, 16, 24, 32, 40, 48, 64px)

## Key Features

### 1. Anonymous Authentication
- No email required for client accounts
- Auto-generated anonymous usernames
- Optional display names for lawyers and activists
- Secure JWT-based authentication

### 2. Role-Based Dashboards
- **Client Dashboard**: Submit cases, view active cases, manage documents
- **Lawyer Dashboard**: View new requests, manage active cases, case statistics
- **Activist Dashboard**: (Future implementation)

### 3. Security-First Design
- Visual encryption indicators throughout
- Security notices on auth pages
- Anonymous identity protection
- End-to-end encryption messaging

### 4. Responsive Design
- Mobile-first approach
- Hamburger navigation for mobile
- Touch-friendly buttons (minimum 44px)
- Adaptive layouts for tablet and desktop

## File Structure

```
src/
├── components/
│   ├── shared/
│   │   ├── Navigation.tsx        # Main navigation bar
│   │   ├── Sidebar.tsx          # Dashboard sidebar
│   │   ├── Footer.tsx           # Footer component
│   │   ├── CaseCard.tsx         # Case display card
│   │   ├── StatusBadge.tsx      # Case status indicator
│   │   └── UrgencyBadge.tsx     # Urgency level indicator
│   ├── Layout.tsx               # Layout wrapper
│   └── PrivateRoute.tsx         # Auth guard component
├── pages/
│   ├── HomePage.tsx             # Landing page
│   ├── LoginPage.tsx            # Login page
│   ├── RegisterPage.tsx         # Registration page
│   ├── ClientDashboard.tsx      # Client dashboard
│   ├── LawyerDashboard.tsx      # Lawyer dashboard
│   ├── NewCasePageNew.tsx       # Case submission form
│   └── ...
├── types/
│   ├── user.types.ts            # User & auth types
│   ├── case.types.ts            # Case types
│   ├── lawyer.types.ts          # Lawyer profile types
│   ├── message.types.ts         # Message types
│   └── document.types.ts        # Document types
├── services/
│   └── api.service.ts           # API client
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── theme.ts                     # Material-UI theme
└── App.tsx                      # Main app component
```

## API Integration

### Base URL
Production: `https://lehelp-backend.onrender.com`
Local: `http://localhost:3000`

### Authentication Endpoints
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token

### Case Endpoints
- `GET /api/v1/cases` - List cases (filtered by role)
- `POST /api/v1/cases` - Submit new case
- `GET /api/v1/cases/:id` - Get case details
- `PATCH /api/v1/cases/:id` - Update case
- `POST /api/v1/cases/:id/accept` - Accept case (lawyer)
- `DELETE /api/v1/cases/:id` - Delete case

### User Endpoints
- `GET /api/v1/users/profile` - Get current user
- `PATCH /api/v1/users/profile` - Update profile

### Lawyer Endpoints
- `GET /api/v1/lawyers` - List lawyers
- `GET /api/v1/lawyers/stats` - Get lawyer statistics
- `PATCH /api/v1/lawyers/profile` - Update lawyer profile

## Environment Variables

Create a `.env` file in the frontend/client-portal directory:

```env
VITE_API_URL=https://lehelp-backend.onrender.com
VITE_APP_NAME=LEHELP
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANONYMOUS_AUTH=true
VITE_ENABLE_AI_MATCHING=true
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## User Flows

### Client Flow
1. Visit landing page
2. Click "Submit Case Anonymously"
3. Select "Client" role
4. Create account (optional username, password required)
5. Redirected to Client Dashboard
6. Click "Submit a New Case"
7. Fill out case form (title, category, urgency, description)
8. Submit case
9. View case in "Your Active Cases"
10. Wait for lawyer assignment
11. Receive messages from assigned lawyer

### Lawyer Flow
1. Visit landing page
2. Click "Join as Lawyer"
3. Select "Lawyer" role
4. Create account with display name and organization
5. Redirected to Lawyer Dashboard
6. View statistics (active cases, new requests, total resolved)
7. Browse "New Case Requests"
8. Click "Accept Case" or "View Details"
9. Communicate with client through secure messages
10. Update case status
11. Upload/download encrypted documents

## Component Usage Examples

### Using StatusBadge
```tsx
import { StatusBadge } from '../components/shared';

<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="resolved" />
```

### Using CaseCard
```tsx
import { CaseCard } from '../components/shared';

<CaseCard 
  case={caseData} 
  onClick={() => navigate(`/cases/${caseData.id}`)}
  showUrgency={true}
/>
```

### Using Sidebar
```tsx
import { Sidebar } from '../components/shared';

<Sidebar 
  role={user.role} 
  open={sidebarOpen} 
  onClose={() => setSidebarOpen(false)} 
/>
```

## Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratio ≥ 4.5:1
- Focus indicators on all controls
- Screen reader compatible
- Alt text on images/icons

## Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- PWA with offline support
- Service worker caching
- Lazy loading for routes
- Memoization of expensive components

## Security Features

1. **No PII Collection**: Email is optional
2. **Anonymous Accounts**: Auto-generated usernames
3. **JWT Authentication**: Secure token-based auth
4. **HTTPS Only**: All API calls encrypted in transit
5. **XSS Protection**: Input sanitization
6. **CSRF Tokens**: For form submissions
7. **Rate Limiting**: Built into backend
8. **Secure Storage**: LocalStorage with encryption

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] Document preview and annotation
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] Advanced case filtering
- [ ] Lawyer rating system
- [ ] Case timeline visualization
- [ ] Export case data
- [ ] Two-factor authentication
- [ ] Biometric authentication (mobile)

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API Connection Issues
- Check VITE_API_URL in .env
- Verify backend is running
- Check CORS configuration
- Inspect browser console for errors

### Authentication Issues
- Clear localStorage
- Check JWT token expiration
- Verify backend auth endpoints
- Check network tab for 401 errors

## Contributing

When adding new features:
1. Follow existing file structure
2. Use TypeScript types
3. Follow design system colors/spacing
4. Add responsive breakpoints
5. Test on mobile devices
6. Update this README

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: https://github.com/dhamsey3/lehelp/issues
- Email: support@lehelp.org
