// Driver Dashboard Application
class DriverApp {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.currentUser = null;
        this.pendingPhone = null; // Store phone number temporarily during verification
        this.init();
    }

    async init() {
        await this.checkHealthStatus();
        this.setupEventListeners();

        if (this.token) {
            await this.loadUserData();
            this.showDriverDashboard();
        } else {
            this.showAuthScreen();
        }
    }

    setupEventListeners() {
        // Tab switching
        document.getElementById('driver-tab')?.addEventListener('click', () => this.switchTab('driver'));
        document.getElementById('admin-tab')?.addEventListener('click', () => this.switchTab('admin'));

        // Auth forms
        document.getElementById('login-form')?.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('register-form')?.addEventListener('submit', this.handleRegister.bind(this));
        document.getElementById('verify-form')?.addEventListener('submit', this.handleVerification.bind(this));
        document.getElementById('resend-code')?.addEventListener('click', this.resendVerificationCode.bind(this));
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });

        // Driver actions
        document.getElementById('clock-in-btn')?.addEventListener('click', () => this.showClockInForm());
        document.getElementById('clock-out-btn')?.addEventListener('click', () => this.showClockOutForm());
        document.getElementById('view-shifts-btn')?.addEventListener('click', () => this.loadShifts());

        // Form submissions
        document.getElementById('clock-in-form')?.addEventListener('submit', (e) => this.handleClockIn(e));
        document.getElementById('clock-out-form')?.addEventListener('submit', (e) => this.handleClockOut(e));



        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    switchTab(tab) {
        const driverTab = document.getElementById('driver-tab');
        const adminTab = document.getElementById('admin-tab');
        const driverSection = document.getElementById('driver-section');
        const adminSection = document.getElementById('admin-section');

        if (tab === 'driver') {
            driverTab.classList.add('active');
            adminTab.classList.remove('active');
            driverSection.classList.add('active');
            adminSection.classList.remove('active');
        } else {
            adminTab.classList.add('active');
            driverTab.classList.remove('active');
            adminSection.classList.add('active');
            driverSection.classList.remove('active');
        }
    }

    async checkHealthStatus() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();

            const healthStatus = document.getElementById('health-status');
            if (healthStatus) {
                healthStatus.textContent = data.message;
                healthStatus.className = 'status-healthy';
            }
        } catch (error) {
            const healthStatus = document.getElementById('health-status');
            if (healthStatus) {
                healthStatus.textContent = 'Server connection failed';
                healthStatus.className = 'status-error';
            }
        }
    }

    showAuthScreen() {
        document.getElementById('driver-section').innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <h2 id="auth-title">Driver Login</h2>

                    <form id="login-form" class="auth-form">
                        <input type="email" id="login-email" placeholder="Email" required>
                        <input type="password" id="login-password" placeholder="Password" required>
                        <button type="submit" class="auth-btn">Login</button>
                        <p class="auth-toggle">
                            Don't have an account? 
                            <a href="#" id="show-register">Register here</a>
                        </p>
                    </form>

                    <form id="register-form" class="auth-form">
                        <input type="text" id="register-name" placeholder="Full Name" required>
                        <input type="tel" id="register-phone" placeholder="Phone Number" required>
                        <input type="email" id="register-email" placeholder="Email">
                        <input type="password" id="register-password" placeholder="Password" required>
                        <button type="submit" class="auth-btn">Register</button>
                        <p class="auth-toggle">
                            Already have an account? 
                            <a href="#" id="show-login">Login here</a>
                        </p>
                    </form>

                    <form id="verify-form" class="auth-form hidden">
                        <p>Please enter the verification code sent to your phone.</p>
                        <input type="tel" id="verify-phone" placeholder="Phone Number" readonly>
                        <input type="text" id="verify-code" placeholder="Verification Code" required>
                        <button type="submit" class="auth-btn">Verify</button>
                        <button type="button" id="resend-code" class="cancel-btn">Resend Code</button>
                    </form>

                </div>
            </div>
        `;
        this.setupEventListeners();
    }

    showDriverDashboard() {
        document.getElementById('driver-section').innerHTML = `
            <div class="dashboard-header">
                <h2>Welcome, ${this.currentUser?.name || 'Driver'}!</h2>
                <button id="logout-btn" class="logout-btn">Logout</button>
            </div>

            <div class="status-card">
                <h3>System Status</h3>
                <div id="health-status">Checking...</div>
            </div>

            <div class="shift-status-card">
                <h3>Shift Status</h3>
                <div id="shift-status">Loading...</div>
            </div>

            <div class="feature-card">
                <h3>Quick Actions</h3>
                <button id="clock-in-btn" class="action-btn">Start Shift</button>
                <button id="clock-out-btn" class="action-btn">End Shift</button>
                <button id="view-shifts-btn" class="action-btn">View Today's Shifts</button>
            </div>

            <div id="action-forms" class="forms-container"></div>
            <div id="shifts-display" class="shifts-container"></div>
        `;

        this.setupEventListeners();
        this.loadDriverStatus();
    }

    toggleAuthMode() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authTitle = document.getElementById('auth-title');
        const verifyForm = document.getElementById('verify-form');

        if (loginForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            verifyForm.classList.add('hidden');
            authTitle.textContent = 'Driver Login';
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            verifyForm.classList.add('hidden');
            authTitle.textContent = 'Driver Registration';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('authToken', this.token);
                this.currentUser = data.driver;
                this.showDriverDashboard();
                this.showMessage('Login successful!', 'success');
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const phone = document.getElementById('register-phone').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, password })
            });

            const data = await response.json();

            if (response.ok && data.requiresVerification) {
                this.pendingPhone = phone;
                this.showVerificationForm();
                this.showMessage('Registration successful! Please verify your phone.', 'success');
            } else if (response.ok) {
                this.showMessage('Registration successful! Please login.', 'success');
                this.toggleAuthMode();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Registration failed. Please try again.', 'error');
        }
    }

    showVerificationForm() {
        const registerForm = document.getElementById('register-form');
        const verifyForm = document.getElementById('verify-form');

        registerForm.classList.add('hidden');
        verifyForm.classList.remove('hidden');

        document.getElementById('verify-phone').value = this.pendingPhone;
    }

    async handleVerification(e) {
        e.preventDefault();
        const phone = document.getElementById('verify-phone').value;
        const code = document.getElementById('verify-code').value;

        try {
            const response = await fetch('/api/auth/verify-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Phone verified successfully! You can now login.', 'success');
                this.showAuthScreen(); // Go back to login
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Verification failed. Please try again.', 'error');
        }
    }

    async resendVerificationCode() {
        const phone = document.getElementById('verify-phone').value;

        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('New verification code sent!', 'success');
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Failed to resend code. Please try again.', 'error');
        }
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/driver/status', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // User data is embedded in token, but we can get additional info here
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    async loadDriverStatus() {
        try {
            const response = await fetch('/api/driver/status', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();
            const statusDiv = document.getElementById('shift-status');

            if (data.hasActiveShift) {
                const shift = data.activeShift;
                statusDiv.innerHTML = `
                    <div class="active-shift">
                        <p><strong>🟢 Currently on shift</strong></p>
                        <p>Started: ${new Date(shift.clock_in_time).toLocaleString()}</p>
                        <p>Start Odometer: ${shift.start_odometer} km</p>
                    </div>
                `;
                document.getElementById('clock-in-btn').disabled = true;
                document.getElementById('clock-out-btn').disabled = false;
            } else {
                statusDiv.innerHTML = `
                    <div class="no-shift">
                        <p><strong>⭕ Not on shift</strong></p>
                        <p>Ready to start a new shift</p>
                    </div>
                `;
                document.getElementById('clock-in-btn').disabled = false;
                document.getElementById('clock-out-btn').disabled = true;
            }
        } catch (error) {
            this.showMessage('Failed to load shift status', 'error');
        }
    }

    showClockInForm() {
        document.getElementById('action-forms').innerHTML = `
            <div class="form-card">
                <h3>Start New Shift</h3>
                <form id="clock-in-form">
                    <label for="start-odometer">Starting Odometer Reading (km):</label>
                    <input type="number" id="start-odometer" required min="0" step="1">
                    <button type="submit" class="action-btn">Clock In</button>
                    <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                </form>
            </div>
        `;
        this.setupEventListeners();
    }

    showClockOutForm() {
        document.getElementById('action-forms').innerHTML = `
            <div class="form-card">
                <h3>End Current Shift</h3>
                <form id="clock-out-form">
                    <label for="end-odometer">Ending Odometer Reading (km):</label>
                    <input type="number" id="end-odometer" required min="0" step="1">
                    <button type="submit" class="action-btn">Clock Out</button>
                    <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                </form>
            </div>
        `;
        this.setupEventListeners();
    }

    async handleClockIn(e) {
        e.preventDefault();
        const startOdometer = document.getElementById('start-odometer').value;

        try {
            const response = await fetch('/api/driver/clock-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ startOdometer: parseInt(startOdometer) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Clocked in successfully!', 'success');
                document.getElementById('action-forms').innerHTML = '';
                this.loadDriverStatus();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Failed to clock in', 'error');
        }
    }

    async handleClockOut(e) {
        e.preventDefault();
        const endOdometer = document.getElementById('end-odometer').value;

        try {
            const response = await fetch('/api/driver/clock-out', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ endOdometer: parseInt(endOdometer) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Clocked out successfully!', 'success');
                document.getElementById('action-forms').innerHTML = '';
                this.loadDriverStatus();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Failed to clock out', 'error');
        }
    }

    async loadShifts() {
        try {
            const response = await fetch('/api/driver/shifts', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();
            const shiftsDiv = document.getElementById('shifts-display');

            if (data.shifts.length > 0) {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>Today's Shifts</h3>
                        ${data.shifts.map(shift => `
                            <div class="shift-item">
                                <p><strong>Shift #${shift.id}</strong></p>
                                <p>Start: ${new Date(shift.clock_in_time).toLocaleString()}</p>
                                ${shift.clock_out_time ? `
                                    <p>End: ${new Date(shift.clock_out_time).toLocaleString()}</p>
                                    <p>Distance: ${shift.total_distance || 0} km</p>
                                    <p>Duration: ${Math.round(shift.shift_duration_minutes || 0)} minutes</p>
                                ` : '<p><strong>Currently Active</strong></p>'}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>Today's Shifts</h3>
                        <p>No shifts recorded for today.</p>
                    </div>
                `;
            }
        } catch (error) {
            this.showMessage('Failed to load shifts', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    logout() {
        localStorage.removeItem('authToken');
        this.token = null;
        this.currentUser = null;
        this.showAuthScreen();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DriverApp();
});