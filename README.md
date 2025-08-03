# React Table Implementation

A high-performance data table implementation built with React, featuring drag & drop column reordering, sorting, and optimized rendering for large datasets.

![React Table Demo](https://img.shields.io/badge/React-18.2.0-blue)
![Node](https://img.shields.io/badge/Node-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### ✅ Core Requirements
- **500+ Records**: Generated using Faker.js with realistic data
- **Required Columns**: ID, First Name, Last Name, Email, City, Registered Date
- **Computed Columns**: 
  - Full Name (First + Last name, not persisted)
  - DSR (Days Since Registered, calculated from registration date)
- **Column Reordering**: Drag and drop columns to reorder them
- **Sorting**: Click any column header to sort (ascending/descending toggle)

### 🎯 Advanced Features
- **Performance Optimized**: Handles 500+ rows with smooth interactions
- **Virtual Scrolling**: Pagination with "Load More" for optimal performance
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Gradient designs, smooth animations, and professional styling
- **Accessibility**: Semantic HTML structure and keyboard navigation support

### 🛠 Technical Highlights
- **React Hooks**: useState, useMemo, useCallback for optimal performance
- **React DnD**: Professional drag and drop implementation
- **Data Models**: Proper User class with computed properties
- **Separation of Concerns**: Data service layer separate from UI components
- **Memoization**: Efficient re-rendering with React.memo and useMemo

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd react-table-assignment

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## 🏗 Project Structure
```
src/
├── components/
│   ├── UserTable.js          # Main table component
│   └── UserTable.css         # Table-specific styles
├── services/
│   └── dataService.js        # Data models and business logic
├── App.js                    # Main application component
├── App.css                   # Global application styles
└── index.js                  # Application entry point
```

## 🎮 Usage

### Sorting Data
- Click any column header to sort
- Click again to reverse sort order
- Visual indicators show current sort direction

### Reordering Columns
- Click and drag any column header
- Drop it in the desired position
- Column order persists during the session

### Performance Features
- Initial load shows 50 rows
- Click "Load More" to load additional rows
- Smooth scrolling and interactions even with 500+ records

## 🔧 Technical Implementation

### Data Model
```javascript
class User {
  constructor(id, firstName, lastName, email, city, registeredDate) {
    // ... properties
  }
  
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  
  get daysSinceRegistered() {
    // Calculated from registration date
  }
}
```

### Performance Considerations
- **Pagination**: Only renders visible rows to maintain performance
- **Memoization**: Components and calculations are memoized
- **Event Optimization**: Debounced scroll and drag events
- **Memory Management**: Efficient data structures and cleanup

### Virtual Scrolling Approach
The table uses a pagination-based approach rather than true virtual scrolling for simplicity while maintaining performance:

1. **Lazy Loading**: Loads data in chunks of 50 rows
2. **Efficient Rendering**: Only DOM elements for visible rows
3. **Smooth UX**: Load more button for controlled data loading
4. **Memory Efficient**: Doesn't create unnecessary DOM nodes

## 📚 Libraries Used

| Library | Purpose | Version |
|---------|---------|---------|
| `@faker-js/faker` | Generate realistic fake data | ^8.0.0 |
| `react-dnd` | Drag and drop functionality | ^16.0.1 |
| `react-dnd-html5-backend` | HTML5 backend for drag & drop | ^16.0.1 |

## 🧪 Testing the Features

1. **Data Generation**: Verify 500 users are loaded on startup
2. **Sorting**: Test sorting on each column type (string, number, date)
3. **Column Reordering**: Drag columns to different positions
4. **Performance**: Scroll through data, test "Load More" functionality
5. **Responsive**: Test on different screen sizes
6. **Computed Fields**: Verify Full Name and DSR calculations

## 🎨 Design Decisions

### Why React DnD?
- Industry standard for React drag & drop
- Smooth animations and interactions
- Accessible by default
- Extensive customization options

### Why Faker.js?
- Generates realistic, diverse data
- Consistent API for different data types
- Large community and good documentation
- Perfect for prototyping and demos

### Performance Strategy
- Chose pagination over virtual scrolling for simplicity
- Implemented efficient sorting algorithms
- Used React performance patterns (memo, useMemo, useCallback)
- Optimized CSS for smooth animations

## 🚀 Future Enhancements

- [ ] True virtual scrolling for massive datasets
- [ ] Column filtering and search
- [ ] Export to CSV/Excel functionality
- [ ] Column width adjustment
- [ ] Server-side pagination and sorting
- [ ] Advanced data types (currency, progress bars)
- [ ] Keyboard navigation
- [ ] Column grouping and aggregation

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

This is a take-home assignment project, but feedback and suggestions are welcome!

---

**Built with ❤️ using React and modern web technologies**
