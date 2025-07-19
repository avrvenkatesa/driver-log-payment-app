
// Translation system for Driver Log App
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        this.translations = {
            en: {
                // Authentication
                driverLogin: 'Driver Login',
                driverRegistration: 'Driver Registration',
                userId: 'User ID',
                password: 'Password',
                fullName: 'Full Name',
                email: 'Email',
                optional: 'optional',
                login: 'Login',
                register: 'Register',
                loginHere: 'login here',
                registerHere: 'register here',
                dontHaveAccount: "Don't have an account?",
                alreadyHaveAccount: 'Already have an account?',
                fieldsMarkedRequired: 'Fields marked with * are required',
                loginSuccessful: 'Login successful!',
                registrationSuccessful: 'Registration successful! You can now login.',
                loginFailed: 'Login failed. Please try again.',
                registrationFailed: 'Registration failed. Please try again.',

                // App Navigation
                appTitle: 'Driver Log & Payment App',
                driverDashboard: 'Driver Dashboard',
                adminPanel: 'Admin Panel',
                welcome: 'Welcome',
                logout: 'Logout',

                // Driver Dashboard
                shiftStatus: 'Shift Status',
                quickActions: 'Quick Actions',
                checking: 'Checking...',
                currentlyOnShift: 'Currently on shift',
                notOnShift: 'Not on shift',
                readyForNewShift: 'Ready for new shift',
                started: 'Started',
                startShift: 'Start Shift',
                endShift: 'End Shift',
                viewTodaysShifts: "View Today's Shifts",
                viewMonthlyShifts: 'View Monthly Shifts',
                viewPayroll: 'View Payroll',

                // Shift Management
                startNewShift: 'Start New Shift',
                endCurrentShift: 'End Current Shift',
                startingOdometerReading: 'Starting Odometer Reading',
                endingOdometerReading: 'Ending Odometer Reading',
                clockIn: 'Clock In',
                clockOut: 'Clock Out',
                cancel: 'Cancel',
                clockedInSuccessfully: 'Clocked in successfully!',
                clockedOutSuccessfully: 'Clocked out successfully!',
                failedToClockIn: 'Failed to clock in',
                failedToClockOut: 'Failed to clock out',
                failedToLoadShiftStatus: 'Failed to load shift status',

                // Shift Display
                shift: 'Shift',
                start: 'Start',
                end: 'End',
                startOdometer: 'Start Odometer',
                endOdometer: 'End Odometer',
                distance: 'Distance',
                duration: 'Duration',
                currentlyActive: 'Currently Active',
                todaysShifts: "Today's Shifts",
                monthlyShifts: 'Monthly Shifts',
                noShiftsToday: 'No shifts today',
                noShiftsThisMonth: 'No shifts this month',
                failedToLoadShifts: 'Failed to load shifts',
                failedToLoadMonthlyShifts: 'Failed to load monthly shifts',

                // Units
                km: 'km',

                // Monthly Summary
                monthSummary: 'Month Summary',
                totalShifts: 'Total Shifts',
                totalDistance: 'Total Distance',
                totalDuration: 'Total Duration',

                // Payroll
                payrollSummary: 'Payroll Summary',
                workSummary: 'Work Summary',
                daysWorked: 'Days Worked',
                regularHours: 'Regular Hours',
                overtimeHours: 'Overtime Hours',
                paymentBreakdown: 'Payment Breakdown',
                baseSalary: 'Base Salary',
                overtimePay: 'Overtime Pay',
                fuelAllowance: 'Fuel Allowance',
                grossPay: 'Gross Pay',
                overtimeNote: 'Overtime calculated for hours worked beyond 8 hours per day',
                fuelAllowanceNote: 'Fuel allowance calculated based on distance traveled',
                noPayrollData: 'No payroll data available for this period',
                failedToLoadPayroll: 'Failed to load payroll data',

                // Admin Panel
                drivers: 'Drivers',
                shifts: 'Shifts',
                reports: 'Reports',
                settings: 'Settings',
                driversManagement: 'Drivers Management',
                shiftsAnalytics: 'Shifts Analytics',
                refresh: 'Refresh',
                loading: 'Loading',
                failedToLoadDrivers: 'Failed to load drivers',
                connectionError: 'Connection error',

                // Table Headers
                id: 'ID',
                name: 'Name',
                phone: 'Phone',
                verified: 'Verified',
                status: 'Status',
                joinDate: 'Join Date',
                actions: 'Actions',
                view: 'View',
                active: 'Active',
                inactive: 'Inactive',
                unverified: 'Unverified',

                // Analytics
                today: 'Today',
                thisWeek: 'This Week',
                thisMonth: 'This Month',
                allTime: 'All Time',
                totalHours: 'Total Hours',
                activeDrivers: 'Active Drivers',
                shiftId: 'Shift ID',
                driver: 'Driver',
                completed: 'Completed',
                failedToLoadShifts: 'Failed to load shifts',

                // Payroll Admin
                loadPayroll: 'Load Payroll',
                selectMonthToLoadPayroll: 'Select month and year to load payroll',
                payrollOverview: 'Payroll Overview',
                totalDrivers: 'Total Drivers',
                totalPayroll: 'Total Payroll',
                days: 'Days',
                noPayrollDataForPeriod: 'No payroll data available for this period',

                // Reports
                monthlyReport: 'Monthly Report',
                monthlyReportDesc: 'Generate comprehensive monthly activity report',
                driverReport: 'Driver Report',
                driverReportDesc: 'Generate individual driver performance reports',
                generate: 'Generate',
                failedToGenerateReport: 'Failed to generate report',
                avgShiftLength: 'Average Shift Length',
                date: 'Date',
                hours: 'Hours',

                // Settings
                dataManagement: 'Data Management',
                dataManagementDesc: 'Backup and manage application data',
                backupData: 'Backup Data',
                clearTestData: 'Clear Test Data',
                systemInfo: 'System Information',
                version: 'Version',
                database: 'Database',
                uptime: 'Uptime',

                // Error Messages
                phoneEmailPasswordRequired: 'User ID and password are required',
                namePhoneRequired: 'Name and User ID are required',
                validStartOdometerRequired: 'Valid starting odometer reading is required',
                validEndOdometerRequired: 'Valid ending odometer reading is required',
                alreadyActiveShift: 'You already have an active shift. Please end it first.',
                noActiveShift: 'No active shift found',
                endOdometerLessThanStart: 'End odometer reading cannot be less than start reading',
                startOdometerMustBeGreaterOrEqual: 'Start odometer ({startOdometer}) must be greater than or equal to previous end odometer ({endOdometer})',
                invalidCredentials: 'Invalid credentials',
                userNotFound: 'User not found',
                phoneAlreadyRegistered: 'Phone number already registered',
                emailAlreadyRegistered: 'Email already registered'
            },
            ta: {
                // Authentication
                driverLogin: 'ஓட்டுநர் உள்நுழைவு',
                driverRegistration: 'ஓட்டுநர் பதிவு',
                userId: 'பயனர் அடையாளம்',
                password: 'கடவுச்சொல்',
                fullName: 'முழு பெயர்',
                email: 'மின்னஞ்சல்',
                optional: 'விருப்பமானது',
                login: 'உள்நுழைய',
                register: 'பதிவு செய்க',
                loginHere: 'இங்கே உள்நுழையவும்',
                registerHere: 'இங்கே பதிவு செய்யவும்',
                dontHaveAccount: 'கணக்கு இல்லையா?',
                alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
                fieldsMarkedRequired: '* குறியிடப்பட்ட புலங்கள் தேவை',
                loginSuccessful: 'உள்நுழைவு வெற்றிகரமாக!',
                registrationSuccessful: 'பதிவு வெற்றிகரமாக! இப்போது நீங்கள் உள்நுழையலாம்.',
                loginFailed: 'உள்நுழைவு தோல்வியுற்றது. மீண்டும் முயற்சிக்கவும்.',
                registrationFailed: 'பதிவு தோல்வியுற்றது. மீண்டும் முயற்சிக்கவும்.',

                // App Navigation
                appTitle: 'ஓட்டுநர் பதிவு மற்றும் கொடுப்பனவு பயன்பாடு',
                driverDashboard: 'ஓட்டுநர் டாஷ்போர்டு',
                adminPanel: 'நிர்வாக குழு',
                welcome: 'வரவேற்பு',
                logout: 'வெளியேறு',

                // Driver Dashboard
                shiftStatus: 'ஷிப்ட் நிலை',
                quickActions: 'விரைவு செயல்கள்',
                checking: 'சரிபார்க்கிறது...',
                currentlyOnShift: 'தற்போது ஷிப்டில்',
                notOnShift: 'ஷிப்டில் இல்லை',
                readyForNewShift: 'புதிய ஷிப்டுக்கு தயார்',
                started: 'தொடங்கியது',
                startShift: 'ஷிப்ட் தொடங்கு',
                endShift: 'ஷிப்ட் முடிக்க',
                viewTodaysShifts: 'இன்றைய ஷிப்ட்களைப் பார்க்க',
                viewMonthlyShifts: 'மாதாந்திர ஷிப்ட்களைப் பார்க்க',
                viewPayroll: 'சம்பள விவரங்களைப் பார்க்க',

                // Shift Management
                startNewShift: 'புதிய ஷிப்ட் தொடங்கு',
                endCurrentShift: 'தற்போதைய ஷிப்ட் முடிக்க',
                startingOdometerReading: 'தொடக்க ஓடோமீட்டர் அளவீடு',
                endingOdometerReading: 'இறுதி ஓடோமீட்டர் அளவீடு',
                clockIn: 'நேரம் பதிவு செய்',
                clockOut: 'நேரம் வெளியேற்று',
                cancel: 'ரத்து',
                clockedInSuccessfully: 'வெற்றிகரமாக நேரம் பதிவானது!',
                clockedOutSuccessfully: 'வெற்றிகரமாக நேரம் வெளியேற்றப்பட்டது!',
                failedToClockIn: 'நேரம் பதிவு செய்ய முடியவில்லை',
                failedToClockOut: 'நேரம் வெளியேற்ற முடியவில்லை',
                failedToLoadShiftStatus: 'ஷிப்ட் நிலையை ஏற்ற முடியவில்லை',

                // Shift Display
                shift: 'ஷிப்ட்',
                start: 'தொடக்கம்',
                end: 'முடிவு',
                startOdometer: 'தொடக்க ஓடோமீட்டர்',
                endOdometer: 'இறுதி ஓடோமீட்டர்',
                distance: 'தூரம்',
                duration: 'கால அளவு',
                currentlyActive: 'தற்போது செயலில்',
                todaysShifts: 'இன்றைய ஷிப்ட்கள்',
                monthlyShifts: 'மாதாந்திர ஷிப்ட்கள்',
                noShiftsToday: 'இன்று ஷிப்ட்கள் இல்லை',
                noShiftsThisMonth: 'இந்த மாதம் ஷிப்ட்கள் இல்லை',
                failedToLoadShifts: 'ஷிப்ட்களை ஏற்ற முடியவில்லை',
                failedToLoadMonthlyShifts: 'மாதாந்திர ஷிப்ட்களை ஏற்ற முடியவில்லை',

                // Units
                km: 'கி.மீ',

                // Monthly Summary
                monthSummary: 'மாத சுருக்கம்',
                totalShifts: 'மொத்த ஷிப்ட்கள்',
                totalDistance: 'மொத்த தூரம்',
                totalDuration: 'மொத்த கால அளவு',

                // Payroll
                payrollSummary: 'சம்பள சுருக்கம்',
                workSummary: 'வேலை சுருக்கம்',
                daysWorked: 'வேலை செய்த நாட்கள்',
                regularHours: 'வழக்கமான மணி நேரம்',
                overtimeHours: 'கூடுதல் நேர மணி நேரம்',
                paymentBreakdown: 'கொடுப்பனவு விவரம்',
                baseSalary: 'அடிப்படை சம்பளம்',
                overtimePay: 'கூடுதல் நேர சம்பளம்',
                fuelAllowance: 'எரிபொருள் ஊதியம்',
                grossPay: 'மொத்த சம்பளம்',
                overtimeNote: 'நாளொன்றுக்கு 8 மணி நேரத்திற்கும் மேலாக வேலை செய்தால் கூடுதல் நேரம் கணக்கிடப்படுகிறது',
                fuelAllowanceNote: 'பயணம் செய்த தூரத்தின் அடிப்படையில் எரிபொருள் ஊதியம் கணக்கிடப்படுகிறது',
                noPayrollData: 'இந்த காலகட்டத்திற்கு சம்பள தரவு கிடைக்கவில்லை',
                failedToLoadPayroll: 'சம்பள தரவை ஏற்ற முடியவில்லை',

                // Admin Panel
                drivers: 'ஓட்டுநர்கள்',
                shifts: 'ஷிப்ட்கள்',
                reports: 'அறிக்கைகள்',
                settings: 'அமைப்புகள்',
                driversManagement: 'ஓட்டுநர்கள் மேலாண்மை',
                shiftsAnalytics: 'ஷிப்ட் பகுப்பாய்வு',
                refresh: 'புதுப்பிக்க',
                loading: 'ஏற்றுகிறது',
                failedToLoadDrivers: 'ஓட்டுநர்களை ஏற்ற முடியவில்லை',
                connectionError: 'இணைப்பு பிழை',

                // Table Headers
                id: 'அடையாளம்',
                name: 'பெயர்',
                phone: 'தொலைபேசி',
                verified: 'சரிபார்க்கப்பட்டது',
                status: 'நிலை',
                joinDate: 'சேர்ந்த தேதி',
                actions: 'செயல்கள்',
                view: 'பார்க்க',
                active: 'செயலில்',
                inactive: 'செயலில் இல்லை',
                unverified: 'சரிபார்க்கப்படவில்லை',

                // Analytics
                today: 'இன்று',
                thisWeek: 'இந்த வாரம்',
                thisMonth: 'இந்த மாதம்',
                allTime: 'எல்லா நேரமும்',
                totalHours: 'மொத்த மணி நேரம்',
                activeDrivers: 'செயலில் உள்ள ஓட்டுநர்கள்',
                shiftId: 'ஷிப்ட் அடையாளம்',
                driver: 'ஓட்டுநர்',
                completed: 'முடிந்தது',
                failedToLoadShifts: 'ஷிப்ட்களை ஏற்ற முடியவில்லை',

                // Payroll Admin
                loadPayroll: 'சம்பளம் ஏற்று',
                selectMonthToLoadPayroll: 'சம்பளம் ஏற்ற மாதம் மற்றும் ஆண்டு தேர்ந்தெடுக்கவும்',
                payrollOverview: 'சம்பள கண்ணோட்டம்',
                totalDrivers: 'மொத்த ஓட்டுநர்கள்',
                totalPayroll: 'மொத்த சம்பளம்',
                days: 'நாட்கள்',
                noPayrollDataForPeriod: 'இந்த காலகட்டத்திற்கு சம்பள தரவு கிடைக்கவில்லை',

                // Reports
                monthlyReport: 'மாதாந்திர அறிக்கை',
                monthlyReportDesc: 'விரிவான மாதாந்திர செயல்பாட்டு அறிக்கையை உருவாக்கவும்',
                driverReport: 'ஓட்டுநர் அறிக்கை',
                driverReportDesc: 'தனிப்பட்ட ஓட்டுநர் செயல்திறன் அறிக்கைகளை உருவாக்கவும்',
                generate: 'உருவாக்கு',
                failedToGenerateReport: 'அறிக்கையை உருவாக்க முடியவில்லை',
                avgShiftLength: 'சராசரி ஷிப்ட் நீளம்',
                date: 'தேதி',
                hours: 'மணி நேரம்',

                // Settings
                dataManagement: 'தரவு மேலாண்மை',
                dataManagementDesc: 'பயன்பாட்டு தரவை காப்புப்பிரதி எடுத்து நிர்வகிக்கவும்',
                backupData: 'தரவை காப்புப்பிரதி',
                clearTestData: 'சோதனை தரவை அழி',
                systemInfo: 'கணினி தகவல்',
                version: 'பதிப்பு',
                database: 'தரவுத்தளம்',
                uptime: 'இயக்க நேரம்',

                // Error Messages
                phoneEmailPasswordRequired: 'பயனர் அடையாளம் மற்றும் கடவுச்சொல் தேவை',
                namePhoneRequired: 'பெயர் மற்றும் பயனர் அடையாளம் தேவை',
                validStartOdometerRequired: 'சரியான தொடக்க ஓடோமீட்டர் அளவீடு தேவை',
                validEndOdometerRequired: 'சரியான இறுதி ஓடோமீட்டர் அளவீடு தேவை',
                alreadyActiveShift: 'உங்களுக்கு ஏற்கனவே ஒரு செயலில் உள்ள ஷிப்ட் உள்ளது. தயவுசெய்து முதலில் அதை முடிக்கவும்.',
                noActiveShift: 'செயலில் உள்ள ஷிப்ட் எதுவும் இல்லை',
                endOdometerLessThanStart: 'இறுதி ஓடோமீட்டர் அளவீடு தொடக்க அளவீட்டை விட குறைவாக இருக்க முடியாது',
                startOdometerMustBeGreaterOrEqual: 'தொடக்க ஓடோமீட்டர் ({startOdometer}) முந்தைய இறுதி ஓடோமீட்டர் ({endOdometer}) விட அதிகமாக அல்லது சமமாக இருக்க வேண்டும்',
                invalidCredentials: 'தவறான அறிமுக விவரங்கள்',
                userNotFound: 'பயனர் கிடைக்கவில்லை',
                phoneAlreadyRegistered: 'தொலைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது',
                emailAlreadyRegistered: 'மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது'
            }
        };
    }

    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('preferredLanguage', language);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    t(key) {
        const translation = this.translations[this.currentLanguage];
        return translation && translation[key] ? translation[key] : key;
    }
}
// Translation Manager for multi-language support
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.translations = {
            en: {
                // App basics
                appTitle: 'Driver Log & Payment App',
                driverDashboard: 'Driver Dashboard',
                adminPanel: 'Admin Panel',
                
                // Authentication
                driverLogin: 'Driver Login',
                driverRegistration: 'Driver Registration',
                userId: 'User ID / Phone',
                password: 'Password',
                fullName: 'Full Name',
                email: 'Email',
                login: 'Login',
                register: 'Register',
                logout: 'Logout',
                optional: 'optional',
                dontHaveAccount: "Don't have an account?",
                registerHere: 'Register here',
                alreadyHaveAccount: 'Already have an account?',
                loginHere: 'Login here',
                fieldsMarkedRequired: 'Fields marked with * are required',
                
                // Dashboard
                welcome: 'Welcome',
                shiftStatus: 'Shift Status',
                quickActions: 'Quick Actions',
                currentlyOnShift: 'Currently on shift',
                notOnShift: 'Not on shift',
                readyForNewShift: 'Ready for a new shift',
                checking: 'Checking...',
                
                // Shift actions
                startShift: 'Start Shift',
                endShift: 'End Shift',
                viewTodaysShifts: "View Today's Shifts",
                viewMonthlyShifts: 'View Monthly Shifts',
                viewPayroll: 'View Payroll',
                startNewShift: 'Start New Shift',
                endCurrentShift: 'End Current Shift',
                clockIn: 'Clock In',
                clockOut: 'Clock Out',
                cancel: 'Cancel',
                
                // Shift details
                shift: 'Shift',
                start: 'Start',
                end: 'End',
                started: 'Started',
                startOdometer: 'Start Odometer',
                endOdometer: 'End Odometer',
                startingOdometerReading: 'Starting Odometer Reading',
                endingOdometerReading: 'Ending Odometer Reading',
                distance: 'Distance',
                duration: 'Duration',
                km: 'km',
                currentlyActive: 'Currently Active',
                
                // Time periods
                todaysShifts: "Today's Shifts",
                monthlyShifts: 'Monthly Shifts',
                noShiftsToday: 'No shifts recorded today',
                noShiftsThisMonth: 'No shifts recorded this month',
                
                // Payroll
                payrollSummary: 'Payroll Summary',
                workSummary: 'Work Summary',
                paymentBreakdown: 'Payment Breakdown',
                totalShifts: 'Total Shifts',
                daysWorked: 'Days Worked',
                totalDistance: 'Total Distance',
                regularHours: 'Regular Hours',
                overtimeHours: 'Overtime Hours',
                baseSalary: 'Base Salary',
                overtimePay: 'Overtime Pay',
                fuelAllowance: 'Fuel Allowance',
                grossPay: 'Gross Pay',
                noPayrollData: 'No payroll data available for this period',
                overtimeNote: 'Overtime calculated for hours beyond 8 per day',
                fuelAllowanceNote: 'Fuel allowance calculated per working day',
                
                // Admin
                drivers: 'Drivers',
                shifts: 'Shifts',
                reports: 'Reports',
                settings: 'Settings',
                driversManagement: 'Drivers Management',
                shiftsAnalytics: 'Shifts Analytics',
                
                // Data table headers
                id: 'ID',
                name: 'Name',
                phone: 'Phone',
                verified: 'Verified',
                status: 'Status',
                joinDate: 'Join Date',
                actions: 'Actions',
                view: 'View',
                shiftId: 'Shift ID',
                driver: 'Driver',
                
                // Status labels
                active: 'Active',
                inactive: 'Inactive',
                completed: 'Completed',
                unverified: 'Unverified',
                
                // Time filters
                today: 'Today',
                thisWeek: 'This Week',
                thisMonth: 'This Month',
                allTime: 'All Time',
                
                // Analytics
                totalHours: 'Total Hours',
                activeDrivers: 'Active Drivers',
                avgShiftLength: 'Avg Shift Length',
                
                // Reports
                monthlyReport: 'Monthly Report',
                driverReport: 'Driver Report',
                monthlyReportDesc: 'Generate comprehensive monthly statistics',
                driverReportDesc: 'Generate individual driver performance reports',
                generate: 'Generate',
                date: 'Date',
                hours: 'Hours',
                
                // Settings
                dataManagement: 'Data Management',
                dataManagementDesc: 'Manage application data and settings',
                backupData: 'Backup Data',
                clearTestData: 'Clear Test Data',
                systemInfo: 'System Information',
                version: 'Version',
                database: 'Database',
                uptime: 'Uptime',
                
                // Actions and buttons
                refresh: 'Refresh',
                loading: 'Loading',
                loadPayroll: 'Load Payroll',
                
                // Messages
                loginSuccessful: 'Login successful',
                registrationSuccessful: 'Registration successful',
                clockedInSuccessfully: 'Clocked in successfully',
                clockedOutSuccessfully: 'Clocked out successfully',
                
                // Errors
                loginFailed: 'Login failed',
                registrationFailed: 'Registration failed',
                failedToLoadShiftStatus: 'Failed to load shift status',
                failedToClockIn: 'Failed to clock in',
                failedToClockOut: 'Failed to clock out',
                failedToLoadShifts: 'Failed to load shifts',
                failedToLoadMonthlyShifts: 'Failed to load monthly shifts',
                failedToLoadPayroll: 'Failed to load payroll',
                failedToLoadDrivers: 'Failed to load drivers',
                connectionError: 'Connection error',
                selectMonthToLoadPayroll: 'Select a month to load payroll data',
                noPayrollDataForPeriod: 'No payroll data found for this period',
                failedToGenerateReport: 'Failed to generate report',
                
                // Month summary
                monthSummary: 'Month Summary',
                
                // Days/weeks
                days: 'Days'
            },
            ta: {
                // App basics
                appTitle: 'ஓட்டுநர் பதிவு & சம்பள செயலி',
                driverDashboard: 'ஓட்டுநர் டாஷ்போர்டு',
                adminPanel: 'நிர்வாக பேனல்',
                
                // Authentication
                driverLogin: 'ஓட்டுநர் உள்நுழைவு',
                driverRegistration: 'ஓட்டுநர் பதிவு',
                userId: 'பயனர் அடையாளம் / தொலைபேசி',
                password: 'கடவுச்சொல்',
                fullName: 'முழு பெயர்',
                email: 'மின்னஞ்சல்',
                login: 'உள்நுழை',
                register: 'பதிவு செய்',
                logout: 'வெளியேறு',
                optional: 'விருப்பமானது',
                dontHaveAccount: 'கணக்கு இல்லையா?',
                registerHere: 'இங்கே பதிவு செய்யுங்கள்',
                alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
                loginHere: 'இங்கே உள்நுழையுங்கள்',
                fieldsMarkedRequired: '* குறிக்கப்பட்ட புலங்கள் அவசியம்',
                
                // Dashboard
                welcome: 'வரவேற்கிறோம்',
                shiftStatus: 'ஷிப்ட் நிலை',
                quickActions: 'விரைவு செயல்கள்',
                currentlyOnShift: 'தற்போது ஷிப்ட்டில்',
                notOnShift: 'ஷிப்ட்டில் இல்லை',
                readyForNewShift: 'புதிய ஷிப்ட்டுக்கு தயார்',
                checking: 'சரிபார்க்கிறது...',
                
                // Shift actions
                startShift: 'ஷிப்ட் தொடங்கு',
                endShift: 'ஷிப்ட் முடி',
                viewTodaysShifts: 'இன்றைய ஷிப்ட்களை பார்',
                viewMonthlyShifts: 'மாதாந்திர ஷிப்ட்களை பார்',
                viewPayroll: 'சம்பளம் பார்',
                startNewShift: 'புதிய ஷிப்ட் தொடங்கு',
                endCurrentShift: 'தற்போதைய ஷிப்ட் முடி',
                clockIn: 'உள்வா',
                clockOut: 'வெளியேறு',
                cancel: 'ரத்து செய்',
                
                // Shift details
                shift: 'ஷிப்ட்',
                start: 'தொடக்கம்',
                end: 'முடிவு',
                started: 'தொடங்கியது',
                startOdometer: 'தொடக்க ஓடோமீட்டர்',
                endOdometer: 'இறுதி ஓடோமீட்டர்',
                startingOdometerReading: 'தொடக்க ஓடோமீட்டர் அளவீடு',
                endingOdometerReading: 'இறுதி ஓடோமீட்டர் அளவீடு',
                distance: 'தூரம்',
                duration: 'கால அளவு',
                km: 'கி.மீ',
                currentlyActive: 'தற்போது செயல்பாட்டில்',
                
                // Time periods
                todaysShifts: 'இன்றைய ஷிப்ட்கள்',
                monthlyShifts: 'மாதாந்திர ஷிப்ட்கள்',
                noShiftsToday: 'இன்று எந்த ஷிப்ட் பதிவும் இல்லை',
                noShiftsThisMonth: 'இந்த மாதத்தில் எந்த ஷிப்ட் பதிவும் இல்லை',
                
                // Payroll
                payrollSummary: 'சம்பள சுருக்கம்',
                workSummary: 'வேலை சுருக்கம்',
                paymentBreakdown: 'சம்பள விவரக்குறிப்பு',
                totalShifts: 'மொத்த ஷிப்ட்கள்',
                daysWorked: 'வேலை செய்த நாட்கள்',
                totalDistance: 'மொத்த தூரம்',
                regularHours: 'வழக்கமான மணிநேரங்கள்',
                overtimeHours: 'கூடுதல் நேர மணிகள்',
                baseSalary: 'அடிப்படை சம்பளம்',
                overtimePay: 'கூடுதல் நேர சம்பளம்',
                fuelAllowance: 'எரிபொருள் அலவன்ஸ்',
                grossPay: 'மொத்த சம்பளம்',
                noPayrollData: 'இந்த காலகட்டத்திற்கு சம்பள தரவு இல்லை',
                overtimeNote: 'நாளொன்றுக்கு 8 மணி நேரத்துக்கு மேல் கூடுதல் நேர கணக்கீடு',
                fuelAllowanceNote: 'வேலை செய்த நாட்களுக்கு எரிபொருள் அலவன்ஸ் கணக்கீடு',
                
                // Common terms
                totalHours: 'மொத்த மணிநேரங்கள்',
                loading: 'ஏற்றுகிறது',
                refresh: 'புதுப்பி',
                
                // Messages
                loginSuccessful: 'உள்நுழைவு வெற்றிகரமானது',
                registrationSuccessful: 'பதிவு வெற்றிகரமானது',
                clockedInSuccessfully: 'வெற்றிகரமாக உள்வந்தீர்கள்',
                clockedOutSuccessfully: 'வெற்றிகரமாக வெளியேறினீர்கள்',
                
                // Month summary
                monthSummary: 'மாத சுருக்கம்'
            }
        };
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('selectedLanguage', language);
    }

    t(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        return translation || this.translations['en'][key] || key;
    }
}
