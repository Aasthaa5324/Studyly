// Configure API URL based on environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://your-backend-url.onrender.com'; // Replace with your Render URL

// Store current user ID (in production, use proper authentication)
let currentUserId = null;

// DOM elements
const studyForm = document.getElementById('studyForm');
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');

// Helper function to show/hide loading
function setLoading(isLoading) {
    if (isLoading) {
        loadingDiv.classList.remove('hidden');
        resultDiv.style.display = 'none';
    } else {
        loadingDiv.classList.add('hidden');
    }
}

// Helper function to show error
function showError(message) {
    resultDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
    resultDiv.style.display = 'block';
}

// Helper function to format resources
function formatResources(resourceString) {
    return resourceString
        .split(',')
        .map(resource => `• ${resource.trim()}`)
        .join('<br>');
}

// Main form submission handler
studyForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    setLoading(true);
    
    try {
        // Get form values
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const hours = parseFloat(document.getElementById('hours').value);

        // Validate inputs
        if (!username || !email || !subject || !hours) {
            throw new Error('Please fill in all fields');
        }

        if (hours < 1 || hours > 40) {
            throw new Error('Hours per week must be between 1 and 40');
        }

        // Step 1: Create or get user
        let userId = await createOrGetUser(username, email);

        // Step 2: Create study plan
        const plan = await createStudyPlan(userId, subject, hours);

        // Step 3: Display results
        displayStudyPlan(plan);
        
        // Reset form for next submission
        studyForm.reset();
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Something went wrong. Please try again.');
    } finally {
        setLoading(false);
    }
});

// Create or get existing user
async function createOrGetUser(username, email) {
    try {
        const response = await fetch(`${API_URL}/api/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email })
        });

        if (response.ok) {
            const user = await response.json();
            currentUserId = user.id;
            return user.id;
        } else if (response.status === 400) {
            // User already exists
            const errorData = await response.json();
            if (errorData.detail === "Email already registered") {
                // In production, implement proper login
                // For now, we'll use a placeholder ID
                console.log('User already exists, using placeholder ID');
                currentUserId = 1;
                return 1;
            }
            throw new Error(errorData.detail);
        } else {
            throw new Error('Failed to create user');
        }
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
}

// Create study plan
async function createStudyPlan(userId, subject, hours) {
    const response = await fetch(`${API_URL}/api/studyplan/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            subject: subject,
            hours_per_week: hours
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create study plan');
    }

    return await response.json();
}

// Display study plan results
function displayStudyPlan(plan) {
    const formattedDate = new Date(plan.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    resultDiv.innerHTML = `
        <h3>🎯 Your Personalized Study Plan</h3>
        
        <div class="result-item">
            <strong>📚 Subject:</strong> ${plan.subject}
        </div>
        
        <div class="result-item">
            <strong>⏰ Time Commitment:</strong> ${plan.hours_per_week} hours per week
        </div>
        
        <div class="result-item">
            <strong>📖 Recommended Resources:</strong><br>
            <div style="margin-top: 10px; line-height: 1.8;">
                ${formatResources(plan.recommended_resources)}
            </div>
        </div>
        
        <div class="result-item">
            <strong>📅 Created:</strong> ${formattedDate}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 10px;">
            <strong>💡 Study Tips:</strong><br>
            ${getStudyTips(plan.hours_per_week)}
        </div>
        
        <button onclick="viewAllPlans()" class="submit-btn" style="margin-top: 20px;">
            View All My Plans
        </button>
    `;
    
    resultDiv.style.display = 'block';
}

// Get study tips based on hours
function getStudyTips(hours) {
    if (hours < 5) {
        return `
            • Focus on consistency - even 30 minutes daily is valuable<br>
            • Use micro-learning techniques<br>
            • Set specific, achievable goals for each session
        `;
    } else if (hours < 10) {
        return `
            • Break study sessions into 45-minute focused blocks<br>
            • Use the Pomodoro Technique for better concentration<br>
            • Review previous material before starting new topics
        `;
    } else {
        return `
            • Create a structured weekly schedule<br>
            • Include regular breaks to avoid burnout<br>
            • Mix different learning methods (videos, reading, practice)<br>
            • Track your progress weekly
        `;
    }
}

// View all plans for current user
async function viewAllPlans() {
    if (!currentUserId) {
        showError('Please create a study plan first');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/api/studyplans/${currentUserId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch study plans');
        }

        const plans = await response.json();

        if (plans.length === 0) {
            resultDiv.innerHTML = '<p>No study plans found.</p>';
        } else {
            let plansHTML = '<h3>📋 All Your Study Plans</h3>';
            
            plans.forEach((plan, index) => {
                const date = new Date(plan.created_at).toLocaleDateString();
                plansHTML += `
                    <div class="result-item" style="margin-bottom: 20px;">
                        <h4>Plan ${index + 1}: ${plan.subject}</h4>
                        <p><strong>Hours/week:</strong> ${plan.hours_per_week}</p>
                        <p><strong>Resources:</strong><br>${formatResources(plan.recommended_resources)}</p>
                        <p><small>Created: ${date}</small></p>
                    </div>
                `;
            });

            plansHTML += `
                <button onclick="location.reload()" class="submit-btn" style="margin-top: 20px;">
                    Create New Plan
                </button>
            `;

            resultDiv.innerHTML = plansHTML;
        }

        resultDiv.style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load study plans');
    } finally {
        setLoading(false);
    }
}

// Check API health on page load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            console.warn('Backend API is not responding');
        } else {
            console.log('Backend API is healthy');
        }
    } catch (error) {
        console.warn('Cannot connect to backend API:', error);
    }
});

// Add input validation
document.getElementById('email').addEventListener('input', function(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        e.target.setCustomValidity('Please enter a valid email address');
    } else {
        e.target.setCustomValidity('');
    }
});

document.getElementById('hours').addEventListener('input', function(e) {
    const hours = parseFloat(e.target.value);
    
    if (hours < 1 || hours > 40) {
        e.target.setCustomValidity('Hours must be between 1 and 40');
    } else {
        e.target.setCustomValidity('');
    }
});

// Export functions for global access
window.viewAllPlans = viewAllPlans;