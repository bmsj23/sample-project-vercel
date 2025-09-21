# StudySpot PH - Study Space Booking Platform in the PH

A comprehensive React single-page application (SPA) for booking co-working spaces and study hubs across the Philippines.

## 🚀 Teknolojia

### ✅ Core Requirements

- **Homepage with Search**: Browse all study spaces with functional search by name or location
- **12 Study Spaces**: Complete dataset with 12 diverse study spaces across different cities
- **Space Detail Pages**: Dynamic routing (`/space/:spaceId`) with detailed space information
- **Date & Time Booking System**: Users can select future dates and available time slots
- **Authentication System**: Context API-based authentication with predefined credentials
- **Protected Routes**: Dashboard accessible only to logged-in users
- **Booking Management**: Complete CRUD operations for bookings
- **Confirmation Modals**: Modal confirmations before booking cancellations
- **Data Persistence**: localStorage integration for user sessions and bookings
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### 🔧 Additional Features

- **Back Navigation**: "Back" button on space detail pages
- **Fixed Card Layout**: Consistent card heights with fixed button positions
- **User Profile**: Dashboard with user information and logout functionality
- **Booking History**: Complete booking history tracking
- **Loading States**: Smooth loading animations and states
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Ark

### Component Structure
```
src/
├── components/
│   ├── Header.jsx              # Navigation header
│   ├── BookingForm.jsx         # Date & time booking form
│   ├── ProtectedRoute.jsx      # Route protection
│   └── ConfirmationModal.jsx   # Modal for confirmations
├── pages/
│   ├── HomePage.jsx            # Main homepage with search
│   ├── SpaceDetailPage.jsx     # Individual space details
│   ├── LoginPage.jsx           # Authentication page
│   └── DashboardPage.jsx       # User dashboard
├── contexts/
│   ├── AuthContext.jsx         # Authentication state management
│   ├── BookingContext.jsx      # Booking state management
│   └── contexts.js             # Context definitions
├── hooks/
│   ├── useLocalStorage.js      # localStorage custom hook
│   └── useContexts.js          # Context hooks
├── data/
│   └── spaces.json            # Study spaces dataset (10 spaces)
└── utils/
    └── axiosInstance.js       # HTTP client configuration
```

### State Management
- **Context API** for global state (authentication, bookings)
- **Local Storage** for data persistence
- **Custom Hooks** for reusable logic

## 🔐 Authentication

**Demo Credentials:**
- Username: `user`
- Password: `123`

Any other credentials will result in authentication failure.

## 💾 Data Persistence

- User login status persists across browser refreshes
- All bookings are saved to localStorage
- Data survives browser sessions

## 🎯 User Flow

1. **Browse Spaces**: View all available study spaces on homepage
2. **Search**: Filter spaces by name or location using search bar
3. **View Details**: Click on any space to see detailed information
4. **Login**: Authenticate using demo credentials to access booking
5. **Book Space**: Select date and time slot, confirm booking
6. **Manage Bookings**: Access dashboard to view and cancel bookings
7. **Profile**: View user information and logout

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

4. **Login with demo credentials:**
   - Username: `user`
   - Password: `123`

## 🛠️ Technical Implementation

### React Concepts Demonstrated

- **Component-Based Architecture**: Modular, reusable components
- **State Management**: useState, useContext, custom hooks
- **Effects**: useEffect for data fetching and side effects  
- **Routing**: react-router-dom with dynamic and protected routes
- **Form Handling**: Controlled components with validation
- **Context API**: Global state management without external libraries

---

## 📝 Dev Notes

This project demonstrates comprehensive React development skills including component architecture, state management, routing, form handling, and modern development practices. All core requirements have been successfully implemented with additional enhancements for better user experience.
