# JoyDrive - Ride Sharing Application

A modern ride-sharing application built with React, TypeScript, Vite, and TailwindCSS.

## Features

- 🗺️ Real-time Google Maps integration
- 🚗 Ride booking and tracking
- 💳 Payment processing
- 🤖 AI-powered recommendations (Google Gemini)
- 🔐 User authentication with Supabase
- 📱 Responsive mobile-first design
- ✨ Smooth animations with Framer Motion

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS 4
- **Maps**: Google Maps API
- **Backend**: Supabase
- **AI**: Google Gemini API
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm/pnpm
- Google Maps API Key
- Google Gemini API Key
- Supabase project (URL and Anon Key)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd joydrive
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API keys:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
GEMINI_API_KEY=your-gemini-key
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deployment on Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on push
4. Add environment variables in Vercel project settings

## Environment Variables

Add these to your Vercel project settings:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps API key
- `GEMINI_API_KEY` - Your Google Gemini API key

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utility functions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## License

Apache-2.0

## Support

For issues and questions, please open an issue on GitHub.
