async function fetchGitHubProjects() {
    const username = 'A-PhantomGamer';
    try {
        console.log('Fetching GitHub projects...');
        const response = await fetch(`https://api.github.com/users/${username}/repos`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }

        const projects = await response.json();
        console.log('Raw projects data:', projects);

        const projectsContainer = document.getElementById('github-projects');
        if (!projectsContainer) {
            console.error('Projects container not found');
            return;
        }

        if (!Array.isArray(projects) || projects.length === 0) {
            console.log('No projects found');
            projectsContainer.innerHTML = `
                <div class="no-projects">
                    <p>No public repositories found.</p>
                </div>`;
            return;
        }
        
        // Clear existing content
        projectsContainer.innerHTML = '';
        
        // Sort projects by last updated date
        const sortedProjects = projects.sort((a, b) => 
            new Date(b.updated_at) - new Date(a.updated_at)
        );
        
        sortedProjects.forEach(project => {
            console.log('Processing project:', project.name);
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            // Get primary language if available
            const language = project.language ? 
                `<span class="project-language"><i class="fas fa-code"></i> ${project.language}</span>` : '';
            
            projectCard.innerHTML = `
                <div class="project-content">
                    <h3 class="project-title">${project.name}</h3>
                    <p class="project-description">${project.description || 'No description available'}</p>
                    ${language}
                    <div class="project-meta">
                        <span class="project-stats">
                            <i class="fas fa-star"></i> ${project.stargazers_count || 0}
                            <i class="fas fa-code-branch"></i> ${project.forks_count || 0}
                        </span>
                        <span class="project-updated">
                            Updated: ${new Date(project.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="project-links">
                        <a href="${project.html_url}" class="project-btn github-btn" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-github"></i> View on GitHub
                        </a>
                        ${project.homepage ? 
                            `<a href="${project.homepage}" class="project-btn demo-btn" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>` : 
                            ''}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        const projectsContainer = document.getElementById('github-projects');
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading GitHub projects: ${error.message}</p>
                </div>`;
        }
    }
}

function createActivityElement(event) {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    let content = '';
    const date = new Date(event.created_at).toLocaleDateString();
    
    switch (event.type) {
        case 'PushEvent':
            const commits = event.payload.commits;
            content = `
                <div class="activity-icon"><i class="fas fa-code-branch"></i></div>
                <div class="activity-details">
                    <span class="activity-repo">${event.repo.name}</span>
                    <span class="activity-desc">Pushed ${commits.length} commit${commits.length > 1 ? 's' : ''}</span>
                    <span class="activity-date">${date}</span>
                </div>
            `;
            break;
            
        case 'CreateEvent':
            content = `
                <div class="activity-icon"><i class="fas fa-plus-circle"></i></div>
                <div class="activity-details">
                    <span class="activity-repo">${event.repo.name}</span>
                    <span class="activity-desc">Created ${event.payload.ref_type}</span>
                    <span class="activity-date">${date}</span>
                </div>
            `;
            break;
            
        case 'IssuesEvent':
            content = `
                <div class="activity-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="activity-details">
                    <span class="activity-repo">${event.repo.name}</span>
                    <span class="activity-desc">${event.payload.action} issue</span>
                    <span class="activity-date">${date}</span>
                </div>
            `;
            break;
            
        case 'PullRequestEvent':
            content = `
                <div class="activity-icon"><i class="fas fa-code-pull-request"></i></div>
                <div class="activity-details">
                    <span class="activity-repo">${event.repo.name}</span>
                    <span class="activity-desc">${event.payload.action} pull request</span>
                    <span class="activity-date">${date}</span>
                </div>
            `;
            break;
            
        default:
            content = `
                <div class="activity-icon"><i class="fas fa-code"></i></div>
                <div class="activity-details">
                    <span class="activity-repo">${event.repo.name}</span>
                    <span class="activity-desc">Activity on repository</span>
                    <span class="activity-date">${date}</span>
                </div>
            `;
    }
    
    activityItem.innerHTML = content;
    return activityItem;
}

async function fetchGithubActivity() {
    const username = 'A-PhantomGamer';
    try {
        console.log('Fetching GitHub activity...');
        const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('Response status:', eventsResponse.status);
        if (!eventsResponse.ok) {
            throw new Error(`GitHub API responded with status: ${eventsResponse.status}`);
        }

        const events = await eventsResponse.json();
        console.log('Fetched events:', events);

        const activityContainer = document.querySelector('.github-activity');
        if (!activityContainer) {
            console.error('GitHub activity container not found');
            return;
        }

        activityContainer.innerHTML = '<h3>Recent GitHub Activity</h3>';

        if (!Array.isArray(events) || events.length === 0) {
            activityContainer.innerHTML += `
                <div class="activity-placeholder">
                    <i class="fas fa-code-branch"></i>
                    <p>No recent public activity</p>
                    <small>Check back later for updates!</small>
                </div>`;
            return;
        }

        const validEvents = events.filter(event => 
            event && event.type && event.repo && event.created_at
        );

        if (validEvents.length === 0) {
            activityContainer.innerHTML += `
                <p class="no-activity">
                    No valid activity data found.<br>
                    <small>Try refreshing the page.</small>
                </p>`;
            return;
        }

        validEvents.slice(0, 5).forEach(event => {
            const activityItem = createActivityElement(event);
            activityContainer.appendChild(activityItem);
        });
    } catch (error) {
        console.error('Error fetching GitHub activity:', error);
        const activityContainer = document.querySelector('.github-activity');
        if (activityContainer) {
            activityContainer.innerHTML = `
                <h3>Recent GitHub Activity</h3>
                <div class="activity-placeholder">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Unable to load activity</p>
                    <small>${error.message}</small>
                </div>`;
        }
    }
}

async function fetchGitHubContributions() {
    const username = 'A-PhantomGamer';
    try {
        console.log('Fetching contributions...');
        const response = await fetch(`https://api.github.com/users/${username}/events/public`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }

        const events = await response.json();
        console.log('Fetched events:', events);
        
        // Calculate contributions
        const contributions = calculateContributions(events);
        console.log('Calculated contributions:', contributions);
        
        // Update the stats
        document.getElementById('total-contributions').textContent = contributions.total;
        document.getElementById('current-streak').textContent = `${contributions.currentStreak} days`;
        document.getElementById('longest-streak').textContent = `${contributions.longestStreak} days`;
        
        // Render contribution graph
        renderContributionGraph(contributions.dailyContributions);
    } catch (error) {
        console.error('Error fetching GitHub contributions:', error);
        document.querySelector('.github-stats-container').innerHTML = `
            <div class="error-message">
                <p>Error loading GitHub contributions: ${error.message}</p>
            </div>`;
    }
}

console.log('GitHub.js loading...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, fetching GitHub data...'); // Replace with your actual message
    fetchGitHubProjects();
    fetchGithubActivity();
    fetchGitHubContributions();
});

