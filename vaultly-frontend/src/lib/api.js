export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const API = API_BASE_URL;

// Wake up the server (for Render free tier or similar services)
async function wakeUpServer() {
  try {
    await fetch(`${API}/health`, {
      method: "GET",
    });
  } catch (error) {
    // Silently fail - this is just a wake-up call
    console.log('Server wake-up call sent');
  }
}

async function login(email, password) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Login failed" };
  }

  return response.json();
}

async function signup(userData) {
  const response = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Signup failed" };
  }

  const data = await response.json();
  return data;
}

async function logout() {
  const response = await fetch(`${API}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Logout failed" };
  }

  return response.json();
}

let refreshPromise = null;

async function requestTokenRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function authFetch(url, options = {}) {
  const reqOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  let response = await fetch(url, reqOptions);

  if (response.status === 401) {
    const isAuthRoute =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/logout');

    if (!isAuthRoute) {
      const refreshed = await requestTokenRefresh();
      if (refreshed) {
        response = await fetch(url, reqOptions);
      }
    }
  }

  return response;
}

async function refreshToken() {
  try {
    const response = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to refresh token' };
    }

    return response.json();
  } catch {
    return { error: 'Network error refreshing token' };
  }
}

async function getCurrentUser() {
  const response = await authFetch(`${API}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return { error: "Not authenticated" };
  }

  return response.json();
}

async function createExpense(expenseData) {
  const response = await authFetch(`${API}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to create expense" };
  }

  return response.json();
}

async function getUserExpenses(params = {}) {
  const queryParams = new URLSearchParams();
  
  // Add query parameters if they exist
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `${API}/expenses${queryString ? `?${queryString}` : ''}`;

  const response = await authFetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return { error: "Failed to fetch expenses" };
  }

  return response.json();
}

async function deleteExpense(expenseId) {
  const response = await authFetch(`${API}/expenses/${expenseId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to delete expense" };
  }

  return response.json();
}

async function updateExpense(expenseId, updateData){
  const response = await authFetch(`${API}/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });

  if(!response.ok){
    const error = await response.json();
    return { error: error.message || "Failed to update expense" };
  }

  return response.json();
}

async function updateUser(userId, updateData) {
  const response = await authFetch(`${API}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to update profile" };
  }

  return response.json();
}

// Group API functions
async function getUserGroups() {
  const response = await authFetch(`${API}/groups`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return { error: "Failed to fetch groups" };
  }

  return response.json();
}

async function createGroup(groupData) {
  const response = await authFetch(`${API}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to create group" };
  }

  return response.json();
}

async function getGroupById(groupId) {
  const response = await authFetch(`${API}/groups/${groupId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to fetch group" };
  }

  return response.json();
}

async function updateGroup(groupId, updateData) {
  const response = await authFetch(`${API}/groups/${groupId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to update group" };
  }

  return response.json();
}

async function deleteGroup(groupId) {
  const response = await authFetch(`${API}/groups/${groupId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to delete group" };
  }

  return response.json();
}

async function addGroupMember(groupId, memberData) {
  const response = await authFetch(`${API}/groups/${groupId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to add member" };
  }

  return response.json();
}

async function removeGroupMember(groupId, memberId) {
  const response = await authFetch(`${API}/groups/${groupId}/members/${memberId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to remove member" };
  }

  return response.json();
}

// Goals API
async function getUserGoals() {
  try {
    const response = await authFetch(`${API}/goals`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch goals" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function createGoal(goalData) {
  try {
    const response = await authFetch(`${API}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(goalData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to create goal" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getGoalById(goalId) {
  const response = await authFetch(`${API}/goals/${goalId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to fetch goal" };
  }

  return response.json();
}

async function updateGoal(goalId, updateData) {
  try {
    const response = await authFetch(`${API}/goals/${goalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to update goal" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function deleteGoal(goalId) {
  try {
    const response = await authFetch(`${API}/goals/${goalId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to delete goal" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function contributeToGoal(goalId, amount) {
  try {
    const response = await authFetch(`${API}/goals/${goalId}/contribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to contribute to goal" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

// Analytics API
async function getSpendingOverview(startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await authFetch(`${API}/analytics/overview?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch overview" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getMonthlyTrends(months = 6) {
  try {
    const response = await authFetch(`${API}/analytics/trends?months=${months}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch trends" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getTopExpenses(limit = 10) {
  try {
    const response = await authFetch(`${API}/analytics/top-expenses?limit=${limit}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch top expenses" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getGroupAnalytics() {
  try {
    const response = await authFetch(`${API}/analytics/groups`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch group analytics" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getGoalsProgressAnalytics() {
  try {
    const response = await authFetch(`${API}/analytics/goals`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch goals analytics" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getComparisonData(period = 'month') {
  try {
    const response = await authFetch(`${API}/analytics/comparison?period=${period}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch comparison" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

async function getDashboardStats() {
  try {
    const response = await authFetch(`${API}/analytics/dashboard`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || error.message || "Failed to fetch dashboard stats" };
    }

    return response.json();
  } catch (error) {
    return { error: "Network error. Please check your connection." };
  }
}

export { 
  authFetch,
  refreshToken,
  login, 
  signup, 
  logout, 
  getCurrentUser, 
  createExpense, 
  getUserExpenses, 
  deleteExpense, 
  updateExpense, 
  updateUser,
  getUserGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  getUserGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  getSpendingOverview,
  getMonthlyTrends,
  getTopExpenses,
  getGroupAnalytics,
  getGoalsProgressAnalytics,
  getComparisonData,
  getDashboardStats,
  wakeUpServer
};