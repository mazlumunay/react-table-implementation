import { faker } from '@faker-js/faker';

// Enhanced date formatting utility
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// User data model
export class User {
  constructor(id, firstName, lastName, email, city, registeredDate) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.city = city;
    this.registeredDate = registeredDate;
  }

  // Computed property - Full Name (not persisted)
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Computed property - Days Since Registered (DSR)
  get daysSinceRegistered() {
    const today = new Date();
    const registeredDate = new Date(this.registeredDate);
    const diffTime = Math.abs(today - registeredDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Additional utility methods
  get registrationYear() {
    return new Date(this.registeredDate).getFullYear();
  }

  get emailDomain() {
    return this.email.split('@')[1];
  }

  // Method to get user as plain object (for export functionality)
  toPlainObject() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      email: this.email,
      city: this.city,
      registeredDate: formatDate(this.registeredDate),
      daysSinceRegistered: this.daysSinceRegistered
    };
  }
}

// Enhanced fake user data generation with more realistic data
export const generateFakeUsers = (count = 500) => {
  const users = [];
  
  // Set seed for consistent data in development
  faker.seed(12345);
  
  for (let i = 1; i <= count; i++) {
    const user = new User(
      i,
      faker.person.firstName(),
      faker.person.lastName(),
      faker.internet.email(),
      faker.location.city(),
      faker.date.between({ 
        from: new Date('2020-01-01'), 
        to: new Date() 
      }).toISOString()
    );
    users.push(user);
  }
  
  return users;
};

// Enhanced data service with improved sorting, filtering, and export capabilities
class DataService {
  constructor() {
    this.users = this.loadUsers();
    this.sortCache = new Map(); // Cache for performance
  }

  loadUsers() {
    // In a real app, this would load from localStorage, IndexedDB, or API
    return generateFakeUsers(500);
  }

  getUsers() {
    return this.users;
  }

  // Enhanced sorting method with caching and better type handling
  sortUsers(field, direction = 'asc', usersToSort = null) {
    const users = usersToSort || this.users;
    const cacheKey = `${field}-${direction}-${users.length}`;
    
    // Return cached result if available and using full dataset
    if (!usersToSort && this.sortCache.has(cacheKey)) {
      return this.sortCache.get(cacheKey);
    }

    const sortedUsers = [...users].sort((a, b) => {
      let aVal = this.getSortValue(a, field);
      let bVal = this.getSortValue(b, field);

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? 1 : -1;
      if (bVal == null) return direction === 'asc' ? -1 : 1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Date comparison
      if (field === 'registeredDate') {
        const dateA = new Date(aVal);
        const dateB = new Date(bVal);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // String comparison (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Cache the result only for full dataset sorts
    if (!usersToSort) {
      this.sortCache.set(cacheKey, sortedUsers);
      
      // Limit cache size to prevent memory leaks
      if (this.sortCache.size > 20) {
        const firstKey = this.sortCache.keys().next().value;
        this.sortCache.delete(firstKey);
      }
    }

    return sortedUsers;
  }

  // Helper method to get sort value including computed properties
  getSortValue(user, field) {
    switch (field) {
      case 'fullName':
        return user.fullName;
      case 'daysSinceRegistered':
        return user.daysSinceRegistered;
      default:
        return user[field];
    }
  }

  // Method to filter users (for future enhancements)
  filterUsers(filterFn) {
    return this.users.filter(filterFn);
  }

  // Enhanced search method with multiple field support
  searchUsers(query, fields = ['firstName', 'lastName', 'email', 'city', 'fullName']) {
    if (!query || query.trim() === '') return this.users;
    
    const searchTerms = query.toLowerCase().trim().split(' ').filter(term => term.length > 0);
    
    return this.users.filter(user => {
      return searchTerms.every(searchTerm => {
        return fields.some(field => {
          const value = this.getSortValue(user, field);
          return value && value.toString().toLowerCase().includes(searchTerm);
        });
      });
    });
  }

  // Method to get user statistics (for future dashboard features)
  getUserStats() {
    const totalUsers = this.users.length;
    const avgDaysSinceRegistered = Math.round(
      this.users.reduce((sum, user) => sum + user.daysSinceRegistered, 0) / totalUsers
    );
    
    const registrationYears = {};
    this.users.forEach(user => {
      const year = user.registrationYear;
      registrationYears[year] = (registrationYears[year] || 0) + 1;
    });

    const topCities = {};
    this.users.forEach(user => {
      topCities[user.city] = (topCities[user.city] || 0) + 1;
    });

    return {
      totalUsers,
      avgDaysSinceRegistered,
      registrationYears,
      topCities: Object.entries(topCities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [city, count]) => ({ ...obj, [city]: count }), {})
    };
  }

  // Enhanced export method with support for filtered data
  exportUsers(format = 'json', usersToExport = null) {
    const users = usersToExport || this.users;
    const userData = users.map(user => user.toPlainObject());
    
    if (format === 'csv') {
      if (userData.length === 0) {
        return 'No data to export';
      }
      
      const headers = Object.keys(userData[0]);
      const csvRows = [
        // Header row
        headers.join(','),
        // Data rows
        ...userData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];
      
      return csvRows.join('\n');
    }
    
    if (format === 'json') {
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        totalRecords: userData.length,
        data: userData
      }, null, 2);
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }

  // Method to export user statistics
  exportStats(format = 'json') {
    const stats = this.getUserStats();
    
    if (format === 'csv') {
      const csvData = [
        'Metric,Value',
        `Total Users,${stats.totalUsers}`,
        `Average Days Since Registration,${stats.avgDaysSinceRegistered}`,
        '',
        'Registration Year,Count',
        ...Object.entries(stats.registrationYears).map(([year, count]) => 
          `${year},${count}`
        ),
        '',
        'Top Cities,Count',
        ...Object.entries(stats.topCities).map(([city, count]) => 
          `${city},${count}`
        )
      ].join('\n');
      
      return csvData;
    }
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      statistics: stats
    }, null, 2);
  }

  // Clear cache method
  clearCache() {
    this.sortCache.clear();
  }

  // Method to validate export data
  validateExportData(users) {
    if (!Array.isArray(users)) {
      throw new Error('Export data must be an array');
    }
    
    if (users.length === 0) {
      console.warn('Exporting empty dataset');
      return true;
    }
    
    // Check if all users have required fields
    const requiredFields = ['id', 'firstName', 'lastName', 'email', 'city'];
    const invalidUsers = users.filter(user => 
      !requiredFields.every(field => user[field] != null)
    );
    
    if (invalidUsers.length > 0) {
      console.warn(`Found ${invalidUsers.length} users with missing required fields`);
    }
    
    return true;
  }

  // Utility method to get export filename with timestamp
  getExportFilename(baseFilename, format, includeTimestamp = true) {
    const timestamp = includeTimestamp 
      ? `-${new Date().toISOString().split('T')[0]}`
      : '';
    return `${baseFilename}${timestamp}.${format}`;
  }
}

export const dataService = new DataService();