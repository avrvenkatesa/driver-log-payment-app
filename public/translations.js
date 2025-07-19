// Translation system for Driver Log App
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.translations = {
            en: {
                // Authentication
                appTitle: "Driver Log & Payment App",
                driverDashboard: "Driver Dashboard",
                adminPanel: "Admin Panel",
                driverLogin: "Driver Login",
                driverRegistration: "Driver Registration",
                fullName: "Full Name",
                userId: "User ID",
                email: "Email",
                password: "Password",
                login: "Login",
                register: "Register",
                logout: "Logout",
                optional: "Optional",
                fieldsMarkedRequired: "* Fields marked with asterisk are required",
                dontHaveAccount: "Don't have an account?",
                registerHere: "Register here",
                alreadyHaveAccount: "Already have an account?",
                loginHere: "Login here",

                // Dashboard
                welcome: "Welcome",
                shiftStatus: "Shift Status",
                quickActions: "Quick Actions",
                checking: "Checking...",
                currentlyOnShift: "Currently on shift",
                started: "Started",
                startOdometer: "Start Odometer",
                notOnShift: "Not on shift",
                readyForNewShift: "Ready for new shift",

                // Actions
                startShift: "Start Shift",
                endShift: "End Shift",
                clockIn: "Clock In",
                clockOut: "Clock Out",
                cancel: "Cancel",
                viewTodaysShifts: "View Today's Shifts",
                viewMonthlyShifts: "View Monthly Shifts",
                viewPayroll: "View Payroll",

                // Forms
                startNewShift: "Start New Shift",
                endCurrentShift: "End Current Shift",
                startingOdometerReading: "Starting Odometer Reading (km)",
                endingOdometerReading: "Ending Odometer Reading (km)",

                // Messages
                loginSuccessful: "Login successful!",
                loginFailed: "Login failed. Please try again.",
                registrationSuccessful: "Registration successful! Please login.",
                registrationFailed: "Registration failed. Please try again.",
                clockedInSuccessfully: "Clocked in successfully!",
                clockedOutSuccessfully: "Clocked out successfully!",
                failedToClockIn: "Failed to clock in",
                failedToClockOut: "Failed to clock out",
                failedToLoadShiftStatus: "Failed to load shift status",
                failedToLoadShifts: "Failed to load shifts",
                failedToLoadMonthlyShifts: "Failed to load monthly shifts",
                failedToLoadPayroll: "Failed to load payroll",

                // Shifts
                todaysShifts: "Today's Shifts",
                monthlyShifts: "Monthly Shifts",
                shift: "Shift",
                start: "Start",
                end: "End",
                endOdometer: "End Odometer",
                distance: "Distance",
                duration: "Duration",
                km: "km",
                currentlyActive: "Currently Active",
                noShiftsToday: "No shifts today",
                noShiftsThisMonth: "No shifts this month",

                // Monthly summary
                monthSummary: "Month Summary",
                totalShifts: "Total Shifts",
                totalDistance: "Total Distance",
                totalDuration: "Total Duration",

                // Payroll
                payrollSummary: "Payroll Summary",
                workSummary: "Work Summary",
                daysWorked: "Days Worked",
                regularHours: "Regular Hours",
                overtimeHours: "Overtime Hours",
                paymentBreakdown: "Payment Breakdown",
                baseSalary: "Base Salary",
                overtimePay: "Overtime Pay",
                fuelAllowance: "Fuel Allowance",
                grossPay: "Gross Pay",
                overtimeNote: "Overtime calculated for hours worked beyond 8 hours per day",
                fuelAllowanceNote: "Fuel allowance calculated at ₹0.79 per km driven",
                noPayrollData: "No payroll data available for this month",

                // Error messages
                namePhoneRequired: "Name and phone are required",
                phoneEmailPasswordRequired: "Phone/Email and password are required",
                validStartOdometerRequired: "Valid start odometer reading is required",
                validEndOdometerRequired: "Valid end odometer reading is required",
                alreadyActiveShift: "You already have an active shift",
                noActiveShift: "No active shift found",
                endOdometerLessThanStart: "End odometer cannot be less than start odometer",
                startOdometerMustBeGreater: "Start odometer ({startOdometer} km) must be greater than or equal to your last shift's end odometer ({endOdometer} km)",
                startOdometerMustBeGreaterOrEqual: "Start odometer must be greater than or equal to previous end odometer",

                // Admin Panel
                drivers: "Drivers",
                shifts: "Shifts",
                reports: "Reports",
                settings: "Settings",
                driversManagement: "Drivers Management",
                shiftsAnalytics: "Shifts Analytics",
                refresh: "Refresh",
                failedToLoadDrivers: "Failed to load drivers",
                connectionError: "Connection error",
                id: "ID",
                name: "Name",
                phone: "Phone",
                verified: "Verified",
                unverified: "Unverified",
                active: "Active",
                inactive: "Inactive",
                joinDate: "Join Date",
                actions: "Actions",
                view: "View",
                driver: "Driver",
                completed: "Completed",
                today: "Today",
                thisWeek: "This Week",
                thisMonth: "This Month",
                allTime: "All Time",
                totalHours: "Total Hours",
                activeDrivers: "Active Drivers",
                shiftId: "Shift ID",
                status: "Status",

                // Reports
                monthlyReport: "Monthly Report",
                monthlyReportDesc: "Generate detailed monthly activity report",
                driverReport: "Driver Report", 
                driverReportDesc: "Generate individual driver performance report",
                generate: "Generate",
                failedToGenerateReport: "Failed to generate report",

                // Settings
                systemSettings: "System Settings",
                applicationSettings: "Application Settings",
                defaultLanguage: "Default Language",
                timezone: "Timezone",
                dataManagement: "Data Management",
                backupData: "Backup Data",
                clearTestData: "Clear Test Data",
                systemInfo: "System Info",
                version: "Version",
                database: "Database",
                uptime: "Uptime",

                // Payroll admin
                loadPayroll: "Load Payroll",
                selectMonthToLoadPayroll: "Select month and year to load payroll data",
                noPayrollDataForPeriod: "No payroll data available for selected period",
                payrollOverview: "Payroll Overview",
                totalDrivers: "Total Drivers",
                totalPayroll: "Total Payroll",
                days: "Days",
                loading: "Loading"
            },
            ta: {
                // Authentication  
                appTitle: "ஓட்டுநர் பதிவு & சம்பள செயலி",
                driverDashboard: "ஓட்டுநர் டாஷ்போர்டு",
                adminPanel: "நிர்வாக பேனல்",
                driverLogin: "ஓட்டுநர் உள்நுழைவு",
                driverRegistration: "ஓட்டுநர் பதிவு",
                fullName: "முழு பெயர்",
                userId: "பயனர் ஐடி",
                email: "மின்னஞ்சல்",
                password: "கடவுச்சொல்",
                login: "உள்நுழைவு",
                register: "பதிவு",
                logout: "வெளியேறு",
                optional: "விருப்பமானது",
                fieldsMarkedRequired: "* குறியிடப்பட்ட புலங்கள் தேவையானவை",
                dontHaveAccount: "கணக்கு இல்லையா?",
                registerHere: "இங்கே பதிவு செய்யவும்",
                alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
                loginHere: "இங்கே உள்நுழையவும்",

                // Dashboard
                welcome: "வரவேற்கிறோம்",
                shiftStatus: "ஷிப்ட் நிலை",
                quickActions: "விரைவு செயல்கள்",
                checking: "சோதிக்கிறது...",
                currentlyOnShift: "தற்போது ஷிப்ட்டில்",
                started: "தொடங்கியது",
                startOdometer: "தொடக்க ஓடோமீட்டர்",
                notOnShift: "ஷிப்ட்டில் இல்லை",
                readyForNewShift: "புதிய ஷிப்ட்டுக்கு தயார்",

                // Actions
                startShift: "ஷிப்ட் தொடங்கு",
                endShift: "ஷிப்ட் முடி",
                clockIn: "கிளாக் இன்",
                clockOut: "கிளாக் அவுட்",
                cancel: "ரத்து செய்",
                viewTodaysShifts: "இன்றைய ஷிப்ட்கள்",
                viewMonthlyShifts: "மாதாந்தர ஷிப்ட்கள்",
                viewPayroll: "சம்பள விவரம்",

                // Forms
                startNewShift: "புதிய ஷிப்ட் தொடங்கு",
                endCurrentShift: "தற்போதைய ஷிப்ட் முடி",
                startingOdometerReading: "தொடக்க ஓடோமீட்டர் அளவீடு (கிமீ)",
                endingOdometerReading: "முடிவு ஓடோமீட்டர் அளவீடு (கிமீ)",

                // Messages  
                loginSuccessful: "வெற்றிகரமாக உள்நுழைந்தீர்கள்!",
                loginFailed: "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சி செய்யவும்.",
                registrationSuccessful: "பதிவு வெற்றிகரமாக முடிந்தது! தயவுசெய்து உள்நுழையவும்.",
                registrationFailed: "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சி செய்யவும்.",
                clockedInSuccessfully: "வெற்றிகரமாக கிளாக் இன் செய்யப்பட்டது!",
                clockedOutSuccessfully: "வெற்றிகரமாக கிளாக் அவுட் செய்யப்பட்டது!",
                failedToClockIn: "கிளாக் இன் செய்ய முடியவில்லை",
                failedToClockOut: "கிளாக் அவுட் செய்ய முடியவில்லை",
                failedToLoadShiftStatus: "ஷிப்ட் நிலையை ஏற்ற முடியவில்லை",
                failedToLoadShifts: "ஷிப்ட்களை ஏற்ற முடியவில்லை",
                failedToLoadMonthlyShifts: "மாதாந்தர ஷிப்ட்களை ஏற்ற முடியவில்லை",
                failedToLoadPayroll: "சம்பள விவரங்களை ஏற்ற முடியவில்லை",

                // Shifts
                todaysShifts: "இன்றைய ஷிப்ட்கள்",
                monthlyShifts: "மாதாந்தர ஷிப்ட்கள்", 
                shift: "ஷிப்ட்",
                start: "தொடக்கம்",
                end: "முடிவு",
                endOdometer: "முடிவு ஓடோமீட்டர்",
                distance: "தூரம்",
                duration: "கால அளவு",
                km: "கிமீ",
                currentlyActive: "தற்போது செயல்பாட்டில்",
                noShiftsToday: "இன்று ஷிப்ட்கள் இல்லை",
                noShiftsThisMonth: "இந்த மாதம் ஷிப்ட்கள் இல்லை",

                // Monthly summary
                monthSummary: "மாத சுருக்கம்",
                totalShifts: "மொத்த ஷிப்ட்கள்",
                totalDistance: "மொத்த தூரம்", 
                totalDuration: "மொத்த கால அளவு",

                // Payroll
                payrollSummary: "சம்பள சுருக்கம்",
                workSummary: "வேலை சுருக்கம்",
                daysWorked: "வேலை செய்த நாட்கள்",
                regularHours: "வழக்கமான மணிநேரம்",
                overtimeHours: "கூடுதல் நேர மணிநேரம்", 
                paymentBreakdown: "சம்பள பிரிவு",
                baseSalary: "அடிப்படை சம்பளம்",
                overtimePay: "கூடுதல் நேர சம்பளம்",
                fuelAllowance: "எரிபொருள் அனுமதி",
                grossPay: "மொத்த சம்பளம்",
                overtimeNote: "நாளொன்றுக்கு 8 மணிநேரத்துக்கு மேல் வேலை செய்தால் கூடுதல் நேர சம்பளம்",
                fuelAllowanceNote: "ஓட்டிய கிலோமீட்டருக்கு ₹0.79 என்ற விகிதத்தில் எரிபொருள் அனுமதி",
                noPayrollData: "இந்த மாதத்திற்கு சம்பள தரவு இல்லை",

                // Error messages
                namePhoneRequired: "பெயர் மற்றும் தொலைபேசி எண் தேவை",
                phoneEmailPasswordRequired: "தொலைபேசி/மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை",
                validStartOdometerRequired: "சரியான தொடக்க ஓடோமீட்டர் அளவீடு தேவை",
                validEndOdometerRequired: "சரியான முடிவு ஓடோமீட்டர் அளவீடு தேவை",
                alreadyActiveShift: "ஏற்கனவே ஒரு செயலில் உள்ள ஷிப்ட் உள்ளது",
                noActiveShift: "செயலில் உள்ள ஷிப்ட் இல்லை",
                endOdometerLessThanStart: "முடிவு ஓடோமீட்டர் தொடக்கத்தை விட குறைவாக இருக்க முடியாது",
                startOdometerMustBeGreater: "தொடக்க ஓடோமீட்டர் ({startOdometer} கிமீ) உங்கள் கடைசி ஷிப்ட்டின் முடிவு ஓடோமீட்டரை ({endOdometer} கிமீ) விட அதிகமாக அல்லது சமமாக இருக்க வேண்டும்",
                startOdometerMustBeGreaterOrEqual: "தொடக்க ஓடோமீட்டர் முந்தைய முடிவு ஓடோமீட்டரை விட அதிகமாக அல்லது சமமாக இருக்க வேண்டும்",

                // Admin Panel
                drivers: "ஓட்டுநர்கள்",
                shifts: "ஷிப்ட்கள்",
                reports: "அறிக்கைகள்",
                settings: "அமைப்புகள்",
                driversManagement: "ஓட்டுநர்கள் மேலாண்மை",
                shiftsAnalytics: "ஷிப்ட் பகுப்பாய்வு",
                refresh: "புதுப்பிக்க",
                failedToLoadDrivers: "ஓட்டுநர்களை ஏற்ற முடியவில்லை",
                connectionError: "இணைப்பு பிழை",
                id: "ஐடி",
                name: "பெயர்",
                phone: "தொலைபேசி",
                verified: "சரிபார்க்கப்பட்டது",
                unverified: "சரிபார்க்கப்படவில்லை",
                active: "செயலில்",
                inactive: "செயலில் இல்லை",
                joinDate: "சேர்ந்த தேதி",
                actions: "செயல்கள்",
                view: "பார்க்க",
                driver: "ஓட்டுநர்",
                completed: "முடிந்தது",
                today: "இன்று",
                thisWeek: "இந்த வாரம்",
                thisMonth: "இந்த மாதம்", 
                allTime: "எல்லா நேரமும்",
                totalHours: "மொத்த மணிநேரம்",
                activeDrivers: "செயலில் உள்ள ஓட்டுநர்கள்",
                shiftId: "ஷிஃப்ட் ஐடி",
                status: "நிலை",

                // Reports
                monthlyReport: "மாதாந்திர அறிக்கை",
                monthlyReportDesc: "விரிவான மாதாந்திர செயல்பாட்டு அறிக்கையை உருவாக்கவும்",
                driverReport: "ஓட்டுநர் அறிக்கை",
                driverReportDesc: "தனிநபர் ஓட்டுநர் செயல்திறன் அறிக்கையை உருவாக்கவும்",
                generate: "உருவாக்கு",
                failedToGenerateReport: "அறிக்கையை உருவாக்க முடியவில்லை",

                // Settings
                systemSettings: "கணினி அமைப்புகள்",
                applicationSettings: "பயன்பாட்டு அமைப்புகள்",
                defaultLanguage: "இயல்புநிலை மொழி",
                timezone: "நேர மண்டலம்",
                dataManagement: "தரவு மேலாண்மை",
                backupData: "தரவு காப்புப்பிரதி",
                clearTestData: "சோதனை தரவை அழிக்கவும்",
                systemInfo: "கணினி தகவல்",
                version: "பதிப்பு",
                database: "தரவுத்தளம்",
                uptime: "இயக்க நேரம்",

                // Payroll admin
                loadPayroll: "சம்பள விவரம் ஏற்று",
                selectMonthToLoadPayroll: "சம்பள தரவு ஏற்ற மாதம் மற்றும் ஆண்டு தேர்ந்தெடுக்கவும்",
                noPayrollDataForPeriod: "தேர்ந்தெடுக்கப்பட்ட காலத்திற்கு சம்பள தரவு இல்லை",
                payrollOverview: "சம்பள மேற்பார்வை",
                totalDrivers: "மொத்த ஓட்டுநர்கள்",
                totalPayroll: "மொத்த சம்பளம்",
                days: "நாட்கள்",
                loading: "ஏற்றுகிறது"
            }
        };
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('selectedLanguage', lang);
    }

    t(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        if (translation) {
            return translation;
        }

        // Fallback to English if translation not found
        return this.translations.en[key] || key;
    }
}

// Export for use in other files
window.TranslationManager = TranslationManager;