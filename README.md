# Weather App (Atmos)

A stunning, responsive weather application built with React, Vite, and Tailwind CSS. It provides real-time weather data and historical trends using the Open-Meteo API.

## Features

- **Real-time Weather**: Current temperature, precipitation, humidity, and UV index.
- **Historical Data**: View weather trends for past dates.
- **Responsive Design**: Optimized for both desktop and mobile devices with a premium aesthetic.
- **Interactive Charts**: Visual representations of weather data using Recharts.
- **No API Key Required**: Uses public Open-Meteo APIs.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion, Lucide React
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Components**: Radix UI (via shadcn/ui)

## Local Setup

This project uses `npm` and has been cleaned of unnecessary dependencies and environment-specific configurations.

### Prerequisites

- **Node.js**: Version 20.19+ or 22.12+ (Note: If you are on an older Node 20 version, Vite 6 has been configured for compatibility).

### Installation

1. Clone or download the project.
2. Open a terminal in the `weather-app` directory.
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000` (or the next available port).

## Project Structure

- `src/`: Core application logic and components.
- `public/`: Static assets.
- `vite.config.ts`: Vite configuration (optimized for local run, standard npm setup).
- `package.json`: Project manifest and scripts.
