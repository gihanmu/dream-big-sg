# Dream Big SG: Superhero Edition

A kid-friendly, animated web app where children imagine their future careers as superheroes building Singapore. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion, powered by Google Imagen for AI-generated posters.

## 🎯 Product Vision

Create a kid-friendly, animated web app where children imagine their future careers as superheroes building Singapore. The flow includes login → motivational home → "dream builder" form → AI-generated comic-style poster → save, print, and gallery features.

## ✨ Features

### Core Functionality
- **Login System**: Hardcoded credentials for demo (username: `superkid`, password: `buildSG`)
- **Interactive Carousel**: Auto-rotating slides featuring Singapore heroes
- **Dream Builder**: Multi-step form for career, location, and activity selection
- **Camera Integration**: Take selfies or choose cartoon avatars
- **AI Poster Generation**: Google Imagen creates comic-style superhero posters
- **Gallery System**: Save and manage generated posters locally
- **Print & Download**: Print posters or save as PNG files

### Technical Features
- **Accessibility**: Full keyboard navigation, screen reader support, reduced motion preferences
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Security**: Rate limiting, input sanitization, EXIF stripping
- **Performance**: Optimized animations, lazy loading, efficient state management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud Project with Vertex AI enabled
- Google Cloud Service Account with Vertex AI permissions

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd dream-big-sg
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Google Cloud credentials:
   ```env
   GOOGLE_PROJECT_ID=your-google-cloud-project-id
   GOOGLE_LOCATION=us-central1
   IMAGEN_MODEL_ID=imagen-3.0-generate-002
   GOOGLE_VERTEX_CREDENTIALS_JSON='{"type":"service_account",...}'
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Form Validation**: Zod
- **AI Integration**: Google Vertex AI (Imagen)
- **File Handling**: file-type for security validation

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page with carousel
│   ├── dream/             # Dream builder form
│   ├── result/            # Poster display and actions
│   ├── gallery/           # Poster gallery
│   └── api/imagen/        # Server-side AI integration
├── components/            # Reusable UI components
│   ├── LoginCarousel.tsx  # Career showcase carousel
│   ├── AuthCard.tsx       # Login form component
│   ├── Camera.tsx         # Camera/avatar selection
│   └── PosterFrame.tsx    # Poster display frame
└── lib/                   # Utility functions
    ├── auth.ts            # Authentication logic
    ├── prompts.ts         # AI prompt templates
    ├── store.ts           # State management
    └── security.ts        # Security utilities
```

## 🎨 User Journey

1. **Login Page**: Animated carousel showcasing Singapore careers with hardcoded login
2. **Home Dashboard**: Welcome message with uplifting animations
3. **Dream Builder**: 4-step form process:
   - Choose career (doctor, teacher, engineer, etc.)
   - Select Singapore location (Gardens by the Bay, Marina Bay Sands, etc.)
   - Describe activity (free text input)
   - Take selfie or choose avatar
4. **Poster Generation**: AI creates comic-style poster with Singapore elements
5. **Result Page**: Display poster with save, print, regenerate options
6. **Gallery**: View all created posters with management features

## 🔐 Security Features

- **Input Sanitization**: XSS prevention for all user inputs
- **Rate Limiting**: API request throttling (5 requests/minute)
- **File Validation**: Image type and size checking
- **EXIF Stripping**: Privacy protection for uploaded images
- **Environment Validation**: Secure credential management
- **Server-side Processing**: All AI API calls handled securely

## 🎯 Login Credentials

For demo purposes, use these hardcoded credentials:
- **Username**: `superkid`
- **Password**: `buildSG`

## 📱 Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile browsers (iOS Safari, Android Chrome)

## ♿ Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and descriptions
- Respects `prefers-reduced-motion`
- High contrast color schemes
- Focus indicators for interactive elements

## 🎨 Carousel Content

The login carousel features 7 Singapore hero professions:
1. **Red Lions Parachuting** - Courage
2. **Healthcare Heroes** - Care
3. **Inspiring Teachers** - Knowledge
4. **Engineers & Builders** - Build
5. **Scientists & Researchers** - Invent
6. **Essential Workers** - Respect
7. **Transport Heroes** - Connect

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

Ensure environment variables are configured in your deployment platform.

## 📝 License

This project is created for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ for Singapore's young heroes!** 🦸‍♂️🦸‍♀️🏙️
