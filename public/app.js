// Driver Dashboard Application
class DriverApp {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.currentUser = null;
        this.pendingPhone = null; // Store phone number temporarily during verification
        this.translator = new TranslationManager();
        this.init();
    }

    async init() {
        await this.checkHealthStatus();
        this.initializeLanguage();
        this.setupEventListeners();

        if (this.token) {
            await this.loadUserData();
            this.showDriverDashboard();
        } else {
            this.showAuthScreen();
        }
    }

    initializeLanguage() {
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.value = this.translator.getCurrentLanguage();
        }
        this.updateLanguage();
    }

    updateLanguage() {
        // Update static elements
        document.getElementById('app-title').textContent = this.translator.t('appTitle');
        document.getElementById('driver-tab').textContent = this.translator.t('driverDashboard');
        document.getElementById('admin-tab').textContent = this.translator.t('adminPanel');
        
        // Update health status if visible
        const healthStatus = document.getElementById('health-status');
        if (healthStatus && healthStatus.textContent.includes('running')) {
            healthStatus.textContent = this.translator.t('serverHealthy');
        }

        // Refresh current view
        if (this.token) {
            this.showDriverDashboard();
        } else {
            this.showAuthScreen();
        }
    }

    setupEventListeners() {
        // Language switching
        document.getElementById('language-selector')?.addEventListener('change', (e) => {
            this.translator.setLanguage(e.target.value);
            this.updateLanguage();
        });

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
                    <h2 id="auth-title">${this.translator.t('driverLogin')}</h2>

                    <form id="login-form" class="auth-form">
                        <input type="email" id="login-email" placeholder="${this.translator.t('email')}" required>
                        <input type="password" id="login-password" placeholder="${this.translator.t('password')}" required>
                        <button type="submit" class="auth-btn">${this.translator.t('login')}</button>
                        <p class="auth-toggle">
                            ${this.translator.t('dontHaveAccount')} 
                            <a href="#" id="show-register">${this.translator.t('registerHere')}</a>
                        </p>
                    </form>

                    <form id="register-form" class="auth-form">
                        <div class="field-group">
                            <label class="field-label required">${this.translator.t('fullName')} *</label>
                            <input type="text" id="register-name" placeholder="${this.translator.t('fullName')}" required>
                        </div>
                        <div class="field-group">
                            <label class="field-label required">${this.translator.t('phone')} *</label>
                            <input type="tel" id="register-phone" placeholder="${this.translator.t('phone')}" required>
                        </div>
                        <div class="field-group">
                            <label class="field-label optional">${this.translator.t('email')} (${this.translator.t('optional')})</label>
                            <input type="email" id="register-email" placeholder="${this.translator.t('email')}">
                        </div>
                        <div class="field-group">
                            <label class="field-label required">${this.translator.t('password')} *</label>
                            <input type="password" id="register-password" placeholder="${this.translator.t('password')}" required>
                        </div>
                        <div class="field-requirements">
                            <p class="requirement-note">${this.translator.t('fieldsMarkedRequired')}</p>
                        </div>
                        <button type="submit" class="auth-btn">${this.translator.t('register')}</button>
                        <p class="auth-toggle">
                            ${this.translator.t('alreadyHaveAccount')} 
                            <a href="#" id="show-login">${this.translator.t('loginHere')}</a>
                        </p>
                    </form>

                    <form id="verify-form" class="auth-form hidden">
                        <p>${this.translator.t('enterVerificationCode')}</p>
                        <input type="tel" id="verify-phone" placeholder="${this.translator.t('phone')}" readonly>
                        <input type="text" id="verify-code" placeholder="${this.translator.t('verificationCode')}" required>
                        <button type="submit" class="auth-btn">${this.translator.t('verify')}</button>
                        <button type="button" id="resend-code" class="cancel-btn">${this.translator.t('resendCode')}</button>
                    </form>

                </div>
            </div>
        `;
        this.setupEventListeners();
    }

    showDriverDashboard() {
        document.getElementById('driver-section').innerHTML = `
            <div class="dashboard-header">
                <h2>${this.translator.t('welcome')}, ${this.currentUser?.name || this.translator.t('driverDashboard')}!</h2>
                <button id="logout-btn" class="logout-btn">${this.translator.t('logout')}</button>
            </div>

            <div class="status-card">
                <h3>${this.translator.t('systemStatus')}</h3>
                <div id="health-status">${this.translator.t('checking')}</div>
            </div>

            <div class="shift-status-card">
                <h3>${this.translator.t('shiftStatus')}</h3>
                <div id="shift-status">${this.translator.t('checking')}</div>
            </div>

            <div class="feature-card">
                <h3>${this.translator.t('quickActions')}</h3>
                <button id="clock-in-btn" class="action-btn">${this.translator.t('startShift')}</button>
                <button id="clock-out-btn" class="action-btn">${this.translator.t('endShift')}</button>
                <button id="view-shifts-btn" class="action-btn">${this.translator.t('viewTodaysShifts')}</button>
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
            authTitle.textContent = this.translator.t('driverLogin');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            verifyForm.classList.add('hidden');
            authTitle.textContent = this.translator.t('driverRegistration');
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
                this.showMessage(this.translator.t('loginSuccessful'), 'success');
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('loginFailed'), 'error');
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
                this.showMessage(this.translator.t('registrationWithVerification'), 'success');
            } else if (response.ok) {
                this.showMessage(this.translator.t('registrationSuccessful'), 'success');
                this.toggleAuthMode();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('registrationFailed'), 'error');
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
                this.showMessage(this.translator.t('phoneVerifiedSuccessfully'), 'success');
                this.showAuthScreen(); // Go back to login
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('verificationFailed'), 'error');
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
                this.showMessage(this.translator.t('verificationCodeSent'), 'success');
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToResendCode'), 'error');
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
                        <p><strong>${this.translator.t('currentlyOnShift')}</strong></p>
                        <p>${this.translator.t('started')}: ${new Date(shift.clock_in_time).toLocaleString()}</p>
                        <p>${this.translator.t('startOdometer')}: ${shift.start_odometer} ${this.translator.t('km')}</p>
                    </div>
                `;
                document.getElementById('clock-in-btn').disabled = true;
                document.getElementById('clock-out-btn').disabled = false;
            } else {
                statusDiv.innerHTML = `
                    <div class="no-shift">
                        <p><strong>${this.translator.t('notOnShift')}</strong></p>
                        <p>${this.translator.t('readyForNewShift')}</p>
                    </div>
                `;
                document.getElementById('clock-in-btn').disabled = false;
                document.getElementById('clock-out-btn').disabled = true;
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToLoadShiftStatus'), 'error');
        }
    }

    showClockInForm() {
        document.getElementById('action-forms').innerHTML = `
            <div class="form-card">
                <h3>${this.translator.t('startNewShift')}</h3>
                <form id="clock-in-form">
                    <label for="start-odometer">${this.translator.t('startingOdometerReading')}</label>
                    <input type="number" id="start-odometer" required min="0" step="1">
                    <button type="submit" class="action-btn">${this.translator.t('clockIn')}</button>
                    <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.remove()">${this.translator.t('cancel')}</button>
                </form>
            </div>
        `;
        this.setupEventListeners();
    }

    showClockOutForm() {
        document.getElementById('action-forms').innerHTML = `
            <div class="form-card">
                <h3>${this.translator.t('endCurrentShift')}</h3>
                <form id="clock-out-form">
                    <label for="end-odometer">${this.translator.t('endingOdometerReading')}</label>
                    <input type="number" id="end-odometer" required min="0" step="1">
                    <button type="submit" class="action-btn">${this.translator.t('clockOut')}</button>
                    <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.remove()">${this.translator.t('cancel')}</button>
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
                this.showMessage(this.translator.t('clockedInSuccessfully'), 'success');
                document.getElementById('action-forms').innerHTML = '';
                this.loadDriverStatus();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToClockIn'), 'error');
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
                this.showMessage(this.translator.t('clockedOutSuccessfully'), 'success');
                document.getElementById('action-forms').innerHTML = '';
                this.loadDriverStatus();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToClockOut'), 'error');
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
                        <h3>${this.translator.t('todaysShifts')}</h3>
                        ${data.shifts.map(shift => `
                            <div class="shift-item">
                                <p><strong>${this.translator.t('shift')} #${shift.id}</strong></p>
                                <p>${this.translator.t('start')}: ${new Date(shift.clock_in_time).toLocaleString()}</p>
                                ${shift.clock_out_time ? `
                                    <p>${this.translator.t('end')}: ${new Date(shift.clock_out_time).toLocaleString()}</p>
                                    <p>${this.translator.t('distance')}: ${shift.total_distance || 0} ${this.translator.t('km')}</p>
                                    <p>${this.translator.t('duration')}: ${Math.round(shift.shift_duration_minutes || 0)} ${this.translator.t('minutes')}</p>
                                ` : `<p><strong>${this.translator.t('currentlyActive')}</strong></p>`}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('todaysShifts')}</h3>
                        <p>${this.translator.t('noShiftsToday')}</p>
                    </div>
                `;
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToLoadShifts'), 'error');
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