function calculateContributions(events) {
    const today = new Date();
    const dailyContributions = new Map();
    let currentStreak = 0;
    let longestStreak = 0;
    let total = 0;

    // Process last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyContributions.set(dateStr, 0);
    }

    // Count contributions
    events.forEach(event => {
        if (['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(event.type)) {
            const date = event.created_at.split('T')[0];
            if (dailyContributions.has(date)) {
                dailyContributions.set(date, dailyContributions.get(date) + 1);
            }
        }
    });

    // Calculate streaks and total
    let tempStreak = 0;
    [...dailyContributions.entries()].sort().forEach(([date, count]) => {
        total += count;
        if (count > 0) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    });

    // Calculate current streak
    let checking = true;
    tempStreak = 0;
    [...dailyContributions.entries()].reverse().forEach(([date, count]) => {
        if (checking) {
            if (count > 0) {
                tempStreak++;
            } else if (tempStreak === 0) {
                checking = false;
            }
        }
    });
    currentStreak = tempStreak;

    return {
        total,
        currentStreak,
        longestStreak,
        dailyContributions
    };
}

function renderContributionGraph(dailyContributions) {
    const graphContainer = document.getElementById('contribution-graph');
    if (!graphContainer) return;
    
    graphContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'repeat(30, 1fr)';
    wrapper.style.gap = '2px';

    [...dailyContributions.entries()].forEach(([date, count]) => {
        const cell = document.createElement('div');
        cell.className = `contribution-cell contribution-level-${getContributionLevel(count)}`;
        cell.title = `${date}: ${count} contributions`;
        wrapper.appendChild(cell);
    });

    graphContainer.appendChild(wrapper);
}

function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
}




