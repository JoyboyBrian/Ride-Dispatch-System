# Ride Dispatch System - Frontend

Next.js-based frontend application for the Ride Dispatch System with real-time visualization and interactive controls.

## 🚀 Features

### Core Features

- **Real-time Grid Visualization**: 100x100 city grid with dynamic entity positioning
- **Interactive Entity Management**: Add/remove drivers and riders with coordinate input
- **Request Management**: Create ride requests and dispatch assignments
- **Time Control**: Manual time advancement with tick-based simulation
- **System Monitoring**: Real-time status display and activity logging

### Technical Features

- **Next.js 14**: Latest React framework with App Router
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Modern, responsive styling
- **Real-time Updates**: Automatic data refresh and state management
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── GridVisualization.tsx    # Grid display component
│   ├── ControlPanel.tsx         # Interactive controls
│   ├── StatusPanel.tsx          # System status display
│   └── ActivityLog.tsx          # Activity logging
├── package.json           # Dependencies and scripts
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── postcss.config.js      # PostCSS configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend service running on http://localhost:8000

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎮 Usage

### Grid Visualization

- **Green dots**: Available drivers
- **Yellow dots**: Drivers on trip
- **Gray dots**: Offline drivers
- **Red dots**: Riders
- **Cyan dots**: Pickup points
- **Purple dots**: Dropoff points
- **Hover tooltips**: Show entity details and coordinates

### Control Panel

1. **Driver Management**: Add drivers at specific coordinates
2. **Rider Management**: Add riders with pickup and dropoff locations
3. **Request Creation**: Select riders and create ride requests
4. **Dispatch Control**: Trigger driver assignment algorithm
5. **Time Control**: Advance simulation time manually

### Status Monitoring

- **Driver Statistics**: Total, available, on-trip, and offline counts
- **Request Statistics**: Waiting, assigned, completed, and failed counts
- **Real-time Updates**: Automatic refresh of system status
- **Activity Log**: Comprehensive operation history

## 🔧 Configuration

### API Configuration

The frontend automatically connects to the backend API. Configuration is in `next.config.js`:

```javascript
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://localhost:8000/:path*",
    },
  ];
}
```

### Environment Variables

Create `.env.local` for environment-specific configuration:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🧩 Components

### GridVisualization

- Displays 100x100 city grid
- Shows all entities with color-coded status
- Interactive hover tooltips
- Real-time position updates
- Legend for entity types

### ControlPanel

- Driver management controls
- Rider management interface
- Request creation form
- Dispatch and time control buttons
- Form validation and error handling

### StatusPanel

- Real-time system statistics
- Driver and request counts
- Visual status indicators
- Summary metrics display

### ActivityLog

- Operation history logging
- Timestamped entries
- Scrollable log display
- Entry count tracking

## 🎨 Styling

### Design System

- **Color Scheme**: Blue/purple gradient theme
- **Typography**: Inter font family
- **Spacing**: Consistent Tailwind spacing scale
- **Components**: Reusable UI components with consistent styling

### Responsive Design

- **Desktop**: Full-featured layout with side-by-side panels
- **Tablet**: Responsive grid layout
- **Mobile**: Stacked layout for smaller screens

## 🔍 Development

### Development Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

### Code Structure

- **TypeScript**: Full type safety for all components
- **React Hooks**: State management with useState and useEffect
- **Async Operations**: Proper error handling for API calls
- **Component Composition**: Modular, reusable components

## 🧪 Testing

### Manual Testing

1. Start backend service
2. Start frontend development server
3. Test all interactive features
4. Verify real-time updates
5. Check responsive design

### Build Testing

```bash
npm run build
npm start
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Configuration

- Set `NEXT_PUBLIC_API_BASE_URL` for production backend
- Configure `next.config.js` for production API routing
- Update CORS settings if needed

## 🔧 Troubleshooting

### Common Issues

1. **API Connection**: Ensure backend is running on port 8000
2. **Build Errors**: Check TypeScript and dependency versions
3. **Styling Issues**: Verify Tailwind CSS configuration
4. **Performance**: Monitor bundle size and optimize if needed

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📚 API Integration

### Backend Communication

- **RESTful API**: All backend communication via REST
- **Error Handling**: Comprehensive error handling for API failures
- **Loading States**: User feedback during API operations
- **Real-time Updates**: Automatic data refresh after operations

### API Endpoints Used

- `GET /api/drivers` - Fetch all drivers
- `POST /api/drivers` - Create new driver
- `DELETE /api/drivers/{id}` - Remove driver
- `GET /api/riders` - Fetch all riders
- `POST /api/riders` - Create new rider
- `DELETE /api/riders/{id}` - Remove rider
- `GET /api/requests` - Fetch all requests
- `POST /api/requests` - Create new request
- `POST /api/dispatch` - Execute dispatch algorithm
- `POST /api/tick` - Advance simulation time
- `GET /api/status` - Get system status
- `POST /api/init-sample-data` - Initialize sample data

## 🔮 Future Enhancements

### Planned Features

- **Real-time WebSocket**: Live position updates
- **Advanced Visualizations**: Trip paths and heat maps
- **User Authentication**: Login and user management
- **Mobile App**: React Native version
- **Offline Support**: Service worker for offline functionality
- **Advanced Analytics**: Detailed performance metrics

### Technical Improvements

- **State Management**: Redux or Zustand for complex state
- **Testing Framework**: Jest and React Testing Library
- **Performance Optimization**: Code splitting and lazy loading
- **Accessibility**: ARIA labels and keyboard navigation
- **Internationalization**: Multi-language support
