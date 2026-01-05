# Oracle Database Interface - BookingManager

A simple and elegant web interface for interacting with Oracle Database as the BookingManager user.

## Features

- **Top-Rated Drivers Display**: Shows drivers with ≥4.5 rating and >10 rides this month
- **Responsive Design**: Clean, modern interface that works on all devices
- **Admin Dashboard**: Browse and view all accessible database tables
- **Real-time Data**: Dynamic loading with error handling
- **Secure API**: Protected against SQL injection

## Project Structure

```
oracle-interface/
├── index.html          # Main frontend page
├── styles.css          # Responsive CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Node.js/Express backend
├── package.json        # Dependencies
├── .env.example        # Environment configuration template
└── README.md          # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Oracle Database with BookingManager user
- Oracle Instant Client (for oracledb package)

### 1. Install Dependencies

```bash
cd oracle-interface
npm install
```

### 2. Configure Database

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_PASSWORD=your_booking_manager_password
DB_CONNECTION=localhost:1521/XE
PORT=3000
```

### 3. Database Schema Requirements

The application expects these tables with BookingManager access:

```sql
-- Drivers table
CREATE TABLE drivers (
    driver_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL
);

-- Rides table
CREATE TABLE rides (
    ride_id NUMBER PRIMARY KEY,
    driver_id NUMBER REFERENCES drivers(driver_id),
    rating NUMBER(2,1),
    ride_date DATE,
    status VARCHAR2(20)
);
```

### 4. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/top-drivers` - Returns top-rated drivers
- `GET /api/tables` - Lists all accessible tables
- `GET /api/table/:tableName` - Returns data from specific table
- `GET /api/health` - Database connection health check

## Usage

### Main Dashboard
- Automatically loads and displays top-rated drivers
- Shows driver name, total rides, and average rating
- Responsive card layout with star ratings

### Admin Dashboard
1. Click "Admin Dashboard" button
2. Click "Load Tables" to see available tables
3. Select a table from dropdown to view its data
4. Data is displayed in a scrollable table format

## Error Handling

- Database connection failures are gracefully handled
- Empty results show appropriate messages
- SQL injection protection on table names
- Connection pooling for better performance

## Security Features

- CORS enabled for cross-origin requests
- SQL injection protection
- Input validation on table names
- Connection pooling with proper cleanup

## Customization

### Styling
Modify `styles.css` to change the appearance:
- Color scheme in CSS variables
- Grid layout for driver cards
- Modal styling for admin dashboard

### Database Queries
Update queries in `server.js`:
- Modify the top drivers query criteria
- Add new API endpoints
- Change table access permissions

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Oracle DB is running
   - Verify credentials in `.env`
   - Ensure Oracle Instant Client is installed

2. **No Drivers Found**
   - Check if rides table has recent data
   - Verify rating and ride count criteria
   - Ensure COMPLETED status exists

3. **Tables Not Loading**
   - Verify BookingManager has table access
   - Check user_tables view permissions

### Development Mode

For development with auto-restart:
```bash
npm install -g nodemon
nodemon server.js
```

## Performance Notes

- Connection pooling (2-10 connections)
- Query limits (100 rows max for table views)
- Efficient indexes recommended on:
  - rides.driver_id
  - rides.ride_date
  - rides.status

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - Feel free to modify and distribute.