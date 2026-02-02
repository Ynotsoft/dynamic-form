// Mock API with sample user data for testing search functionality

import { use } from "react";

const mockUsers = [
  { userId: "1", name: "John Doe", email: "john.doe@example.com", role: "Developer" },
  { userId: "3", name: "Michael Johnson", email: "michael.j@example.com", role: "Manager" },
  { id: "4", name: "Sarah Williams", email: "sarah.w@example.com", role: "Developer" },
  { id: "5", name: "David Brown", email: "david.b@example.com", role: "Analyst" },
  { id: "6", name: "Emily Davis", email: "emily.d@example.com", role: "Designer" },
  { id: "7", name: "Robert Miller", email: "robert.m@example.com", role: "Developer" },
  { id: "8", name: "Jennifer Wilson", email: "jennifer.w@example.com", role: "Manager" },
  { id: "9", name: "Christopher Moore", email: "chris.m@example.com", role: "Developer" },
  { id: "10", name: "Amanda Taylor", email: "amanda.t@example.com", role: "Analyst" },
  { id: "11", name: "Daniel Anderson", email: "daniel.a@example.com", role: "Designer" },
  { id: "12", name: "Michelle Thomas", email: "michelle.t@example.com", role: "Developer" },
  { id: "13", name: "James Jackson", email: "james.j@example.com", role: "Manager" },
  { id: "14", name: "Lisa White", email: "lisa.w@example.com", role: "Analyst" },
  { id: "15", name: "Matthew Harris", email: "matthew.h@example.com", role: "Developer" },
  { id: "16", name: "Ashley Martin", email: "ashley.m@example.com", role: "Designer" },
  { id: "17", name: "Joshua Thompson", email: "joshua.t@example.com", role: "Developer" },
  { id: "18", name: "Jessica Garcia", email: "jessica.g@example.com", role: "Manager" },
  { id: "19", name: "Andrew Martinez", email: "andrew.m@example.com", role: "Analyst" },
  { id: "20", name: "Stephanie Robinson", email: "stephanie.r@example.com", role: "Designer" },
  { id: "21", name: "Kevin Clark", email: "kevin.c@example.com", role: "Developer" },
  { id: "22", name: "Laura Rodriguez", email: "laura.r@example.com", role: "Manager" },
  { id: "23", name: "Brian Lewis", email: "brian.l@example.com", role: "Analyst" },
  { id: "24", name: "Nicole Lee", email: "nicole.l@example.com", role: "Designer" },
  { id: "25", name: "Ryan Walker", email: "ryan.w@example.com", role: "Developer" },
];

/**
 * Mock API client that simulates a real API with search functionality
 * @param {string} url - The API endpoint URL (e.g., "/api/users/search?q=john")
 * @param {string} valueIdField - The field name to use as the ID (e.g., "userId", "id", "empId")
 * @returns {Promise<{data: Array}>} - Returns filtered user data
 */
export const mockApiClient = async (url, valueIdField = 'id') => {
  // Simulate network delay (300-800ms)
  const delay = Math.random() * 500 + 300;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Parse the URL to extract search parameters
  const urlObj = new URL(url, 'http://localhost');
  const searchTerm = urlObj.searchParams.get('q') || 
                     urlObj.searchParams.get('search') || 
                     urlObj.searchParams.get('query') || '';
  
  // If no search term, return all users
  if (!searchTerm || searchTerm.trim() === '') {
    return { 
      data: mockUsers
        .filter(user => user[valueIdField] !== undefined) // Only include users with the specified ID field
        .map(user => ({
          value: user[valueIdField],
          label: `${user.name} (${user.role})`,
          email: user.email,
          role: user.role
        }))
    };
  }
  
  // Filter users based on search term (case-insensitive)
  const searchLower = searchTerm.toLowerCase();
  const filtered = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower) ||
    user.role.toLowerCase().includes(searchLower)
  );
  
  // Transform to the format expected by the component
  return { 
    data: filtered
      .filter(user => user[valueIdField] !== undefined) // Only include users with the specified ID field
      .map(user => ({
        value: user[valueIdField],
        label: `${user.name} (${user.role})`,
        email: user.email,
        role: user.role
      }))
  };
};

/**
 * Alternative: Custom search function that can be passed directly to the field
 * @param {string} searchTerm - The search term entered by the user
 * @param {object} formValues - Current form values (if needed for context)
 * @param {string} valueIdField - The field name to use as the ID
 * @returns {Promise<Array>} - Returns filtered options
 */
export const searchUsers = async (searchTerm, formValues, valueIdField = 'id') => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const searchLower = searchTerm.toLowerCase();
  const filtered = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower) ||
    user.role.toLowerCase().includes(searchLower)
  );
  
  return filtered
    .filter(user => user[valueIdField] !== undefined) // Only include users with the specified ID field
    .map(user => ({
      value: user[valueIdField],
      label: `${user.name} (${user.role})`,
    }));
};

/**
 * Get user by ID (useful for initial value display)
 */
export const getUserById = (id, valueIdField) => {
  const user = mockUsers.find(u => u[valueIdField] === id);
  if (user) {
    return {
      value: user[valueIdField],
      label: `${user.name} (${user.role})`,
    };
  }
  return null;
};

/**
 * Get multiple users by IDs
 */
export const getUsersByIds = (ids, valueIdField = 'id') => {
  return ids.map(id => getUserById(id, valueIdField)).filter(Boolean);
};

export default mockApiClient;
