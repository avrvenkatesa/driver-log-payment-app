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
        document.getElementById('view-monthly-shifts-btn')?.addEventListener('click', () => this.loadMonthlyShifts());
        document.getElementById('create-test-data-btn')?.addEventListener('click', () => this.createTestData());

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
            this.showDriverDashboard();
        } else {
            adminTab.classList.add('active');
            driverTab.classList.remove('active');
            adminSection.classList.add('active');
            driverSection.classList.remove('active');
            this.showAdminPanel();
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
                        <input type="text" id="login-identifier" placeholder="${this.translator.t('userId')}" required>
                        <input type="password" id="login-password" placeholder="${this.translator.t('password')}" required>
                        <button type="submit" class="auth-btn">${this.translator.t('login')}</button>
                        <p class="auth-toggle">
                            ${this.translator.t('dontHaveAccount')} 
                            <a href="#" id="show-register">${this.translator.t('registerHere')}</a>
                        </p>
                    </form>

                    <form id="register-form" class="auth-form">
                        <div class="field-group">
                            <label class="field-label required">*${this.translator.t('fullName')}</label>
                            <input type="text" id="register-name" placeholder="${this.translator.t('fullName')}" required>
                        </div>
                        <div class="field-group">
                            <label class="field-label required">*${this.translator.t('userId')}</label>
                            <input type="text" id="register-phone" placeholder="${this.translator.t('userId')}" required>
                        </div>
                        <div class="field-group">
                            <label class="field-label optional">${this.translator.t('email')} (${this.translator.t('optional')})</label>
                            <input type="email" id="register-email" placeholder="${this.translator.t('email')}">
                        </div>
                        <div class="field-group">
                            <label class="field-label required">*${this.translator.t('password')}</label>
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

            <div class="shift-status-card">
                <h3>${this.translator.t('shiftStatus')}</h3>
                <div id="shift-status">${this.translator.t('checking')}</div>
            </div>

            <div class="feature-card">
                <h3>${this.translator.t('quickActions')}</h3>
                <button id="clock-in-btn" class="action-btn">${this.translator.t('startShift')}</button>
                <button id="clock-out-btn" class="action-btn">${this.translator.t('endShift')}</button>
                <button id="view-shifts-btn" class="action-btn">${this.translator.t('viewTodaysShifts')}</button>
                <button id="view-monthly-shifts-btn" class="action-btn">${this.translator.t('viewMonthlyShifts')}</button>
                <button id="create-test-data-btn" class="action-btn" style="background-color: #ff9800;">Create Test Data</button>
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

        if (loginForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            authTitle.textContent = this.translator.t('driverLogin');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authTitle.textContent = this.translator.t('driverRegistration');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('authToken', this.token);
                this.currentUser = data.driver;
                this.showDriverDashboard();
                this.showMessage(this.translator.t('loginSuccessful'), 'success');
            } else {
                this.showMessage(this.translateError(data.error), 'error');
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

            if (response.ok) {
                this.showMessage(this.translator.t('registrationSuccessful'), 'success');
                this.toggleAuthMode();
            } else {
                this.showMessage(this.translateError(data.error), 'error');
            }
        } catch (error) {
            this.showMessage(this.translator.t('registrationFailed'), 'error');
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

                // Debug logging
                console.log('Server timestamp:', shift.clock_in_time);

                // Use the actual stored start time
                const clockInTime = this.formatToIST(shift.clock_in_time);

                // Calculate how long the shift has been running
                let shiftDuration = '';
                try {
                    const startTime = new Date(shift.clock_in_time);
                    const now = new Date();

                    const diffMs = now - startTime;

                    if (diffMs < 0) {
                        shiftDuration = '(just started)';
                    } else {
                        const totalMinutes = Math.floor(diffMs / (1000 * 60));
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;

                        if (hours > 0) {
                            shiftDuration = `(${hours}h ${minutes}m ago)`;
                        } else {
                            shiftDuration = `(${minutes}m ago)`;
                        }
                    }
                } catch (e) {
                    console.error('Error calculating duration:', e);
                    shiftDuration = '(calculation error)';
                }

                statusDiv.innerHTML = `
                    <div class="active-shift">
                        <p><strong>${this.translator.t('currentlyOnShift')}</strong></p>
                        <p>${this.translator.t('started')}: ${clockInTime} ${shiftDuration}</p>
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
                this.showMessage(this.translateError(data), 'error');
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
                this.showMessage(this.translateError(data), 'error');
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
                        ${data.shifts.map(shift => {
                            const startTime = this.formatToIST(shift.clock_in_time);
                            const endTime = shift.clock_out_time ? this.formatToIST(shift.clock_out_time) : null;

                            // Calculate shift duration in a readable format
                            let readableDuration = '';
                            if (shift.shift_duration_minutes) {
                                const hours = Math.floor(shift.shift_duration_minutes / 60);
                                const minutes = shift.shift_duration_minutes % 60;
                                readableDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            }

                            return `
                                <div class="shift-item">
                                    <p><strong>${this.translator.t('shift')} #${shift.id}</strong></p>
                                    <p>${this.translator.t('start')}: ${startTime}</p>
                                    <p>${this.translator.t('startOdometer')}: ${shift.start_odometer} ${this.translator.t('km')}</p>
                                    ${shift.clock_out_time ? `
                                        <p>${this.translator.t('end')}: ${endTime}</p>
                                        <p>${this.translator.t('endOdometer')}: ${shift.end_odometer} ${this.translator.t('km')}</p>
                                        <p>${this.translator.t('distance')}: ${shift.total_distance || 0} ${this.translator.t('km')}</p>
                                        <p>${this.translator.t('duration')}: ${readableDuration || Math.round(shift.shift_duration_minutes || 0) + ' minutes'}</p>
                                    ` : `<p><strong>${this.translator.t('currentlyActive')}</strong></p>`}
                                </div>
                            `;
                        }).join('')}
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

    async loadMonthlyShifts() {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const response = await fetch(`/api/driver/shifts-monthly/${year}/${month}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();
            const shiftsDiv = document.getElementById('shifts-display');

            if (data.shifts.length > 0) {
                // Calculate monthly totals
                const totalDistance = data.shifts.reduce((sum, shift) => sum + (shift.total_distance || 0), 0);
                const totalDuration = data.shifts.reduce((sum, shift) => sum + (shift.shift_duration_minutes || 0), 0);
                const totalShifts = data.shifts.length;

                const totalHours = Math.floor(totalDuration / 60);
                const totalMins = totalDuration % 60;

                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('monthlyShifts')} - ${this.getMonthName(month)} ${year}</h3>
                        <div class="monthly-summary">
                            <p><strong>${this.translator.t('monthSummary')}:</strong></p>
                            <p>${this.translator.t('totalShifts')}: ${totalShifts}</p>
                            <p>${this.translator.t('totalDistance')}: ${totalDistance} ${this.translator.t('km')}</p>
                            <p>${this.translator.t('totalDuration')}: ${totalHours}h ${totalMins}m</p>
                        </div>
                        <hr style="margin: 15px 0;">
                        ${data.shifts.map(shift => {
                            const startTime = this.formatToIST(shift.clock_in_time);
                            const endTime = shift.clock_out_time ? this.formatToIST(shift.clock_out_time) : null;

                            // Calculate shift duration in a readable format
                            let readableDuration = '';
                            if (shift.shift_duration_minutes) {
                                const hours = Math.floor(shift.shift_duration_minutes / 60);
                                const minutes = shift.shift_duration_minutes % 60;
                                readableDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                            }

                            return `
                                <div class="shift-item">
                                    <p><strong>${this.translator.t('shift')} #${shift.id}</strong></p>
                                    <p>${this.translator.t('start')}: ${startTime}</p>
                                    <p>${this.translator.t('startOdometer')}: ${shift.start_odometer} ${this.translator.t('km')}</p>
                                    ${shift.clock_out_time ? `
                                        <p>${this.translator.t('end')}: ${endTime}</p>
                                        <p>${this.translator.t('endOdometer')}: ${shift.end_odometer} ${this.translator.t('km')}</p>
                                        <p>${this.translator.t('distance')}: ${shift.total_distance || 0} ${this.translator.t('km')}</p>
                                        <p>${this.translator.t('duration')}: ${readableDuration || Math.round(shift.shift_duration_minutes || 0) + ' minutes'}</p>
                                    ` : `<p><strong>${this.translator.t('currentlyActive')}</strong></p>`}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('monthlyShifts')} - ${this.getMonthName(month)} ${year}</h3>
                        <p>${this.translator.t('noShiftsThisMonth')}</p>
                    </div>
                `;
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToLoadMonthlyShifts'), 'error');
        }
    }

    async createTestData() {
        try {
            const response = await fetch('/api/driver/create-test-data', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(`Created ${data.shiftsCreated} test shifts for July 2025`, 'success');
            } else {
                this.showMessage('Failed to create test data', 'error');
            }
        } catch (error) {
            this.showMessage('Failed to create test data', 'error');
        }
    }

    getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1];
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

    formatToIST(timestamp) {
        if (!timestamp) return null;

        try {
            // Server now sends IST timestamps in format "2025-07-19 06:46:56"
            // Parse as local time since they are already in IST
            const date = new Date(timestamp);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.error('Invalid timestamp:', timestamp);
                return 'Invalid Date';
            }

            // Format as IST
            const formatter = new Intl.DateTimeFormat('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            return formatter.format(date);

        } catch (error) {
            console.error('Error formatting date:', error, timestamp);
            return 'Error formatting date';
        }
    }

    translateError(errorResponse) {
        if (typeof errorResponse === 'string') {
            return this.translator.t(errorResponse);
        }

        if (errorResponse.error) {
            let errorMsg = this.translator.t(errorResponse.error);

            // Handle errors that need data interpolation
            if (errorResponse.data && errorResponse.error === 'startOdometerMustBeGreater') {
                errorMsg = errorMsg.replace('{startOdometer}', errorResponse.data.startOdometer)
                              .replace('{endOdometer}', errorResponse.data.endOdometer);
            }

            return errorMsg;
        }

        return errorResponse;
    }

    logout() {
        localStorage.removeItem('authToken');
        this.token = null;
        this.currentUser = null;
        this.showAuthScreen();
    }

    showAdminPanel() {
        document.getElementById('admin-section').innerHTML = `
            <div class="admin-container">
                <h2>${this.translator.t('adminPanel')}</h2>

                <div class="admin-tabs">
                    <button id="drivers-tab" class="admin-tab-btn active" onclick="app.showAdminTab('drivers')">${this.translator.t('drivers')}</button>
                    <button id="shifts-tab" class="admin-tab-btn" onclick="app.showAdminTab('shifts')">${this.translator.t('shifts')}</button>
                    <button id="reports-tab" class="admin-tab-btn" onclick="app.showAdminTab('reports')">${this.translator.t('reports')}</button>
                    <button id="settings-tab" class="admin-tab-btn" onclick="app.showAdminTab('settings')">${this.translator.t('settings')}</button>
                </div>

                <div id="admin-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;

        this.showAdminTab('drivers');
    }

    showAdminTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');

        switch(tab) {
            case 'drivers':
                this.loadDriversManagement();
                break;
            case 'shifts':
                this.loadShiftsAnalytics();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadDriversManagement() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('driversManagement')}</h3>
                    <button class="action-btn secondary" onclick="app.loadDriversData()">
                        ${this.translator.t('refresh')}
                    </button>
                </div>
                <div id="drivers-list" class="data-table-container">
                    <div class="loading">${this.translator.t('loading')}...</div>
                </div>
            </div>
        `;

        await this.loadDriversData();
    }

    async loadDriversData() {
        try {
            const response = await fetch('/api/admin/drivers', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayDriversTable(data.drivers);
            } else {
                document.getElementById('drivers-list').innerHTML = 
                    `<div class="error">${this.translator.t('failedToLoadDrivers')}</div>`;
            }
        } catch (error) {
            document.getElementById('drivers-list').innerHTML = 
                `<div class="error">${this.translator.t('connectionError')}</div>`;
        }
    }

    displayDriversTable(drivers) {
        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${this.translator.t('id')}</th>
                        <th>${this.translator.t('name')}</th>
                        <th>${this.translator.t('phone')}</th>
                        <th>${this.translator.t('email')}</th>
                        <th>${this.translator.t('verified')}</th>
                        <th>${this.translator.t('status')}</th>
                        <th>${this.translator.t('joinDate')}</th>
                        <th>${this.translator.t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${drivers.map(driver => `
                        <tr>
                            <td>#${driver.id}</td>
                            <td>${driver.name}</td>
                            <td>${driver.phone}</td>
                            <td>${driver.email || '-'}</td>
                            <td><span class="status-badge ${driver.is_phone_verified ? 'verified' : 'unverified'}">
                                ${driver.is_phone_verified ? this.translator.t('verified') : this.translator.t('unverified')}
                            </span></td>
                            <td><span class="status-badge ${driver.is_active ? 'active' : 'inactive'}">
                                ${driver.is_active ? this.translator.t('active') : this.translator.t('inactive')}
                            </span></td>
                            <td>${this.formatToIST(driver.created_at)}</td>
                            <td>
                                <button class="btn-small" onclick="app.viewDriverDetails(${driver.id})">
                                    ${this.translator.t('view')}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('drivers-list').innerHTML = tableHtml;
    }

    async loadShiftsAnalytics() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('shiftsAnalytics')}</h3>
                    <div class="filter-controls">
                        <select id="analytics-filter" onchange="app.filterShiftsAnalytics()">
                            <option value="today">${this.translator.t('today')}</option>
                            <option value="week">${this.translator.t('thisWeek')}</option>
                            <option value="month">${this.translator.t('thisMonth')}</option>
                            <option value="all">${this.translator.t('allTime')}</option>
                        </select>
                        <button class="action-btn secondary" onclick="app.loadShiftsAnalyticsData()">
                            ${this.translator.t('refresh')}
                        </button>
                    </div>
                </div>

                <div id="analytics-summary" class="analytics-cards">
                    <!-- Summary cards will be loaded here -->
                </div>

                <div id="shifts-analytics-list" class="data-table-container">
                    <div class="loading">${this.translator.t('loading')}...</div>
                </div>
            </div>
        `;

        await this.loadShiftsAnalyticsData();
    }

    async loadShiftsAnalyticsData() {
        try {
            const filter = document.getElementById('analytics-filter')?.value || 'today';
            const response = await fetch(`/api/admin/shifts?filter=${filter}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayAnalyticsSummary(data.summary);
                this.displayShiftsAnalyticsTable(data.shifts);
            } else {
                document.getElementById('shifts-analytics-list').innerHTML = 
                    `<div class="error">${this.translator.t('failedToLoadShifts')}</div>`;
            }
        } catch (error) {
            document.getElementById('shifts-analytics-list').innerHTML = 
                `<div class="error">${this.translator.t('connectionError')}</div>`;
        }
    }

    displayAnalyticsSummary(summary) {
        const summaryHtml = `
            <div class="analytics-card">
                <h4>${this.translator.t('totalShifts')}</h4>
                <div class="stat-value">${summary.totalShifts || 0}</div>
            </div>
            <div class="analytics-card">
                <h4>${this.translator.t('totalDistance')}</h4>
                <div class="stat-value">${summary.totalDistance || 0} ${this.translator.t('km')}</div>
            </div>
            <div class="analytics-card">
                <h4>${this.translator.t('totalHours')}</h4>
                <div class="stat-value">${Math.round((summary.totalMinutes || 0) / 60 * 10) / 10}h</div>
            </div>
            <div class="analytics-card">
                <h4>${this.translator.t('activeDrivers')}</h4>
                <div class="stat-value">${summary.activeDrivers || 0}</div>
            </div>
        `;

        document.getElementById('analytics-summary').innerHTML = summaryHtml;
    }

    displayShiftsAnalyticsTable(shifts) {
        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${this.translator.t('shiftId')}</th>
                        <th>${this.translator.t('driver')}</th>
                        <th>${this.translator.t('start')}</th>
                        <th>${this.translator.t('end')}</th>
                        <th>${this.translator.t('startOdometer')}</th>
                        <th>${this.translator.t('endOdometer')}</th>
                        <th>${this.translator.t('distance')}</th>
                        <th>${this.translator.t('duration')}</th>
                        <th>${this.translator.t('status')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${shifts.map(shift => `
                        <tr>
                            <td>#${shift.id}</td>
                            <td>${shift.driver_name}</td>
                            <td>${this.formatToIST(shift.clock_in_time)}</td>
                            <td>${shift.clock_out_time ? this.formatToIST(shift.clock_out_time) : '-'}</td>
                            <td>${shift.start_odometer} ${this.translator.t('km')}</td>
                            <td>${shift.end_odometer ? shift.end_odometer + ' ' + this.translator.t('km') : '-'}</td>
                            <td>${shift.total_distance || 0} ${this.translator.t('km')}</td>
                            <td>${shift.shift_duration_minutes ? Math.round(shift.shift_duration_minutes / 60 * 10) / 10 + 'h' : '-'}</td>
                            <td><span class="status-badge ${shift.status || 'active'}">
                                ${shift.status === 'completed' ? this.translator.t('completed') : this.translator.t('active')}
                            </span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('shifts-analytics-list').innerHTML = tableHtml;
    }

    async loadReports() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('reports')}</h3>
                </div>

                <div class="reports-grid">
                    <div class="report-card">
                        <h4>${this.translator.t('monthlyReport')}</h4>
                        <p>${this.translator.t('monthlyReportDesc')}</p>
                        <div class="report-controls">
                            <select id="report-month">
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7" selected>July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <select id="report-year">
                                <option value="2024">2024</option>
                                <option value="2025" selected>2025</option>
                                <option value="2026">2026</option>
                            </select>
                            <button class="action-btn" onclick="app.generateMonthlyReport()">
                                ${this.translator.t('generate')}
                            </button>
                        </div>
                    </div>

                    <div class="report-card">
                        <h4>${this.translator.t('driverReport')}</h4>
                        <p>${this.translator.t('driverReportDesc')}</p>
                        <button class="action-btn" onclick="app.generateDriverReport()">
                            ${this.translator.t('generate')}
                        </button>
                    </div>
                </div>

                <div id="report-results" class="report-results">
                    <!-- Generated reports will appear here -->
                </div>
            </div>
        `;
    }

    async generateMonthlyReport() {
        const month = document.getElementById('report-month').value;
        const year = document.getElementById('report-year').value;

        try {
            const response = await fetch(`/api/admin/reports/monthly?month=${month}&year=${year}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayMonthlyReport(data);
            } else {
                document.getElementById('report-results').innerHTML = 
                    `<div class="error">${this.translator.t('failedToGenerateReport')}</div>`;
            }
        } catch (error) {
            document.getElementById('report-results').innerHTML = 
                `<div class="error">${this.translator.t('connectionError')}</div>`;
        }
    }

    displayMonthlyReport(data) {
        const reportHtml = `
            <div class="report-container">
                <h4>${this.translator.t('monthlyReport')} - ${data.month}/${data.year}</h4>

                <div class="report-summary">
                    <div class="summary-item">
                        <span>${this.translator.t('totalShifts')}:</span>
                        <strong>${data.summary.totalShifts}</strong>
                    </div>
                    <div class="summary-item">
                        <span>${this.translator.t('totalHours')}:</span>
                        <strong>${Math.round(data.summary.totalMinutes / 60 * 10) / 10}h</strong>
                    </div>
                    <div class="summary-item">
                        <span>${this.translator.t('totalDistance')}:</span>
                        <strong>${data.summary.totalDistance} ${this.translator.t('km')}</strong>
                    </div>
                    <div class="summary-item">
                        <span>${this.translator.t('avgShiftLength')}:</span>
                        <strong>${Math.round(data.summary.avgShiftMinutes / 60 * 10) / 10}h</strong>
                    </div>
                </div>

                <table class="report-table">
                    <thead>
                        <tr>
                            <th>${this.translator.t('date')}</th>
                            <th>${this.translator.t('shifts')}</th>
                            <th>${this.translator.t('hours')}</th>
                            <th>${this.translator.t('distance')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.dailyBreakdown.map(day => `
                            <tr>
                                <td>${day.date}</td>
                                <td>${day.shifts}</td>
                                <td>${Math.round(day.minutes / 60 * 10) / 10}h</td>
                                <td>${day.distance} ${this.translator.t('km')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('report-results').innerHTML = reportHtml;
    }

    filterShiftsAnalytics() {
        this.loadShiftsAnalyticsData();
    }

    async generateDriverReport() {
        // Placeholder for driver report generation
        document.getElementById('report-results').innerHTML = `
            <div class="report-container">
                <h4>${this.translator.t('driverReport')}</h4>
                <p>Driver performance reports will be available in a future update.</p>
            </div>
        `;
    }

    async viewDriverDetails(driverId) {
        try {
            const response = await fetch(`/api/admin/driver/${driverId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayDriverDetailsModal(data.driver);
            } else {
                this.showMessage('Failed to load driver details', 'error');
            }
        } catch (error) {
            this.showMessage('Connection error', 'error');
        }
    }

    displayDriverDetailsModal(driver) {
        const modalHtml = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Driver Details - ${driver.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="driver-detail-grid">
                            <div class="detail-item">
                                <strong>ID:</strong> #${driver.id}
                            </div>
                            <div class="detail-item">
                                <strong>Name:</strong> ${driver.name}
                            </div>
                            <div class="detail-item">
                                <strong>Phone:</strong> ${driver.phone}
                            </div>
                            <div class="detail-item">
                                <strong>Email:</strong> ${driver.email || 'Not provided'}
                            </div>
                            <div class="detail-item">
                                <strong>Status:</strong> 
                                <span class="status-badge ${driver.is_active ? 'active' : 'inactive'}">
                                    ${driver.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div class="detail-item">
                                <strong>Verified:</strong> 
                                <span class="status-badge ${driver.is_phone_verified ? 'verified' : 'unverified'}">
                                    ${driver.is_phone_verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            <div class="detail-item">
                                <strong>Join Date:</strong> ${this.formatToIST(driver.created_at)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    confirmAction(action) {
        const actionText = action === 'backup' ? 'backup all data' : 'clear all test data';
        if (confirm(`Are you sure you want to ${actionText}? This action cannot be undone.`)) {
            if (action === 'backup') {
                this.showMessage('Backup functionality will be available in a future update', 'info');
            } else {
                this.showMessage('Clear test data functionality will be available in a future update', 'info');
            }
        }
    }

    loadSettings() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('systemSettings')}</h3>
                </div>

                <div class="settings-grid">
                    <div class="setting-card">
                        <h4>${this.translator.t('applicationSettings')}</h4>
                        <div class="setting-item">
                            <label>${this.translator.t('defaultLanguage')}:</label>
                            <select id="default-language">
                                <option value="en">English</option>
                                <option value="ta">தமிழ்</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label>${this.translator.t('timezone')}:</label>
                            <select id="timezone-setting">
                                <option value="Asia/Kolkata" selected>IST (Asia/Kolkata)</option>
                                <option value="UTC">UTC</option>
                            </select>
                        </div>
                    </div>

                    <div class="setting-card">
                        <h4>${this.translator.t('dataManagement')}</h4>
                        <button class="action-btn warning" onclick="app.confirmAction('backup')">
                            ${this.translator.t('backupData')}
                        </button>
                        <button class="action-btn danger" onclick="app.confirmAction('clear')">
                            ${this.translator.t('clearTestData')}
                        </button>
                    </div>

                    <div class="setting-card">
                        <h4>${this.translator.t('systemInfo')}</h4>
                        <div class="info-item">
                            <span>${this.translator.t('version')}:</span>
                            <span>1.0.0</span>
                        </div>
                        <div class="info-item">
                            <span>${this.translator.t('database')}:</span>
                            <span>SQLite</span>
                        </div>
                        <div class="info-item">
                            <span>${this.translator.t('uptime')}:</span>
                            <span id="uptime-display">-</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DriverApp();
});