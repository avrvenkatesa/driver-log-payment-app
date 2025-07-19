
// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const driverTab = document.getElementById('driver-tab');
    const adminTab = document.getElementById('admin-tab');
    const driverSection = document.getElementById('driver-section');
    const adminSection = document.getElementById('admin-section');
    const healthStatus = document.getElementById('health-status');

    // Switch to driver tab
    driverTab.addEventListener('click', function() {
        driverTab.classList.add('active');
        adminTab.classList.remove('active');
        driverSection.classList.add('active');
        adminSection.classList.remove('active');
    });

    // Switch to admin tab
    adminTab.addEventListener('click', function() {
        adminTab.classList.add('active');
        driverTab.classList.remove('active');
        adminSection.classList.add('active');
        driverSection.classList.remove('active');
    });

    // Check health status
    async function checkHealthStatus() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            healthStatus.textContent = data.message;
            healthStatus.className = 'status-healthy';
        } catch (error) {
            healthStatus.textContent = 'Server connection failed';
            healthStatus.className = 'status-error';
        }
    }

    // Check health on load
    checkHealthStatus();

    // Add click handlers for action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert(`${this.textContent} functionality coming soon!`);
        });
    });
});
