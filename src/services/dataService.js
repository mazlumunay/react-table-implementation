import { faker } from '@faker-js/faker';

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
}

// Generate fake user data
export const generateFakeUsers = (count = 500) => {
  const users = [];
  
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

// Simulate data persistence (using memory for this demo)
class DataService {
  constructor() {
    this.users = this.loadUsers();
  }

  loadUsers() {
    // In a real app, this would load from localStorage or API
    return generateFakeUsers(500);
  }

  getUsers() {
    return this.users;
  }

  // Method to sort users by a specific field
  sortUsers(field, direction = 'asc') {
    return [...this.users].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle computed properties
      if (field === 'fullName') {
        aVal = a.fullName;
        bVal = b.fullName;
      } else if (field === 'daysSinceRegistered') {
        aVal = a.daysSinceRegistered;
        bVal = b.daysSinceRegistered;
      }

      // Handle different data types
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }
}

export const dataService = new DataService();