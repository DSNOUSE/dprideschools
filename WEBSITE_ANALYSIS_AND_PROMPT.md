# DPRIDE International School Website Analysis & Generation Prompt

## Website Analysis Summary

### Tech Stack
- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Database**: PostgreSQL with Prisma ORM
- **CMS**: Sanity CMS for content management
- **Authentication**: NextAuth.js with credentials provider
- **UI Components**: Material-UI (MUI) components, custom components
- **Fonts**: Lato Google Font (weights 400, 700)
- **Image Optimization**: Next.js Image component with WebP/AVIF support

### Architecture Overview
- **Admin Portal**: Protected admin area with RBAC (Role-Based Access Control)
- **Public Website**: School information and marketing pages
- **Database Schema**: Comprehensive academic management system
- **Content Management**: Sanity Studio mounted at `/admin/studio`

### Design System & Visual Identity

#### Color Palette
- **Primary**: Blue tones (#1e3a8a, #2563eb)
- **Accent**: Amber (#f59e0b)
- **Brand Colors**: 
  - Hero overlay: Dark red gradient (#800909b3 to #6a0404b3)
  - Yellow accent for branding (#fbbf24)
- **Background**: Subtle pattern with 0.1 opacity

#### Typography
- **Font Family**: Lato (Google Fonts)
- **Hierarchy**: 
  - Hero titles: 4xl → 6xl → 7xl (responsive)
  - Section headers: 4xl → 5xl
  - Body text: Base size with gray tones
- **Text Effects**: Uppercase branding, letter spacing, text shadows

#### Layout Patterns
- **Hero Section**: Full-screen with background image, gradient overlay, centered branding
- **Navigation**: Sticky header with glass morphism effect, scroll-based transparency
- **Content Sections**: Container-based with consistent spacing (py-12 to py-20)
- **Card Components**: Rounded corners, shadows, hover animations
- **Grid Systems**: Responsive 2-4 column layouts

#### Interactive Elements
- **Buttons**: Glass morphism with backdrop blur, hover scale effects
- **Cards**: Hover lift animations, shadow transitions
- **Navigation**: Mobile-responsive hamburger menu
- **Quick Links**: Icon-based grid with gradient backgrounds

### Component Architecture

#### Core Components
1. **Navbar**: Sticky navigation with scroll effects and mobile menu
2. **Hero**: Full-screen banner with logo and title
3. **Welcome**: Headteacher message section
4. **SchoolLevels**: Educational stages presentation
5. **News**: Dynamic news feed from Sanity
6. **Footer**: Standard footer layout

#### Layout Components
- **Container**: Responsive wrapper with max-width constraints
- **SectionHeader**: Reusable section titles with optional descriptions
- **Providers**: NextAuth and other context providers

### Database Schema Highlights

#### User Management
- **Users**: Authentication with role-based permissions
- **Roles**: Hierarchical permission system
- **Parents**: Separate parent accounts with student relationships

#### Academic Structure
- **Departments**: Organizational units
- **Classes**: Class assignments by department
- **Subjects**: Subject management with scoring
- **Terms/Sessions**: Academic periods

#### Student Management
- **Students**: Comprehensive student records
- **Grades**: Subject-specific assessments
- **Results**: Overall academic performance
- **GradeScale**: Standardized grading system

### Content Management (Sanity CMS)
- **Homepage**: Dynamic hero, welcome message, news
- **News**: Article management
- **Admissions**: Application process content
- **Open Mornings**: Event management
- **Newsletter**: Subscription management

---

## Comprehensive Website Generation Prompt

Create a modern educational institution website with the following specifications:

### Technical Requirements

#### Framework & Setup
- Use Next.js 16+ with App Router and TypeScript
- Implement Tailwind CSS v4 for styling
- Set up PostgreSQL database with Prisma ORM
- Configure Sanity CMS for content management
- Implement NextAuth.js for authentication
- Use Material-UI components where appropriate

#### Core Features
1. **Public Website**:
   - Hero section with school branding
   - Navigation with scroll effects
   - School information pages
   - News and events section
   - Contact and admissions information

2. **Admin Portal**:
   - Role-based access control
   - Content management via Sanity Studio
   - Student management system
   - Academic results tracking
   - Parent portal access

3. **Database Schema**:
   - User authentication and roles
   - Student records and academic data
   - Subject and class management
   - Grade and result tracking
   - Parent-student relationships

### Design Specifications

#### Visual Identity
- **Color Scheme**: 
  - Primary: Blue (#1e3a8a, #2563eb)
  - Accent: Amber (#f59e0b)
  - Brand gradient: Dark red overlays for hero sections
  - Background: Subtle patterns with low opacity
- **Typography**: Lato font family, clean hierarchy
- **Layout**: Container-based responsive design
- **Animations**: Subtle hover effects, smooth transitions

#### Component Requirements
1. **Navigation**:
   - Sticky header with glass morphism
   - Mobile-responsive hamburger menu
   - Scroll-based transparency changes
   - Quick access to main sections

2. **Hero Section**:
   - Full-screen background image
   - Gradient overlay for text readability
   - School logo and prominent title
   - Call-to-action buttons

3. **Content Sections**:
   - Welcome message from headteacher
   - School levels and programs
   - News and events feed
   - Quick links grid with icons
   - Features and benefits showcase

4. **Interactive Elements**:
   - Hover animations on cards
   - Smooth scroll navigation
   - Responsive image galleries
   - Contact forms

### Page Structure

#### Required Pages
- **Homepage**: Hero, welcome, news, quick links
- **About/Our School**: School information, history, mission
- **Academics**: Programs, curriculum, departments
- **Admissions**: Application process, requirements
- **News/Events**: Dynamic content from CMS
- **Contact**: Location, contact form, information
- **Admin Portal**: Protected area for management

#### Admin Features
- **Dashboard**: Overview and quick stats
- **Student Management**: CRUD operations for students
- **Academic Records**: Grades, results, reports
- **Content Management**: Sanity Studio integration
- **User Management**: Roles and permissions

### Development Guidelines

#### Best Practices
- Implement proper error boundaries
- Use TypeScript for type safety
- Optimize images with Next.js Image component
- Ensure mobile-first responsive design
- Implement proper SEO meta tags
- Use semantic HTML5 elements

#### Performance Optimization
- Enable image optimization (WebP/AVIF)
- Implement proper caching strategies
- Use React.memo for expensive components
- Optimize bundle size with dynamic imports
- Implement lazy loading for heavy components

#### Security Considerations
- Implement proper authentication flows
- Sanitize user inputs
- Use environment variables for secrets
- Implement CSRF protection
- Secure API endpoints with proper validation

### Content Structure

#### Homepage Sections
1. **Hero**: School branding with background
2. **Welcome**: Headteacher message
3. **Quick Links**: Icon-based navigation
4. **Features**: Why choose the school
5. **News**: Latest updates and events
6. **Activities**: Co-curricular programs
7. **CTA**: Admissions call-to-action

#### CMS Schema (Sanity)
- **Homepage**: Editable hero title, welcome message, news items
- **News**: Articles with images, dates, categories
- **Events**: Calendar events with details
- **Pages**: Static content management
- **Media**: Image and file uploads

### Deployment & Environment

#### Required Environment Variables
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=your-dataset
SANITY_PREVIEW_SECRET=your-preview-secret
```

#### Build & Deployment
- Optimize for production builds
- Configure database migrations
- Set up CMS deployment
- Implement proper error monitoring
- Configure analytics tracking

### Customization Guidelines

#### Brand Adaptation
- Replace school name and branding elements
- Adjust color scheme to match brand guidelines
- Update logo and image assets
- Customize content to reflect school values
- Adapt academic structure as needed

#### Feature Extensions
- Add parent portal functionality
- Implement online payment systems
- Create student dashboards
- Add communication features
- Implement reporting systems

This prompt provides a comprehensive foundation for creating a modern educational institution website with full content management capabilities, student information systems, and professional design aesthetics.
