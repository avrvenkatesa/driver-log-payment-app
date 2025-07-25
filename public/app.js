// Check for browser compatibility
if (!window.Promise || !window.fetch || !Array.from) {
    alert('Your browser is not supported. Please use a modern browser like Chrome, Firefox, Safari, or Edge.');
}

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
            // Load currentUser from localStorage if available
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
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
        document.getElementById('view-payroll-btn')?.addEventListener('click', () => this.loadDriverPayroll());
        document.getElementById('request-leave-btn')?.addEventListener('click', () => this.showLeaveRequestForm());
        document.getElementById('view-leave-requests-btn')?.addEventListener('click', () => this.loadLeaveRequests());

        // Form submissions
        document.getElementById('clock-in-form')?.addEventListener('submit', (e) => this.handleClockIn(e));
        document.getElementById('clock-out-form')?.addEventListener('submit', (e) => this.handleClockOut(e));
        document.getElementById('leave-request-form')?.addEventListener('submit', (e) => this.handleLeaveRequest(e));



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
                <h2>${this.translator.t('welcome')}, ${this.currentUser?.name || 'Driver'}!</h2>
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
                <button id="view-payroll-btn" class="action-btn">${this.translator.t('viewPayroll')}</button>
                <button id="request-leave-btn" class="action-btn">${this.translator.t('requestLeave')}</button>
                <button id="view-leave-requests-btn" class="action-btn">${this.translator.t('viewLeaveRequests')}</button>
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
                localStorage.setItem('currentUser', JSON.stringify(data.driver));
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

    async loadDriverPayroll() {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const response = await fetch(`/api/driver/payroll/${year}/${month}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();
            const shiftsDiv = document.getElementById('shifts-display');

            if (data.payroll) {
                const payroll = data.payroll;

                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('payrollSummary')} - ${this.getMonthName(month)} ${year}</h3>

                        <div class="payroll-summary">
                            <div class="payroll-section">
                                <h4>${this.translator.t('workSummary')}:</h4>
                                <p>${this.translator.t('totalShifts')}: ${payroll.shifts}</p>
                                <p>${this.translator.t('daysWorked')}: ${payroll.daysWorked}</p>
                                <p>${this.translator.t('totalDistance')}: ${payroll.totalDistance} ${this.translator.t('km')}</p>
                                <p>${this.translator.t('regularHours')}: ${payroll.regularHours}h</p>
                                <p>${this.translator.t('overtimeHours')}: ${payroll.overtimeHours}h</p>
                            </div>

                            ${payroll.totalLeaveDays > 0 ? `
                            <div class="payroll-section">
                                <h4>Leave Summary:</h4>
                                <p>Total Leave Days: ${payroll.totalLeaveDays}</p>
                                <p>Paid Leaves: ${payroll.paidLeavesThisMonth}</p>
                                <p>Unpaid Leaves: ${payroll.unpaidLeavesThisMonth}</p>
                                <p>Annual Leaves Used: ${payroll.annualLeaveCount} / 12</p>
                            </div>
                            ` : ''}

                            <div class="payroll-section">
                                <h4>${this.translator.t('paymentBreakdown')}:</h4>
                                <p>Base Salary: ₹${payroll.baseSalary.toLocaleString()}</p>
                                ${payroll.unpaidLeaveDeduction > 0 ? `
                                    <p>Unpaid Leave Deduction: -₹${payroll.unpaidLeaveDeduction.toLocaleString()}</p>
                                    <p><strong>Adjusted Base Salary: ₹${payroll.adjustedBaseSalary.toLocaleString()}</strong></p>
                                ` : ''}
                                <p>${this.translator.t('overtimePay')}: ₹${payroll.overtimePay.toLocaleString()} 
                                    <button id="show-overtime-details-btn" class="btn-small" style="margin-left: 10px;">Show Details</button>
                                </p>
                                <div id="overtime-details" style="display: none; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                                    <!-- Overtime details will be populated here -->
                                </div>
                                <p>Fuel Allowance: ₹${payroll.fuelAllowance.toLocaleString()} <small>(${payroll.daysWorked} days worked)</small>
                                    <button id="show-fuel-details-btn" class="btn-small" style="margin-left: 10px;">Show Details</button>
                                </p>
                                <div id="fuel-details" style="display: none; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                                    <!-- Fuel allowance details will be populated here -->
                                </div>
                                <hr style="margin: 10px 0;">
                                <p><strong>${this.translator.t('grossPay')}: ₹${payroll.grossPay.toLocaleString()}</strong></p>
                            </div>
                        </div>

                        <div class="payroll-notes">
                            <small>
                                <p>• ${this.translator.t('overtimeNote')}</p>
                                <p>• ${this.translator.t('fuelAllowanceNote')}</p>
                            </small>
                        </div>
                    </div>
                `;

                // Set up overtime details button event listener
                const overtimeDetailsBtn = document.getElementById('show-overtime-details-btn');
                if (overtimeDetailsBtn) {
                    overtimeDetailsBtn.addEventListener('click', () => this.toggleOvertimeDetails(payroll));
                }

                // Set up fuel allowance details button event listener
                const fuelDetailsBtn = document.getElementById('show-fuel-details-btn');
                if (fuelDetailsBtn) {
                    fuelDetailsBtn.addEventListener('click', () => this.toggleFuelDetails(payroll));
                }
            } else {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('payrollSummary')} - ${this.getMonthName(month)} ${year}</h3>
                        <p>${this.translator.t('noPayrollData')}</p>
                    </div>
                `;
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToLoadPayroll'), 'error');
        }
    }

    toggleOvertimeDetails(payroll) {
        const detailsDiv = document.getElementById('overtime-details');
        const button = document.getElementById('show-overtime-details-btn');
        
        if (detailsDiv.style.display === 'none') {
            // Show details
            this.displayOvertimeDetails(payroll);
            detailsDiv.style.display = 'block';
            button.textContent = 'Hide Details';
        } else {
            // Hide details
            detailsDiv.style.display = 'none';
            button.textContent = 'Show Details';
        }
    }

    showLeaveRequestForm() {
        document.getElementById('action-forms').innerHTML = `
            <div class="form-card">
                <h3>${this.translator.t('requestLeave')}</h3>
                <form id="leave-request-form">
                    <div class="form-group">
                        <label for="leave-date">${this.translator.t('leaveDate')}:</label>
                        <input type="date" id="leave-date" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="leave-reason">${this.translator.t('reason')}:</label>
                        <textarea id="leave-reason" required placeholder="${this.translator.t('enterReasonForLeave')}" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="leave-type">${this.translator.t('leaveType')}:</label>
                        <select id="leave-type">
                            <option value="annual">${this.translator.t('annualLeave')}</option>
                            <option value="sick">${this.translator.t('sickLeave')}</option>
                            <option value="emergency">${this.translator.t('emergencyLeave')}</option>
                        </select>
                    </div>
                    <button type="submit" class="action-btn">${this.translator.t('submitRequest')}</button>
                    <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.remove()">${this.translator.t('cancel')}</button>
                </form>
            </div>
        `;
        this.setupEventListeners();
    }

    async handleLeaveRequest(e) {
        e.preventDefault();
        const leaveDate = document.getElementById('leave-date').value;
        const reason = document.getElementById('leave-reason').value;
        const leaveType = document.getElementById('leave-type').value;

        // Validate inputs
        if (!leaveDate || !reason.trim()) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        console.log('Submitting leave request:', { leaveDate, reason, leaveType });

        try {
            const response = await fetch('/api/driver/leave-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ leaveDate, reason, leaveType })
            });

            console.log('Leave request response status:', response.status);
            
            const data = await response.json();
            console.log('Leave request response data:', data);

            if (response.ok) {
                this.showMessage(this.translator.t('leaveRequestSubmitted'), 'success');
                document.getElementById('action-forms').innerHTML = '';
            } else {
                const errorMessage = this.translateError(data.error) || this.translator.t('failedToSubmitLeave');
                console.error('Leave request failed:', errorMessage, data);
                this.showMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Leave request error:', error);
            this.showMessage(this.translator.t('errorSubmittingLeave') + ': ' + error.message, 'error');
        }
    }

    async loadLeaveRequests() {
        try {
            const currentYear = new Date().getFullYear();
            const response = await fetch(`/api/driver/leave-requests/${currentYear}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();
            const shiftsDiv = document.getElementById('shifts-display');

            if (data.leaveRequests.length > 0) {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('leaveRequests')} - ${currentYear}</h3>
                        <div class="leave-summary">
                            <p><strong>${this.translator.t('annualLeavesUsed')}:</strong> ${data.annualLeaveCount} / 12</p>
                            <p><strong>${this.translator.t('remainingLeaves')}:</strong> ${data.remainingLeaves}</p>
                        </div>
                        <hr style="margin: 15px 0;">
                        ${data.leaveRequests.map(leave => `
                            <div class="leave-item">
                                <p><strong>${this.translator.t('shift')} #${leave.id}</strong></p>
                                <p><strong>${this.translator.t('date')}:</strong> ${leave.leave_date}</p>
                                <p><strong>${this.translator.t('type')}:</strong> ${leave.leave_type}</p>
                                <p><strong>${this.translator.t('reason')}:</strong> ${leave.reason}</p>
                                <p><strong>${this.translator.t('status')}:</strong> <span class="status-badge ${leave.status}">${leave.status}</span></p>
                                <p><strong>${this.translator.t('requested')}:</strong> ${this.formatToIST(leave.requested_at)}</p>
                                ${leave.approved_at ? `<p><strong>${this.translator.t('processed')}:</strong> ${this.formatToIST(leave.approved_at)}</p>` : ''}
                                ${leave.approved_by ? `<p><strong>${this.translator.t('processedBy')}:</strong> ${leave.approved_by}</p>` : ''}
                                ${leave.notes ? `<p><strong>${this.translator.t('notes')}:</strong> ${leave.notes}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                shiftsDiv.innerHTML = `
                    <div class="shifts-card">
                        <h3>${this.translator.t('leaveRequests')} - ${currentYear}</h3>
                        <div class="leave-summary">
                            <p><strong>${this.translator.t('annualLeavesUsed')}:</strong> ${data.annualLeaveCount} / 12</p>
                            <p><strong>${this.translator.t('remainingLeaves')}:</strong> ${data.remainingLeaves}</p>
                        </div>
                        <p>${this.translator.t('noLeaveRequestsFound')}</p>
                    </div>
                `;
            }
        } catch (error) {
            this.showMessage(this.translator.t('failedToLoadLeaveRequests'), 'error');
        }
    }

    toggleFuelDetails(payroll) {
        const detailsDiv = document.getElementById('fuel-details');
        const button = document.getElementById('show-fuel-details-btn');
        
        if (detailsDiv.style.display === 'none') {
            // Show details
            this.displayFuelDetails(payroll);
            detailsDiv.style.display = 'block';
            button.textContent = 'Hide Details';
        } else {
            // Hide details
            detailsDiv.style.display = 'none';
            button.textContent = 'Show Details';
        }
    }

    displayFuelDetails(payroll) {
        const detailsDiv = document.getElementById('fuel-details');
        
        if (!payroll.shiftsDetails || payroll.shiftsDetails.length === 0) {
            detailsDiv.innerHTML = '<p>No fuel allowance details available.</p>';
            return;
        }

        // Group shifts by date to show daily fuel allowance
        const workDaysByDate = {};
        const FUEL_ALLOWANCE_PER_DAY = 33.30; // ₹33.30 per day

        payroll.shiftsDetails.forEach(shift => {
            const shiftDate = shift.clock_in_time.split(' ')[0]; // Get date part
            
            if (!workDaysByDate[shiftDate]) {
                workDaysByDate[shiftDate] = {
                    shifts: [],
                    totalDistance: 0
                };
            }
            
            workDaysByDate[shiftDate].shifts.push({
                shiftId: shift.id,
                startTime: this.formatToIST(shift.clock_in_time),
                endTime: this.formatToIST(shift.clock_out_time),
                distance: shift.total_distance || 0
            });
            
            workDaysByDate[shiftDate].totalDistance += shift.total_distance || 0;
        });

        // Generate HTML for fuel allowance details
        const sortedDates = Object.keys(workDaysByDate).sort();
        
        if (sortedDates.length === 0) {
            detailsDiv.innerHTML = '<p>No work days found for this period.</p>';
            return;
        }

        let detailsHTML = '<h5>Fuel Allowance Details:</h5>';
        let totalFuelAllowance = 0;

        detailsHTML += `
            <table class="data-table" style="margin-top: 10px; font-size: 0.9em;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Shifts</th>
                        <th>Total Distance</th>
                        <th>Fuel Allowance</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedDates.map(date => {
                        const dayData = workDaysByDate[date];
                        const dailyFuelAllowance = FUEL_ALLOWANCE_PER_DAY;
                        totalFuelAllowance += dailyFuelAllowance;
                        
                        const shiftsDetail = dayData.shifts.map(shift => 
                            `#${shift.shiftId} (${shift.startTime} - ${shift.endTime}): ${shift.distance}km`
                        ).join('<br>');
                        
                        return `
                            <tr>
                                <td>${date}</td>
                                <td>${dayData.shifts.length}</td>
                                <td>${dayData.totalDistance} km</td>
                                <td>₹${dailyFuelAllowance.toLocaleString()}</td>
                                <td><small>${shiftsDetail}</small></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td><strong>Total Work Days</strong></td>
                        <td><strong>${sortedDates.length}</strong></td>
                        <td><strong>${Object.values(workDaysByDate).reduce((sum, day) => sum + day.totalDistance, 0)} km</strong></td>
                        <td><strong>₹${Math.round(totalFuelAllowance).toLocaleString()}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        `;

        detailsHTML += `
            <div style="margin-top: 10px; padding: 8px; background: #e3f2fd; border-radius: 4px; font-size: 0.9em;">
                <strong>Note:</strong> Fuel allowance is ₹${FUEL_ALLOWANCE_PER_DAY} per working day, regardless of distance or number of shifts per day.
            </div>
        `;

        detailsDiv.innerHTML = detailsHTML;
    }

    displayOvertimeDetails(payroll) {
        const detailsDiv = document.getElementById('overtime-details');
        
        if (!payroll.shiftsDetails || payroll.shiftsDetails.length === 0) {
            detailsDiv.innerHTML = '<p>No overtime details available.</p>';
            return;
        }

        // Group shifts by date and calculate overtime for each
        const overtimeByDate = {};
        const OVERTIME_RATE = 100; // ₹100 per hour

        payroll.shiftsDetails.forEach(shift => {
            const shiftDate = shift.clock_in_time.split(' ')[0]; // Get date part
            const clockInTime = new Date(shift.clock_in_time);
            const clockOutTime = new Date(shift.clock_out_time);
            
            if (!clockOutTime || !shift.shift_duration_minutes) return;

            const shiftDuration = shift.shift_duration_minutes;
            let overtimeMinutes = 0;
            let overtimeReason = [];

            // Check if it's Sunday (overtime)
            const dayOfWeek = clockInTime.getDay();
            if (dayOfWeek === 0) {
                overtimeMinutes += shiftDuration;
                overtimeReason.push('Sunday work');
            } else {
                // Check for early morning overtime (before 8 AM)
                const startHour = clockInTime.getHours();
                if (startHour < 8) {
                    const earlyMinutes = (8 - startHour) * 60 - clockInTime.getMinutes();
                    const earlyOT = Math.min(earlyMinutes, shiftDuration);
                    if (earlyOT > 0) {
                        overtimeMinutes += earlyOT;
                        overtimeReason.push(`Early start (before 8 AM): ${Math.round(earlyOT / 60 * 10) / 10}h`);
                    }
                }

                // Check for late evening overtime (after 8 PM)
                const endHour = clockOutTime.getHours();
                if (endHour >= 20 || (endHour === 19 && clockOutTime.getMinutes() > 0)) {
                    const lateStart = new Date(clockOutTime);
                    lateStart.setHours(20, 0, 0, 0);
                    if (clockOutTime > lateStart) {
                        const lateMinutes = (clockOutTime - lateStart) / (1000 * 60);
                        overtimeMinutes += lateMinutes;
                        overtimeReason.push(`Late work (after 8 PM): ${Math.round(lateMinutes / 60 * 10) / 10}h`);
                    }
                }
            }

            if (overtimeMinutes > 0) {
                if (!overtimeByDate[shiftDate]) {
                    overtimeByDate[shiftDate] = {
                        totalOvertimeMinutes: 0,
                        shifts: []
                    };
                }
                
                const overtimeHours = overtimeMinutes / 60;
                const overtimePay = overtimeHours * OVERTIME_RATE;
                
                overtimeByDate[shiftDate].totalOvertimeMinutes += overtimeMinutes;
                overtimeByDate[shiftDate].shifts.push({
                    shiftId: shift.id,
                    startTime: this.formatToIST(shift.clock_in_time),
                    endTime: this.formatToIST(shift.clock_out_time),
                    overtimeMinutes: Math.round(overtimeMinutes),
                    overtimeHours: Math.round(overtimeHours * 100) / 100,
                    overtimePay: Math.round(overtimePay * 100) / 100,
                    reason: overtimeReason.join(', ')
                });
            }
        });

        // Generate HTML for overtime details
        const sortedDates = Object.keys(overtimeByDate).sort();
        
        if (sortedDates.length === 0) {
            detailsDiv.innerHTML = '<p>No overtime work found for this period.</p>';
            return;
        }

        let detailsHTML = '<h5>Overtime Work Details:</h5>';
        let totalOvertimePay = 0;
        let allShifts = [];

        // Collect all shifts from all dates
        sortedDates.forEach(date => {
            const dayData = overtimeByDate[date];
            dayData.shifts.forEach(shift => {
                allShifts.push({
                    date: date,
                    ...shift
                });
            });
        });

        // Calculate total overtime pay
        allShifts.forEach(shift => {
            totalOvertimePay += shift.overtimePay;
        });

        detailsHTML += `
            <table class="data-table" style="margin-top: 10px; font-size: 0.9em;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Shift #</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>OT Hours</th>
                        <th>OT Pay</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    ${allShifts.map(shift => `
                        <tr>
                            <td>${shift.date}</td>
                            <td>#${shift.shiftId}</td>
                            <td>${shift.startTime}</td>
                            <td>${shift.endTime}</td>
                            <td>${shift.overtimeHours}h</td>
                            <td>₹${shift.overtimePay.toLocaleString()}</td>
                            <td>${shift.reason}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td colspan="4"><strong>Total Overtime</strong></td>
                        <td><strong>${Math.round(allShifts.reduce((sum, shift) => sum + shift.overtimeHours, 0) * 100) / 100}h</strong></td>
                        <td><strong>₹${Math.round(totalOvertimePay).toLocaleString()}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        `;

        detailsDiv.innerHTML = detailsHTML;
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

            // Handle leave request specific errors
            if (errorResponse.error === 'Leave request already exists for this date') {
                return this.translator.t('leaveRequestAlreadyExists');
            }

            return errorMsg;
        }

        return errorResponse;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.token = null;
        this.currentUser = null;
        this.showAuthScreen();
    }

    showAdminPanel() {
        document.getElementById('admin-section').innerHTML = `
            <div class="admin-container">
                <h2>${this.translator.t('adminPanel')}</h2>

                <div class="admin-tabs">
                    <button id="drivers-tab" class="admin-tab-btn active">${this.translator.t('drivers')}</button>
                    <button id="shifts-tab" class="admin-tab-btn">${this.translator.t('shifts')}</button>
                    <button id="payroll-tab" class="admin-tab-btn">${this.translator.t('payrollSummary')}</button>
                    <button id="shift-data-tab" class="admin-tab-btn">Shift Data</button>
                    <button id="leave-tab" class="admin-tab-btn">${this.translator.t('leaveRequests')}</button>
                    <button id="reports-tab" class="admin-tab-btn">${this.translator.t('reports')}</button>
                    <button id="settings-tab" class="admin-tab-btn">${this.translator.t('settings')}</button>
                </div>

                <div id="admin-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;

        // Set up admin tab event listeners
        document.getElementById('drivers-tab')?.addEventListener('click', () => this.showAdminTab('drivers'));
        document.getElementById('shifts-tab')?.addEventListener('click', () => this.showAdminTab('shifts'));
        document.getElementById('payroll-tab')?.addEventListener('click', () => this.showAdminTab('payroll'));
        document.getElementById('shift-data-tab')?.addEventListener('click', () => this.showAdminTab('shift-data'));
        document.getElementById('leave-tab')?.addEventListener('click', () => this.showAdminTab('leave'));
        document.getElementById('reports-tab')?.addEventListener('click', () => this.showAdminTab('reports'));
        document.getElementById('settings-tab')?.addEventListener('click', () => this.showAdminTab('settings'));

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
            case 'payroll':
                this.loadPayrollSummary();
                break;
            case 'shift-data':
                this.loadShiftDataManagement();
                break;
            case 'leave':
                this.loadLeaveManagement();
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
                    <button id="refresh-drivers-btn" class="action-btn secondary">
                        ${this.translator.t('refresh')}
                    </button>
                </div>
                <div id="drivers-list" class="data-table-container">
                    <div class="loading">${this.translator.t('loading')}...</div>
                </div>
            </div>
        `;

        // Set up refresh button event listener
        document.getElementById('refresh-drivers-btn')?.addEventListener('click', () => this.loadDriversData());

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
                                <button class="btn-small view-btn" data-driver-id="${driver.id}">
                                    ${this.translator.t('view')}
                                </button>
                                ${driver.is_active ? 
                                    `<button class="btn-small danger deactivate-btn" data-driver-id="${driver.id}" data-driver-name="${driver.name}">
                                        Deactivate
                                    </button>` :
                                    `<button class="btn-small success activate-btn" data-driver-id="${driver.id}" data-driver-name="${driver.name}">
                                        Activate
                                    </button>`
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('drivers-list').innerHTML = tableHtml;

        // Set up view driver detail button event listeners
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const driverId = e.target.getAttribute('data-driver-id');
                this.viewDriverDetails(driverId);
            });
        });

        // Set up activate button event listeners
        document.querySelectorAll('.activate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const driverId = e.target.getAttribute('data-driver-id');
                const driverName = e.target.getAttribute('data-driver-name');
                this.updateDriverStatus(driverId, driverName, true);
            });
        });

        // Set up deactivate button event listeners
        document.querySelectorAll('.deactivate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const driverId = e.target.getAttribute('data-driver-id');
                const driverName = e.target.getAttribute('data-driver-name');
                this.updateDriverStatus(driverId, driverName, false);
            });
        });
    }

    async loadShiftsAnalytics() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('shiftsAnalytics')}</h3>
                    <div class="filter-controls">
                        <select id="analytics-filter">
                            <option value="today">${this.translator.t('today')}</option>
                            <option value="week">${this.translator.t('thisWeek')}</option>
                            <option value="month">${this.translator.t('thisMonth')}</option>
                            <option value="all">${this.translator.t('allTime')}</option>
                        </select>
                        <button id="refresh-analytics-btn" class="action-btn secondary">
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

        // Set up event listeners
        document.getElementById('analytics-filter')?.addEventListener('change', () => this.filterShiftsAnalytics());
        document.getElementById('refresh-analytics-btn')?.addEventListener('click', () => this.loadShiftsAnalyticsData());

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

    async loadPayrollSummary() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('payrollSummary')}</h3>
                    <div class="filter-controls">
                        <select id="payroll-view-type">
                            <option value="monthly">Monthly View</option>
                            <option value="ytd">Year-to-Date (YTD)</option>
                        </select>
                        <select id="payroll-month">
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
                        <select id="payroll-year">
                            <option value="2024">2024</option>
                            <option value="2025" selected>2025</option>
                            <option value="2026">2026</option>
                        </select>
                        <button id="load-payroll-btn" class="action-btn secondary">
                            Load Payroll
                        </button>
                        <button id="export-pdf-btn" class="action-btn success" style="display: none;">
                            Export to PDF
                        </button>
                    </div>
                </div>

                <div id="payroll-summary-display" class="data-table-container">
                    <div class="loading">${this.translator.t('selectMonthToLoadPayroll')}</div>
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('payroll-view-type')?.addEventListener('change', () => this.togglePayrollViewControls());
        document.getElementById('load-payroll-btn')?.addEventListener('click', () => this.loadPayrollData());
        document.getElementById('export-pdf-btn')?.addEventListener('click', () => this.exportPayrollToPDF());
        
        this.togglePayrollViewControls();
    }

    togglePayrollViewControls() {
        const viewType = document.getElementById('payroll-view-type').value;
        const monthSelect = document.getElementById('payroll-month');
        
        if (viewType === 'ytd') {
            monthSelect.style.display = 'none';
        } else {
            monthSelect.style.display = 'inline-block';
        }
    }

    async loadPayrollData() {
        try {
            const viewType = document.getElementById('payroll-view-type').value;
            const month = document.getElementById('payroll-month').value;
            const year = document.getElementById('payroll-year').value;

            let response;
            if (viewType === 'ytd') {
                response = await fetch(`/api/admin/payroll/ytd/${year}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            } else {
                response = await fetch(`/api/admin/payroll/${year}/${month}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }

            if (response.ok) {
                const data = await response.json();
                if (viewType === 'ytd') {
                    this.displayYTDPayrollSummary(data.payrollSummary, year);
                } else {
                    this.displayPayrollSummary(data.payrollSummary, month, year);
                }
                document.getElementById('export-pdf-btn').style.display = 'inline-block';
            } else {
                document.getElementById('payroll-summary-display').innerHTML = 
                    `<div class="error">${this.translator.t('failedToLoadPayroll')}</div>`;
            }
        } catch (error) {
            document.getElementById('payroll-summary-display').innerHTML = 
                `<div class="error">${this.translator.t('connectionError')}</div>`;
        }
    }

    displayPayrollSummary(payrollSummaries, month, year) {
        if (payrollSummaries.length === 0) {
            document.getElementById('payroll-summary-display').innerHTML = 
                `<div class="no-data">${this.translator.t('noPayrollDataForPeriod')}</div>`;
            return;
        }

        // Calculate totals
        const totals = payrollSummaries.reduce((acc, item) => {
            const payroll = item.payroll;
            acc.totalDrivers += 1;
            acc.totalShifts += payroll.shifts;
            acc.totalDistance += payroll.totalDistance;
            acc.totalRegularHours += payroll.regularHours;
            acc.totalOvertimeHours += payroll.overtimeHours;
            acc.totalBaseSalary += payroll.baseSalary;
            acc.totalOvertimePay += payroll.overtimePay;
            acc.totalFuelAllowance += payroll.fuelAllowance;
            acc.totalGrossPay += payroll.grossPay;
            return acc;
        }, {
            totalDrivers: 0,
            totalShifts: 0,
            totalDistance: 0,
            totalRegularHours: 0,
            totalOvertimeHours: 0,
            totalBaseSalary: 0,
            totalOvertimePay: 0,
            totalFuelAllowance: 0,
            totalGrossPay: 0
        });

        const tableHtml = `
            <div class="payroll-overview">
                <h4>${this.translator.t('payrollOverview')} - ${this.getMonthName(parseInt(month))} ${year}</h4>
                <div class="analytics-cards">
                    <div class="analytics-card">
                        <h4>${this.translator.t('totalDrivers')}</h4>
                        <div class="stat-value">${totals.totalDrivers}</div>
                    </div>
                    <div class="analytics-card">
                        <h4>${this.translator.t('totalShifts')}</h4>
                        <div class="stat-value">${totals.totalShifts}</div>
                    </div>
                    <div class="analytics-card">
                        <h4>${this.translator.t('totalDistance')}</h4>
                        <div class="stat-value">${totals.totalDistance} km</div>
                    </div>
                    <div class="analytics-card">
                        <h4>${this.translator.t('totalPayroll')}</h4>
                        <div class="stat-value">₹${totals.totalGrossPay.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>${this.translator.t('driver')}</th>
                        <th>${this.translator.t('shifts')}</th>
                        <th>${this.translator.t('days')}</th>
                        <th>${this.translator.t('regularHours')}</th>
                        <th>${this.translator.t('overtimeHours')}</th>
                        <th>${this.translator.t('baseSalary')}</th>
                        <th>${this.translator.t('overtimePay')}</th>
                        <th>${this.translator.t('fuelAllowance')}</th>
                        <th>${this.translator.t('grossPay')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${payrollSummaries.map((item, index) => {
                        const driver = item.driver;
                        const payroll = item.payroll;
                        return `
                            <tr>
                                <td>${driver.name}</td>
                                <td>${payroll.shifts}</td>
                                <td>${payroll.daysWorked}</td>
                                <td>${payroll.regularHours}h</td>
                                <td>${payroll.overtimeHours}h</td>
                                <td>₹${payroll.baseSalary.toLocaleString()}</td>
                                <td>
                                    ₹${payroll.overtimePay.toLocaleString()}
                                    ${payroll.overtimePay > 0 ? `<button id="admin-show-overtime-details-btn-${index}" class="btn-small" style="margin-left: 10px;">Show Details</button>` : ''}
                                </td>
                                <td>
                                    ₹${payroll.fuelAllowance.toLocaleString()}
                                    ${payroll.fuelAllowance > 0 ? `<button id="admin-show-fuel-details-btn-${index}" class="btn-small" style="margin-left: 10px;">Show Details</button>` : ''}
                                </td>
                                <td><strong>₹${payroll.grossPay.toLocaleString()}</strong></td>
                            </tr>
                            ${payroll.overtimePay > 0 ? `
                            <tr id="admin-overtime-details-row-${index}" style="display: none;">
                                <td colspan="9">
                                    <div id="admin-overtime-details-${index}" style="padding: 10px; background: #f5f5f5; border-radius: 5px;">
                                        <!-- Overtime details will be populated here -->
                                    </div>
                                </td>
                            </tr>
                            ` : ''}
                            ${payroll.fuelAllowance > 0 ? `
                            <tr id="admin-fuel-details-row-${index}" style="display: none;">
                                <td colspan="9">
                                    <div id="admin-fuel-details-${index}" style="padding: 10px; background: #f5f5f5; border-radius: 5px;">
                                        <!-- Fuel allowance details will be populated here -->
                                    </div>
                                </td>
                            </tr>
                            ` : ''}
                        `;
                    }).join('')}
                    <tr class="totals-row">
                        <td><strong>TOTALS</strong></td>
                        <td><strong>${totals.totalShifts}</strong></td>
                        <td><strong>-</strong></td>
                        <td><strong>${Math.round(totals.totalRegularHours * 10) / 10}h</strong></td>
                        <td><strong>${Math.round(totals.totalOvertimeHours * 10) / 10}h</strong></td>
                        <td><strong>₹${totals.totalBaseSalary.toLocaleString()}</strong></td>
                        <td><strong>₹${Math.round(totals.totalOvertimePay).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.round(totals.totalFuelAllowance).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.round(totals.totalGrossPay).toLocaleString()}</strong></td>
                    </tr>
                </tbody>
            </table>
        `;

        document.getElementById('payroll-summary-display').innerHTML = tableHtml;

        // Set up overtime details button event listeners for each driver
        payrollSummaries.forEach((item, index) => {
            const payroll = item.payroll;
            if (payroll.overtimePay > 0) {
                const overtimeDetailsBtn = document.getElementById(`admin-show-overtime-details-btn-${index}`);
                if (overtimeDetailsBtn) {
                    overtimeDetailsBtn.addEventListener('click', () => this.toggleAdminOvertimeDetails(payroll, index));
                }
            }
            
            // Set up fuel allowance details button event listeners
            if (payroll.fuelAllowance > 0) {
                const fuelDetailsBtn = document.getElementById(`admin-show-fuel-details-btn-${index}`);
                if (fuelDetailsBtn) {
                    fuelDetailsBtn.addEventListener('click', () => this.toggleAdminFuelDetails(payroll, index));
                }
            }
        });
    }

    displayYTDPayrollSummary(payrollSummaries, year) {
        if (payrollSummaries.length === 0) {
            document.getElementById('payroll-summary-display').innerHTML = 
                `<div class="no-data">No YTD payroll data available for ${year}</div>`;
            return;
        }

        // Calculate YTD totals
        const totals = payrollSummaries.reduce((acc, item) => {
            const payroll = item.payroll;
            acc.totalDrivers = Math.max(acc.totalDrivers, 1);
            acc.totalShifts += payroll.shifts;
            acc.totalDistance += payroll.totalDistance;
            acc.totalRegularHours += payroll.regularHours;
            acc.totalOvertimeHours += payroll.overtimeHours;
            acc.totalBaseSalary += payroll.baseSalary;
            acc.totalOvertimePay += payroll.overtimePay;
            acc.totalFuelAllowance += payroll.fuelAllowance;
            acc.totalGrossPay += payroll.grossPay;
            acc.totalDaysWorked += payroll.daysWorked;
            return acc;
        }, {
            totalDrivers: 0,
            totalShifts: 0,
            totalDistance: 0,
            totalRegularHours: 0,
            totalOvertimeHours: 0,
            totalBaseSalary: 0,
            totalOvertimePay: 0,
            totalFuelAllowance: 0,
            totalGrossPay: 0,
            totalDaysWorked: 0
        });

        const tableHtml = `
            <div class="payroll-overview">
                <h4>Year-to-Date Payroll Summary - ${year}</h4>
                <div class="analytics-cards">
                    <div class="analytics-card">
                        <h4>Active Drivers</h4>
                        <div class="stat-value">${payrollSummaries.length}</div>
                    </div>
                    <div class="analytics-card">
                        <h4>Total Shifts</h4>
                        <div class="stat-value">${totals.totalShifts}</div>
                    </div>
                    <div class="analytics-card">
                        <h4>Total Distance</h4>
                        <div class="stat-value">${totals.totalDistance} km</div>
                    </div>
                    <div class="analytics-card">
                        <h4>Total YTD Payroll</h4>
                        <div class="stat-value">₹${totals.totalGrossPay.toLocaleString()}</div>
                    </div>
                    <div class="analytics-card">
                        <h4>Total Days Worked</h4>
                        <div class="stat-value">${totals.totalDaysWorked}</div>
                    </div>
                    <div class="analytics-card">
                        <h4>Total Overtime Hours</h4>
                        <div class="stat-value">${Math.round(totals.totalOvertimeHours * 10) / 10}h</div>
                    </div>
                </div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Driver</th>
                        <th>YTD Shifts</th>
                        <th>YTD Days</th>
                        <th>YTD Distance</th>
                        <th>YTD Regular Hours</th>
                        <th>YTD Overtime Hours</th>
                        <th>YTD Base Salary</th>
                        <th>YTD Overtime Pay</th>
                        <th>YTD Fuel Allowance</th>
                        <th>YTD Gross Pay</th>
                    </tr>
                </thead>
                <tbody>
                    ${payrollSummaries.map(item => {
                        const driver = item.driver;
                        const payroll = item.payroll;
                        return `
                            <tr>
                                <td><strong>${driver.name}</strong><br><small>${driver.phone}</small></td>
                                <td>${payroll.shifts}</td>
                                <td>${payroll.daysWorked}</td>
                                <td>${payroll.totalDistance} km</td>
                                <td>${payroll.regularHours}h</td>
                                <td>${payroll.overtimeHours}h</td>
                                <td>₹${payroll.baseSalary.toLocaleString()}</td>
                                <td>₹${payroll.overtimePay.toLocaleString()}</td>
                                <td>₹${payroll.fuelAllowance.toLocaleString()}</td>
                                <td><strong>₹${payroll.grossPay.toLocaleString()}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="totals-row">
                        <td><strong>TOTALS</strong></td>
                        <td><strong>${totals.totalShifts}</strong></td>
                        <td><strong>${totals.totalDaysWorked}</strong></td>
                        <td><strong>${totals.totalDistance} km</strong></td>
                        <td><strong>${Math.round(totals.totalRegularHours * 10) / 10}h</strong></td>
                        <td><strong>${Math.round(totals.totalOvertimeHours * 10) / 10}h</strong></td>
                        <td><strong>₹${totals.totalBaseSalary.toLocaleString()}</strong></td>
                        <td><strong>₹${Math.round(totals.totalOvertimePay).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.round(totals.totalFuelAllowance).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.round(totals.totalGrossPay).toLocaleString()}</strong></td>
                    </tr>
                </tbody>
            </table>
        `;

        document.getElementById('payroll-summary-display').innerHTML = tableHtml;
    }

    async exportPayrollToPDF() {
        const viewType = document.getElementById('payroll-view-type').value;
        const month = document.getElementById('payroll-month').value;
        const year = document.getElementById('payroll-year').value;
        
        const exportBtn = document.getElementById('export-pdf-btn');
        const originalText = exportBtn.textContent;
        exportBtn.textContent = 'Generating PDF...';
        exportBtn.disabled = true;

        try {
            let url;
            let filename;
            
            if (viewType === 'ytd') {
                url = `/api/admin/payroll/ytd/${year}/export`;
                filename = `YTD_Payroll_${year}.pdf`;
            } else {
                url = `/api/admin/payroll/${year}/${month}/export`;
                filename = `Payroll_${this.getMonthName(parseInt(month))}_${year}.pdf`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(a);
                
                this.showMessage('PDF export completed successfully', 'success');
            } else {
                this.showMessage('Failed to export PDF', 'error');
            }
        } catch (error) {
            this.showMessage('Error exporting PDF', 'error');
        } finally {
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        }
    }

    toggleAdminOvertimeDetails(payroll, index) {
        const detailsRow = document.getElementById(`admin-overtime-details-row-${index}`);
        const button = document.getElementById(`admin-show-overtime-details-btn-${index}`);
        
        if (detailsRow.style.display === 'none') {
            // Show details
            this.displayAdminOvertimeDetails(payroll, index);
            detailsRow.style.display = 'table-row';
            button.textContent = 'Hide Details';
        } else {
            // Hide details
            detailsRow.style.display = 'none';
            button.textContent = 'Show Details';
        }
    }

    toggleAdminFuelDetails(payroll, index) {
        const detailsRow = document.getElementById(`admin-fuel-details-row-${index}`);
        const button = document.getElementById(`admin-show-fuel-details-btn-${index}`);
        
        if (detailsRow.style.display === 'none') {
            // Show details
            this.displayAdminFuelDetails(payroll, index);
            detailsRow.style.display = 'table-row';
            button.textContent = 'Hide Details';
        } else {
            // Hide details
            detailsRow.style.display = 'none';
            button.textContent = 'Show Details';
        }
    }

    displayAdminFuelDetails(payroll, index) {
        const detailsDiv = document.getElementById(`admin-fuel-details-${index}`);
        
        if (!payroll.shiftsDetails || payroll.shiftsDetails.length === 0) {
            detailsDiv.innerHTML = '<p>No fuel allowance details available.</p>';
            return;
        }

        // Group shifts by date to show daily fuel allowance
        const workDaysByDate = {};
        const FUEL_ALLOWANCE_PER_DAY = 33.30; // ₹33.30 per day

        payroll.shiftsDetails.forEach(shift => {
            const shiftDate = shift.clock_in_time.split(' ')[0]; // Get date part
            
            if (!workDaysByDate[shiftDate]) {
                workDaysByDate[shiftDate] = {
                    shifts: [],
                    totalDistance: 0
                };
            }
            
            workDaysByDate[shiftDate].shifts.push({
                shiftId: shift.id,
                startTime: this.formatToIST(shift.clock_in_time),
                endTime: this.formatToIST(shift.clock_out_time),
                distance: shift.total_distance || 0
            });
            
            workDaysByDate[shiftDate].totalDistance += shift.total_distance || 0;
        });

        // Generate HTML for fuel allowance details
        const sortedDates = Object.keys(workDaysByDate).sort();
        
        if (sortedDates.length === 0) {
            detailsDiv.innerHTML = '<p>No work days found for this period.</p>';
            return;
        }

        let detailsHTML = '<h5>Fuel Allowance Details:</h5>';
        let totalFuelAllowance = 0;

        detailsHTML += `
            <table class="data-table" style="margin-top: 10px; font-size: 0.9em;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Shifts</th>
                        <th>Total Distance</th>
                        <th>Fuel Allowance</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedDates.map(date => {
                        const dayData = workDaysByDate[date];
                        const dailyFuelAllowance = FUEL_ALLOWANCE_PER_DAY;
                        totalFuelAllowance += dailyFuelAllowance;
                        
                        const shiftsDetail = dayData.shifts.map(shift => 
                            `#${shift.shiftId} (${shift.startTime} - ${shift.endTime}): ${shift.distance}km`
                        ).join('<br>');
                        
                        return `
                            <tr>
                                <td>${date}</td>
                                <td>${dayData.shifts.length}</td>
                                <td>${dayData.totalDistance} km</td>
                                <td>₹${dailyFuelAllowance.toLocaleString()}</td>
                                <td><small>${shiftsDetail}</small></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td><strong>Total Work Days</strong></td>
                        <td><strong>${sortedDates.length}</strong></td>
                        <td><strong>${Object.values(workDaysByDate).reduce((sum, day) => sum + day.totalDistance, 0)} km</strong></td>
                        <td><strong>₹${Math.round(totalFuelAllowance).toLocaleString()}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        `;

        detailsHTML += `
            <div style="margin-top: 10px; padding: 8px; background: #e3f2fd; border-radius: 4px; font-size: 0.9em;">
                <strong>Note:</strong> Fuel allowance is ₹${FUEL_ALLOWANCE_PER_DAY} per working day, regardless of distance or number of shifts per day.
            </div>
        `;

        detailsDiv.innerHTML = detailsHTML;
    }

    displayAdminOvertimeDetails(payroll, index) {
        const detailsDiv = document.getElementById(`admin-overtime-details-${index}`);
        
        if (!payroll.shiftsDetails || payroll.shiftsDetails.length === 0) {
            detailsDiv.innerHTML = '<p>No overtime details available.</p>';
            return;
        }

        // Group shifts by date and calculate overtime for each
        const overtimeByDate = {};
        const OVERTIME_RATE = 100; // ₹100 per hour

        payroll.shiftsDetails.forEach(shift => {
            const shiftDate = shift.clock_in_time.split(' ')[0]; // Get date part
            const clockInTime = new Date(shift.clock_in_time);
            const clockOutTime = new Date(shift.clock_out_time);
            
            if (!clockOutTime || !shift.shift_duration_minutes) return;

            const shiftDuration = shift.shift_duration_minutes;
            let overtimeMinutes = 0;
            let overtimeReason = [];

            // Check if it's Sunday (overtime)
            const dayOfWeek = clockInTime.getDay();
            if (dayOfWeek === 0) {
                overtimeMinutes += shiftDuration;
                overtimeReason.push('Sunday work');
            } else {
                // Check for early morning overtime (before 8 AM)
                const startHour = clockInTime.getHours();
                if (startHour < 8) {
                    const earlyMinutes = (8 - startHour) * 60 - clockInTime.getMinutes();
                    const earlyOT = Math.min(earlyMinutes, shiftDuration);
                    if (earlyOT > 0) {
                        overtimeMinutes += earlyOT;
                        overtimeReason.push(`Early start (before 8 AM): ${Math.round(earlyOT / 60 * 10) / 10}h`);
                    }
                }

                // Check for late evening overtime (after 8 PM)
                const endHour = clockOutTime.getHours();
                if (endHour >= 20 || (endHour === 19 && clockOutTime.getMinutes() > 0)) {
                    const lateStart = new Date(clockOutTime);
                    lateStart.setHours(20, 0, 0, 0);
                    if (clockOutTime > lateStart) {
                        const lateMinutes = (clockOutTime - lateStart) / (1000 * 60);
                        overtimeMinutes += lateMinutes;
                        overtimeReason.push(`Late work (after 8 PM): ${Math.round(lateMinutes / 60 * 10) / 10}h`);
                    }
                }
            }

            if (overtimeMinutes > 0) {
                if (!overtimeByDate[shiftDate]) {
                    overtimeByDate[shiftDate] = {
                        totalOvertimeMinutes: 0,
                        shifts: []
                    };
                }
                
                const overtimeHours = overtimeMinutes / 60;
                const overtimePay = overtimeHours * OVERTIME_RATE;
                
                overtimeByDate[shiftDate].totalOvertimeMinutes += overtimeMinutes;
                overtimeByDate[shiftDate].shifts.push({
                    shiftId: shift.id,
                    startTime: this.formatToIST(shift.clock_in_time),
                    endTime: this.formatToIST(shift.clock_out_time),
                    overtimeMinutes: Math.round(overtimeMinutes),
                    overtimeHours: Math.round(overtimeHours * 100) / 100,
                    overtimePay: Math.round(overtimePay * 100) / 100,
                    reason: overtimeReason.join(', ')
                });
            }
        });

        // Generate HTML for overtime details
        const sortedDates = Object.keys(overtimeByDate).sort();
        
        if (sortedDates.length === 0) {
            detailsDiv.innerHTML = '<p>No overtime work found for this period.</p>';
            return;
        }

        let detailsHTML = '<h5>Overtime Work Details:</h5>';
        let totalOvertimePay = 0;
        let allShifts = [];

        // Collect all shifts from all dates
        sortedDates.forEach(date => {
            const dayData = overtimeByDate[date];
            dayData.shifts.forEach(shift => {
                allShifts.push({
                    date: date,
                    ...shift
                });
            });
        });

        // Calculate total overtime pay
        allShifts.forEach(shift => {
            totalOvertimePay += shift.overtimePay;
        });

        detailsHTML += `
            <table class="data-table" style="margin-top: 10px; font-size: 0.9em;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Shift #</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>OT Hours</th>
                        <th>OT Pay</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    ${allShifts.map(shift => `
                        <tr>
                            <td>${shift.date}</td>
                            <td>#${shift.shiftId}</td>
                            <td>${shift.startTime}</td>
                            <td>${shift.endTime}</td>
                            <td>${shift.overtimeHours}h</td>
                            <td>₹${shift.overtimePay.toLocaleString()}</td>
                            <td>${shift.reason}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td colspan="4"><strong>Total Overtime</strong></td>
                        <td><strong>${Math.round(allShifts.reduce((sum, shift) => sum + shift.overtimeHours, 0) * 100) / 100}h</strong></td>
                        <td><strong>₹${Math.round(totalOvertimePay).toLocaleString()}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        `;

        detailsDiv.innerHTML = detailsHTML;
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
                            <button id="generate-monthly-report-btn" class="action-btn">
                                ${this.translator.t('generate')}
                            </button>
                        </div>
                    </div>

                    <div class="report-card">
                        <h4>${this.translator.t('driverReport')}</h4>
                        <p>${this.translator.t('driverReportDesc')}</p>
                        <button id="generate-driver-report-btn" class="action-btn">
                            ${this.translator.t('generate')}
                        </button>
                    </div>
                </div>

                <div id="report-results" class="report-results">
                    <!-- Generated reports will appear here -->
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('generate-monthly-report-btn')?.addEventListener('click', () => this.generateMonthlyReport());
        document.getElementById('generate-driver-report-btn')?.addEventListener('click', () => this.generateDriverReport());
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

    async updateDriverStatus(driverId, driverName, isActive) {
        const action = isActive ? 'activate' : 'deactivate';
        const confirmation = confirm(`Are you sure you want to ${action} driver "${driverName}"?`);
        
        if (!confirmation) return;

        try {
            const response = await fetch(`/api/admin/driver/${driverId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ is_active: isActive })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.loadDriversData(); // Refresh the drivers list
            } else {
                this.showMessage(data.error || `Failed to ${action} driver`, 'error');
            }
        } catch (error) {
            this.showMessage(`Error ${action}ing driver`, 'error');
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

    updateConfigPreview() {
        const salary = document.getElementById('config-monthly-salary')?.value || '27000';
        const overtime = document.getElementById('config-overtime-rate')?.value || '100';
        const fuel = document.getElementById('config-fuel-allowance')?.value || '33.30';

        document.getElementById('preview-salary').textContent = salary;
        document.getElementById('preview-overtime').textContent = overtime;
        document.getElementById('preview-fuel').textContent = fuel;
    }

    async handlePayrollConfig(e) {
        e.preventDefault();

        const configData = {
            monthlySalary: parseFloat(document.getElementById('config-monthly-salary').value),
            overtimeRate: parseFloat(document.getElementById('config-overtime-rate').value),
            fuelAllowance: parseFloat(document.getElementById('config-fuel-allowance').value),
            workingHours: parseFloat(document.getElementById('config-working-hours').value),
            notes: `Configuration updated from admin panel`
        };

        try {
            const response = await fetch('/api/admin/payroll-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(configData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.showMessage('Payroll configuration saved successfully', 'success');
                this.updateConfigPreview();
                // Also save to localStorage as backup
                localStorage.setItem('payrollConfig', JSON.stringify(configData));
            } else {
                this.showMessage(data.error || 'Failed to save payroll configuration', 'error');
            }
        } catch (error) {
            this.showMessage('Error saving payroll configuration', 'error');
            console.error('Error saving config:', error);
        }
    }

    async handleGenerateTestData(e) {
        e.preventDefault();

        // Get configuration from form or local storage
        let payrollConfig;
        try {
            payrollConfig = JSON.parse(localStorage.getItem('payrollConfig')) || {};
        } catch (e) {
            payrollConfig = {};
        }

        const formData = {
            driverId: document.getElementById('test-driver-select').value,
            startMonth: document.getElementById('test-start-month').value,
            endMonth: document.getElementById('test-end-month').value,
            monthlySalary: payrollConfig.monthlySalary || parseFloat(document.getElementById('config-monthly-salary')?.value || '27000'),
            overtimeRate: payrollConfig.overtimeRate || parseFloat(document.getElementById('config-overtime-rate')?.value || '100'),
            fuelAllowance: payrollConfig.fuelAllowance || parseFloat(document.getElementById('config-fuel-allowance')?.value || '33.30')
        };

        if (!formData.driverId) {
            this.showMessage('Please select a driver', 'error');
            return;
        }

        try {
            const response = await fetch('/api/admin/generate-test-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.showMessage(`Successfully generated ${data.shiftsCreated} test shifts`, 'success');
                // Reset form
                document.getElementById('generate-test-data-form').reset();
                const currentMonth = new Date().toISOString().slice(0, 7);
                document.getElementById('test-start-month').value = currentMonth;
                document.getElementById('test-end-month').value = currentMonth;
            } else {
                this.showMessage(data.error || 'Failed to generate test data', 'error');
            }
        } catch (error) {
            this.showMessage('Error generating test data', 'error');
        }
    }

    async confirmAction(action) {
        if (action === 'backup') {
            this.showMessage('Backup functionality will be available in a future update', 'info');
        } else if (action === 'clear') {
            if (confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
                try {
                    const response = await fetch('/api/admin/clear-test-data', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        this.showMessage(`Successfully cleared ${data.shiftsDeleted} test shifts`, 'success');
                    } else {
                        this.showMessage(data.error || 'Failed to clear test data', 'error');
                    }
                } catch (error) {
                    this.showMessage('Error clearing test data', 'error');
                }
            }
        }
    }

    async loadSettings() {
        const content = document.getElementById('admin-content');

        // Load drivers for dropdown
        let driversOptions = '<option value="">Select Driver</option>';
        try {
            const response = await fetch('/api/admin/drivers', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (data.drivers) {
                driversOptions = '<option value="">Select Driver</option>' + 
                    data.drivers.map(driver => 
                        `<option value="${driver.id}">${driver.name} (${driver.phone})</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Failed to load drivers:', error);
        }

        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('settings')}</h3>
                </div>

                <div class="settings-grid">
                    <div class="setting-card">
                        <h4>Payroll Configuration</h4>
                        <p>Configure default payroll settings for the system.</p>
                        <form id="payroll-config-form" class="config-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="config-monthly-salary">Default Monthly Salary (₹):</label>
                                    <input type="number" id="config-monthly-salary" value="27000" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label for="config-overtime-rate">Overtime Rate (₹/hour):</label>
                                    <input type="number" id="config-overtime-rate" value="100" min="0" step="0.01" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="config-fuel-allowance">Daily Fuel Allowance (₹):</label>
                                    <input type="number" id="config-fuel-allowance" value="33.30" min="0" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label for="config-working-hours">Regular Working Hours/Day:</label>
                                    <input type="number" id="config-working-hours" value="8" min="1" max="24" required>
                                </div>
                            </div>
                            <button type="submit" class="action-btn">Save Configuration</button>
                        </form>
                    </div>

                    <div class="setting-card">
                        <h4>Generate Test Data</h4>
                        <p>Generate test shift data for selected driver and time period using current configuration.</p>
                        <form id="generate-test-data-form" class="test-data-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="test-driver-select">Driver:</label>
                                    <select id="test-driver-select" required>
                                        ${driversOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="test-start-month">Start Month:</label>
                                    <input type="month" id="test-start-month" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="test-end-month">End Month:</label>
                                    <input type="month" id="test-end-month" required>
                                </div>
                            </div>
                            <div class="config-preview">
                                <p><small><strong>Using Configuration:</strong></p>
                                <p>Monthly Salary: ₹<span id="preview-salary">27000</span> | 
                                   Overtime Rate: ₹<span id="preview-overtime">100</span>/hr | 
                                   Fuel Allowance: ₹<span id="preview-fuel">33.30</span>/day</small></p>
                            </div>
                            <button type="submit" class="action-btn">Generate Test Data</button>
                        </form>
                    </div>

                    <div class="setting-card">
                        <h4>${this.translator.t('dataManagement')}</h4>
                        <p>${this.translator.t('dataManagementDesc')}</p>
                        <div class="setting-actions">
                            <button id="backup-data-btn" class="action-btn">
                                ${this.translator.t('backupData')}
                            </button>
                            <button id="clear-data-btn" class="action-btn danger">
                                ${this.translator.t('clearTestData')}
                            </button>
                        </div>
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

                    <div class="setting-card full-width">
                        <h4>Configuration History</h4>
                        <p>View historical changes to payroll configuration settings.</p>
                        <div class="section-controls">
                            <button type="button" id="load-config-history-btn" class="action-btn secondary">
                                Load Configuration History
                            </button>
                        </div>
                        <div id="config-history-display" class="data-display">
                            <div class="loading">Click "Load Configuration History" to view changes</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('payroll-config-form')?.addEventListener('submit', (e) => this.handlePayrollConfig(e));
        document.getElementById('generate-test-data-form')?.addEventListener('submit', (e) => this.handleGenerateTestData(e));
        document.getElementById('backup-data-btn')?.addEventListener('click', () => this.confirmAction('backup'));
        document.getElementById('clear-data-btn')?.addEventListener('click', () => this.confirmAction('clear'));
        document.getElementById('load-config-history-btn')?.addEventListener('click', () => this.loadConfigHistory());

        // Update config preview when values change
        ['config-monthly-salary', 'config-overtime-rate', 'config-fuel-allowance', 'config-working-hours'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.updateConfigPreview());
        });

        // Load current configuration from server
        this.loadCurrentConfig();

        // Set default months
        const currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('test-start-month').value = currentMonth;
        document.getElementById('test-end-month').value = currentMonth;

        // Initialize config preview
        this.updateConfigPreview();
    }

     async loadConfigHistory() {
        const configHistoryDisplay = document.getElementById('config-history-display');
        configHistoryDisplay.innerHTML = `<div class="loading">${this.translator.t('loading')}...</div>`;

        try {
            const response = await fetch('/api/admin/config-history', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayConfigHistory(data.history);
            } else {
                configHistoryDisplay.innerHTML = `<div class="error">Failed to load configuration history</div>`;
            }
        } catch (error) {
            configHistoryDisplay.innerHTML = `<div class="error">Connection error</div>`;
        }
    }

    displayConfigHistory(history) {
        const configHistoryDisplay = document.getElementById('config-history-display');

        if (history.length === 0) {
            configHistoryDisplay.innerHTML = `<div class="no-data">No configuration history available</div>`;
            return;
        }

        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Monthly Salary</th>
                        <th>Overtime Rate</th>
                        <th>Fuel Allowance</th>
                        <th>Working Hours</th>
                        <th>Changed By</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(item => `
                        <tr>
                            <td>${this.formatToIST(item.changed_at)}</td>
                            <td>₹${item.monthly_salary.toLocaleString()}</td>
                            <td>₹${item.overtime_rate.toLocaleString()}</td>
                            <td>₹${item.fuel_allowance.toLocaleString()}</td>
                            <td>${item.working_hours}h</td>
                            <td>${item.changed_by || 'System'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        configHistoryDisplay.innerHTML = tableHtml;
    }

    async loadLeaveManagement() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>${this.translator.t('leaveRequests')}</h3>
                    <div class="filter-controls">
                        <select id="leave-status-filter">
                            <option value="">${this.translator.t('view')} ${this.translator.t('leaveRequests')}</option>
                            <option value="pending">${this.translator.t('status')}: Pending</option>
                            <option value="approved">${this.translator.t('status')}: Approved</option>
                            <option value="rejected">${this.translator.t('status')}: Rejected</option>
                        </select>
                        <button id="refresh-leave-btn" class="action-btn secondary">
                            ${this.translator.t('refresh')}
                        </button>
                    </div>
                </div>

                <div id="leave-requests-list" class="data-table-container">
                    <div class="loading">${this.translator.t('loading')}...</div>
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('leave-status-filter')?.addEventListener('change', () => this.loadLeaveRequestsData());
        document.getElementById('refresh-leave-btn')?.addEventListener('click', () => this.loadLeaveRequestsData());

        await this.loadLeaveRequestsData();
    }

    async loadLeaveRequestsData() {
        try {
            const status = document.getElementById('leave-status-filter')?.value || '';
            const response = await fetch(`/api/admin/leave-requests${status ? '?status=' + status : ''}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayLeaveRequestsTable(data.leaveRequests);
            } else {
                document.getElementById('leave-requests-list').innerHTML = 
                    `<div class="error">Failed to load leave requests</div>`;
            }
        } catch (error) {
            document.getElementById('leave-requests-list').innerHTML = 
                `<div class="error">Connection error</div>`;
        }
    }

    displayLeaveRequestsTable(leaveRequests) {
        if (leaveRequests.length === 0) {
            document.getElementById('leave-requests-list').innerHTML = 
                `<div class="no-data">No leave requests found</div>`;
            return;
        }

        const tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Driver</th>
                        <th>Leave Date</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Requested</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaveRequests.map(leave => `
                        <tr>
                            <td>#${leave.id}</td>
                            <td>${leave.driver_name}<br><small>${leave.driver_phone}</small></td>
                            <td>${leave.leave_date}</td>
                            <td>${leave.leave_type}</td>
                            <td><div class="reason-text">${leave.reason}</div></td>
                            <td><span class="status-badge ${leave.status}">${leave.status}</span></td>
                            <td>${this.formatToIST(leave.requested_at)}</td>
                            <td>
                                ${leave.status === 'pending' ? `
                                    <button class="btn-small approve-btn" data-leave-id="${leave.id}">
                                        Approve
                                    </button>
                                    <button class="btn-small reject-btn" data-leave-id="${leave.id}">
                                        Reject
                                    </button>
                                ` : `
                                    <small>Processed by ${leave.approved_by}<br>${this.formatToIST(leave.approved_at)}</small>
                                    ${leave.notes ? `<br><small>Notes: ${leave.notes}</small>` : ''}
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('leave-requests-list').innerHTML = tableHtml;

        // Set up approval/rejection event listeners
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const leaveId = e.target.getAttribute('data-leave-id');
                this.processLeaveRequest(leaveId, 'approved');
            });
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const leaveId = e.target.getAttribute('data-leave-id');
                this.processLeaveRequest(leaveId, 'rejected');
            });
        });
    }

    async processLeaveRequest(leaveId, status) {
        const notes = prompt(`${status === 'approved' ? 'Approve' : 'Reject'} leave request. Add notes (optional):`);
        
        // Allow empty notes, but cancel if user clicks Cancel
        if (notes === null) return;

        try {
            const response = await fetch(`/api/admin/leave-request/${leaveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ status, notes })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(`Leave request ${status} successfully`, 'success');
                this.loadLeaveRequestsData(); // Refresh the list
            } else {
                this.showMessage(data.error || `Failed to ${status} leave request`, 'error');
            }
        } catch (error) {
            this.showMessage('Error processing leave request', 'error');
        }
    }

    async loadCurrentConfig() {
        try {
            const response = await fetch('/api/admin/config', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('config-monthly-salary').value = data.monthlySalary;
                document.getElementById('config-overtime-rate').value = data.overtimeRate;
                document.getElementById('config-fuel-allowance').value = data.fuelAllowance;
                document.getElementById('config-working-hours').value = data.workingHours;
                this.updateConfigPreview();
            } else {
                this.showMessage('Failed to load current configuration', 'error');
            }
        } catch (error) {
            this.showMessage('Connection error', 'error');
        }
    }

    async loadShiftDataManagement() {
        const content = document.getElementById('admin-content');
        
        // Load drivers for dropdown
        let driversOptions = '<option value="">Select Driver</option>';
        try {
            const response = await fetch('/api/admin/drivers', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (data.drivers) {
                driversOptions = '<option value="">Select Driver</option>' + 
                    data.drivers.filter(driver => driver.is_active).map(driver => 
                        `<option value="${driver.id}">${driver.name} (${driver.phone})</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Failed to load drivers:', error);
        }

        content.innerHTML = `
            <div class="admin-section-content">
                <div class="section-header">
                    <h3>Shift Data Management</h3>
                    <p>Edit and manage shift entries for drivers. Use this to correct data or add entries when going live.</p>
                </div>

                <div class="shift-data-controls">
                    <div class="control-group">
                        <label for="shift-data-driver">Select Driver:</label>
                        <select id="shift-data-driver" required>
                            ${driversOptions}
                        </select>
                    </div>
                    <div class="control-group">
                        <label for="shift-data-month">Month:</label>
                        <input type="month" id="shift-data-month" required>
                    </div>
                    <div class="control-group">
                        <button id="load-shift-data-btn" class="action-btn">Load Shift Data</button>
                        <button id="save-all-shifts-btn" class="action-btn success" style="display: none;">Save All Changes</button>
                    </div>
                </div>

                <div id="shift-data-table-container" class="data-table-container">
                    <div class="info">Select a driver and month to load shift data for editing.</div>
                </div>
            </div>
        `;

        // Set up event listeners
        document.getElementById('load-shift-data-btn')?.addEventListener('click', () => this.loadShiftDataTable());
        document.getElementById('save-all-shifts-btn')?.addEventListener('click', () => this.saveAllShiftChanges());

        // Set default month to current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('shift-data-month').value = currentMonth;
    }

    async loadShiftDataTable() {
        const driverId = document.getElementById('shift-data-driver').value;
        const month = document.getElementById('shift-data-month').value;

        if (!driverId || !month) {
            this.showMessage('Please select both driver and month', 'error');
            return;
        }

        const [year, monthNum] = month.split('-');
        const tableContainer = document.getElementById('shift-data-table-container');
        tableContainer.innerHTML = `<div class="loading">Loading shift data...</div>`;

        try {
            const response = await fetch(`/api/admin/shifts/monthly/${driverId}/${year}/${monthNum}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayShiftDataTable(data.monthlyData, driverId, year, monthNum);
                document.getElementById('save-all-shifts-btn').style.display = 'inline-block';
            } else {
                tableContainer.innerHTML = `<div class="error">Failed to load shift data</div>`;
            }
        } catch (error) {
            tableContainer.innerHTML = `<div class="error">Connection error</div>`;
        }
    }

    displayShiftDataTable(monthlyData, driverId, year, month) {
        const tableContainer = document.getElementById('shift-data-table-container');
        
        const tableHtml = `
            <div class="shift-data-table-wrapper">
                <div class="table-info">
                    <p><strong>Driver:</strong> ${document.getElementById('shift-data-driver').selectedOptions[0].text}</p>
                    <p><strong>Month:</strong> ${this.getMonthName(parseInt(month))} ${year}</p>
                    <p><strong>Instructions:</strong> Fill in shift details. Leave blank if no shift occurred on that date.</p>
                </div>
                
                <table class="shift-data-table editable-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Start Odometer</th>
                            <th>End Odometer</th>
                            <th>Distance</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monthlyData.map((dayData, index) => {
                            const date = new Date(dayData.date);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            const distance = dayData.startOdometer && dayData.endOdometer ? 
                                dayData.endOdometer - dayData.startOdometer : '';
                            const duration = dayData.startTime && dayData.endTime ? 
                                this.calculateDuration(dayData.startTime, dayData.endTime) : '';
                            
                            return `
                                <tr class="shift-row ${isWeekend ? 'weekend' : ''} ${dayData.hasData ? 'has-data' : ''}" 
                                    data-date="${dayData.date}" 
                                    data-shift-id="${dayData.shiftId || 'new'}"
                                    data-driver-id="${driverId}">
                                    <td class="date-cell">${dayData.date}</td>
                                    <td class="day-cell ${isWeekend ? 'weekend-day' : ''}">${dayName}</td>
                                    <td>
                                        <input type="time" class="shift-input start-time" 
                                               value="${dayData.startTime}" 
                                               onchange="this.closest('tr').classList.add('modified')">
                                    </td>
                                    <td>
                                        <input type="time" class="shift-input end-time" 
                                               value="${dayData.endTime}"
                                               onchange="this.closest('tr').classList.add('modified')">
                                    </td>
                                    <td>
                                        <input type="number" class="shift-input start-odo" 
                                               value="${dayData.startOdometer || ''}" 
                                               min="0" step="1"
                                               onchange="this.closest('tr').classList.add('modified')">
                                    </td>
                                    <td>
                                        <input type="number" class="shift-input end-odo" 
                                               value="${dayData.endOdometer || ''}" 
                                               min="0" step="1"
                                               onchange="this.closest('tr').classList.add('modified')">
                                    </td>
                                    <td class="calculated-distance">${distance}</td>
                                    <td class="calculated-duration">${duration}</td>
                                    <td class="actions-cell">
                                        ${dayData.hasData ? `
                                            <button class="btn-small danger delete-shift-btn" 
                                                    data-shift-id="${dayData.shiftId}"
                                                    title="Delete this shift">
                                                🗑️
                                            </button>
                                        ` : ''}
                                        <span class="status-indicator" title="Unsaved changes">●</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        tableContainer.innerHTML = tableHtml;

        // Set up event listeners for real-time calculations
        this.setupShiftDataEventListeners();
    }

    setupShiftDataEventListeners() {
        // Add event listeners for automatic calculations
        document.querySelectorAll('.shift-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = e.target.closest('.shift-row');
                this.updateRowCalculations(row);
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-shift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shiftId = e.target.getAttribute('data-shift-id');
                this.deleteShiftRow(shiftId);
            });
        });
    }

    updateRowCalculations(row) {
        const startTime = row.querySelector('.start-time').value;
        const endTime = row.querySelector('.end-time').value;
        const startOdo = parseFloat(row.querySelector('.start-odo').value) || 0;
        const endOdo = parseFloat(row.querySelector('.end-odo').value) || 0;

        // Update distance
        const distanceCell = row.querySelector('.calculated-distance');
        if (startOdo && endOdo && endOdo > startOdo) {
            distanceCell.textContent = `${endOdo - startOdo} km`;
        } else {
            distanceCell.textContent = '';
        }

        // Update duration
        const durationCell = row.querySelector('.calculated-duration');
        if (startTime && endTime) {
            const duration = this.calculateDuration(startTime, endTime);
            durationCell.textContent = duration;
        } else {
            durationCell.textContent = '';
        }

        // Show status indicator
        row.classList.add('modified');
        const statusIndicator = row.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.style.display = 'inline';
        }
    }

    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return '';
        
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        if (end <= start) return '';
        
        const diffMs = end - start;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    async saveAllShiftChanges() {
        const modifiedRows = document.querySelectorAll('.shift-row.modified');
        
        if (modifiedRows.length === 0) {
            this.showMessage('No changes to save', 'info');
            return;
        }

        const saveBtn = document.getElementById('save-all-shifts-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        let savedCount = 0;
        let errorCount = 0;

        for (const row of modifiedRows) {
            try {
                await this.saveShiftRow(row);
                savedCount++;
                row.classList.remove('modified');
                row.querySelector('.status-indicator').style.display = 'none';
            } catch (error) {
                errorCount++;
                console.error('Error saving row:', error);
            }
        }

        saveBtn.textContent = originalText;
        saveBtn.disabled = false;

        if (errorCount === 0) {
            this.showMessage(`Successfully saved ${savedCount} shift entries`, 'success');
        } else {
            this.showMessage(`Saved ${savedCount} entries, ${errorCount} failed`, 'warning');
        }
    }

    async saveShiftRow(row) {
        const shiftId = row.getAttribute('data-shift-id');
        const driverId = row.getAttribute('data-driver-id');
        const date = row.getAttribute('data-date');
        
        const startTime = row.querySelector('.start-time').value;
        const endTime = row.querySelector('.end-time').value;
        const startOdometer = parseFloat(row.querySelector('.start-odo').value) || null;
        const endOdometer = parseFloat(row.querySelector('.end-odo').value) || null;

        // Skip if no meaningful data is entered
        if (!startTime && !startOdometer) {
            return;
        }

        const shiftData = {
            driverId,
            date,
            startTime,
            endTime,
            startOdometer,
            endOdometer
        };

        const response = await fetch(`/api/admin/shifts/${shiftId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(shiftData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save shift');
        }

        const result = await response.json();
        
        // Update the row's shift ID if it was a new entry
        if (shiftId === 'new' && result.shiftId) {
            row.setAttribute('data-shift-id', result.shiftId);
            row.classList.add('has-data');
            
            // Add delete button if it doesn't exist
            const actionsCell = row.querySelector('.actions-cell');
            if (!actionsCell.querySelector('.delete-shift-btn')) {
                actionsCell.innerHTML = `
                    <button class="btn-small danger delete-shift-btn" 
                            data-shift-id="${result.shiftId}"
                            title="Delete this shift">
                        🗑️
                    </button>
                    <span class="status-indicator" title="Unsaved changes">●</span>
                `;
                
                // Re-setup event listener for the new delete button
                const deleteBtn = actionsCell.querySelector('.delete-shift-btn');
                deleteBtn.addEventListener('click', (e) => {
                    const shiftId = e.target.getAttribute('data-shift-id');
                    this.deleteShiftRow(shiftId);
                });
            }
        }
    }

    async deleteShiftRow(shiftId) {
        if (!confirm('Are you sure you want to delete this shift entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/shifts/${shiftId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                // Clear the row data but keep the row for editing
                const row = document.querySelector(`[data-shift-id="${shiftId}"]`);
                if (row) {
                    row.querySelector('.start-time').value = '';
                    row.querySelector('.end-time').value = '';
                    row.querySelector('.start-odo').value = '';
                    row.querySelector('.end-odo').value = '';
                    row.querySelector('.calculated-distance').textContent = '';
                    row.querySelector('.calculated-duration').textContent = '';
                    row.classList.remove('has-data', 'modified');
                    row.setAttribute('data-shift-id', 'new');
                    
                    // Remove delete button
                    const deleteBtn = row.querySelector('.delete-shift-btn');
                    if (deleteBtn) {
                        deleteBtn.remove();
                    }
                }
                
                this.showMessage('Shift deleted successfully', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to delete shift', 'error');
            }
        } catch (error) {
            this.showMessage('Error deleting shift', 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DriverApp();
});