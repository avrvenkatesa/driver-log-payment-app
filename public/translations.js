// Translation system for Driver Log App
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // Header
                appTitle: "Driver Log & Payment App",
                driverDashboard: "Driver Dashboard",
                adminPanel: "Admin Panel",

                // System Status
                systemStatus: "System Status",
                checking: "Checking...",
                serverHealthy: "🚗 Driver Log App Server is running!",
                serverError: "Server connection failed",

                // Authentication
                driverLogin: "Driver Login",
                driverRegistration: "Driver Registration",
                userId: "User ID",
                phone: "Phone Number",
                email: "Email",
                phoneOrEmail: "Phone Number or Email",
                password: "Password",
                fullName: "Full Name",
                login: "Login",
                register: "Register",
                logout: "Logout",
                dontHaveAccount: "Don't have an account?",
                registerHere: "Register here",
                alreadyHaveAccount: "Already have an account?",
                loginHere: "Login here",

                // Phone Verification
                phoneVerification: "Phone Verification",
                enterVerificationCode: "Please enter the verification code sent to your phone.",
                verificationCode: "Verification Code",
                verify: "Verify",
                resendCode: "Resend Code",

                // Dashboard
                welcome: "Welcome",
                shiftStatus: "Shift Status",
                currentlyOnShift: "🟢 Currently on shift",
                notOnShift: "⭕ Not on shift",
                readyForNewShift: "Ready to start a new shift",
                started: "Started",
                startOdometer: "Start Odometer",
                endOdometer: "End Odometer",

                // Payroll
                viewPayroll: "View Payroll",
                payrollSummary: "Payroll Summary",
                workSummary: "Work Summary",
                paymentBreakdown: "Payment Breakdown",
                daysWorked: "Days Worked",
                regularHours: "Regular Hours",
                overtimeHours: "Overtime Hours",
                baseSalary: "Base Salary",
                overtimePay: "Overtime Pay",
                fuelAllowance: "Fuel Allowance",
                grossPay: "Gross Pay",
                overtimeNote: "Overtime: Before 8 AM, after 8 PM, or Sundays at ₹100/hour",
                fuelAllowanceNote: "Fuel allowance: ₹33.30 per day worked",
                noPayrollData: "No payroll data available for this month",
                failedToLoadPayroll: "Failed to load payroll data",
                payrollOverview: "Payroll Overview",
                totalDrivers: "Total Drivers",
                totalPayroll: "Total Payroll",
                loadPayroll: "Load Payroll",
                selectMonthToLoadPayroll: "Select a month and year to load payroll data",
                noPayrollDataForPeriod: "No payroll data available for the selected period",
                days: "Days",

                // Quick Actions
                quickActions: "Quick Actions",
                startShift: "Start Shift",
                endShift: "End Shift",
                viewTodaysShifts: "View Today's Shifts",
                viewMonthlyShifts: "View Month to Date",

                // Forms
                startNewShift: "Start New Shift",
                endCurrentShift: "End Current Shift",
                startingOdometerReading: "Starting Odometer Reading (km):",
                endingOdometerReading: "Ending Odometer Reading (km):",
                clockIn: "Clock In",
                clockOut: "Clock Out",
                cancel: "Cancel",

                // Shifts Display
                todaysShifts: "Today's Shifts",
                monthlyShifts: "Month to Date Shifts",
                monthSummary: "Month Summary",
                totalShifts: "Total Shifts",
                totalDistance: "Total Distance",
                totalDuration: "Total Duration",
                shift: "Shift",
                start: "Start",
                end: "End",
                distance: "Distance",
                duration: "Duration",
                minutes: "minutes",
                km: "km",
                currentlyActive: "Currently Active",
                noShiftsToday: "No shifts recorded for today",
                noShiftsThisMonth: "No shifts recorded for this month",

                // Messages
                loginSuccessful: "Login successful!",
                registrationSuccessful: "Registration successful! Please login.",
                registrationWithVerification: "Registration successful! Please verify your phone.",
                phoneVerifiedSuccessfully: "Phone verified successfully! You can now login.",
                clockedInSuccessfully: "Clocked in successfully!",
                clockedOutSuccessfully: "Clocked out successfully!",
                verificationCodeSent: "New verification code sent!",

                // Field requirements
                optional: "Optional",
                fieldsMarkedRequired: "* Fields marked with asterisk are required",

                // Errors
                phoneEmailPasswordRequired: "Phone/Email and password required",
                namePhoneRequired: "Name and phone number required",
                phoneRequired: "Phone number required",
                phoneCodeRequired: "Phone number and verification code required",
                validStartOdometerRequired: "Valid starting odometer reading required",
                validEndOdometerRequired: "Valid ending odometer reading required",
                alreadyActiveShift: "You already have an active shift. Please clock out first.",
                noActiveShift: "No active shift found. Please clock in first.",
                endOdometerLessThanStart: "End odometer cannot be less than start odometer",
                loginFailed: "Login failed. Please try again.",
                registrationFailed: "Registration failed. Please try again.",
                verificationFailed: "Verification failed. Please try again.",
                failedToClockIn: "Failed to clock in",
                failedToClockOut: "Failed to clock out",
                failedToLoadShiftStatus: "Failed to load shift status",
                failedToLoadShifts: "Failed to load shifts",
                failedToLoadMonthlyShifts: "Failed to load monthly shifts",
                failedToResendCode: "Failed to resend code. Please try again.",
                startOdometerMustBeGreaterOrEqual: "Start odometer ({startOdometer}) must be greater than or equal to previous end odometer ({endOdometer})",

                // Monthly view
                monthToDate: "Month to Date",
                createTestData: "Create Test Data",
                testDataCreated: "Test data created successfully",

                // Admin Panel
                drivers: "Drivers",
                shifts: "Shifts",
                reports: "Reports",
                settings: "Settings",
                driversManagement: "Drivers Management",
                shiftsAnalytics: "Shifts Analytics",
                refresh: "Refresh",
                failedToLoadDrivers: "Failed to load drivers",
                failedToLoadShifts: "Failed to load shifts",
                connectionError: "Connection error",
                id: "ID",
                verified: "Verified",
                unverified: "Unverified",
                active: "Active",
                inactive: "Inactive",
                joinDate: "Join Date",
                actions: "Actions",
                view: "View",
                totalShifts: "Total Shifts",
                totalDistance: "Total Distance",
                totalHours: "Total Hours",
                activeDrivers: "Active Drivers",
                shiftId: "Shift ID",
                driver: "Driver",
                completed: "Completed",
                thisWeek: "This Week",
                thisMonth: "This Month",
                allTime: "All Time",
                monthlyReport: "Monthly Report",
                monthlyReportDesc: "Generate detailed monthly activity report",
                driverReport: "Driver Report",
                driverReportDesc: "Generate individual driver performance report",
                generate: "Generate",
                failedToGenerateReport: "Failed to generate report",
                avgShiftLength: "Average Shift Length",
                date: "Date",
                hours: "Hours",
                systemSettings: "System Settings",
                applicationSettings: "Application Settings",
                defaultLanguage: "Default Language",
                timezone: "Timezone",
                dataManagement: "Data Management",
                backupData: "Backup Data",
                clearTestData: "Clear Test Data",
                systemInfo: "System Information",
                version: "Version",
                database: "Database",
                uptime: "Uptime",
            },
            ta: {
                // Header
                appTitle: "ஓட்டுநர் பதிவு மற்றும் கட்டண செயலி",
                driverDashboard: "ஓட்டுநர் கட்டுப்பாட்டு பலகை",
                adminPanel: "நிர்வாக பலகை",

                // System Status
                systemStatus: "கணினி நிலை",
                checking: "சரிபார்க்கிறது...",
                serverHealthy: "🚗 ஓட்டுநர் பதிவு செயலி இயங்குகிறது!",
                serverError: "சர்வர் இணைப்பு தோல்வியடைந்தது",

                // Authentication
                driverLogin: "டிரைவர் உள்நுழைவு",
                driverRegistration: "டிரைவர் பதிவு",
                userId: "பயனர் ஐடி",
                phone: "தொலைபேசி எண்",
                email: "மின்னஞ்சல்",
                phoneOrEmail: "தொலைபேசி எண் அல்லது மின்னஞ்சல்",
                password: "கடவுச்சொல்",
                fullName: "முழு பெயர்",
                login: "உள்நுழைவு",
                register: "பதிவு செய்யவும்",
                logout: "வெளியேறு",
                dontHaveAccount: "கணக்கு இல்லையா?",
                registerHere: "இங்கே பதிவு செய்யவும்",
                alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
                loginHere: "இங்கே உள்நுழையவும்",

                // Phone Verification
                phoneVerification: "தொலைபேசி சரிபார்ப்பு",
                enterVerificationCode: "உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட சரிபார்ப்பு குறியீட்டை உள்ளிடவும்.",
                verificationCode: "சரிபார்ப்பு குறியீடு",
                verify: "சரிபார்க்கவும்",
                resendCode: "குறியீட்டை மீண்டும் அனுப்பவும்",

                // Dashboard
                welcome: "வரவேற்கிறோம்",
                shiftStatus: "ஷிஃப்ட் நிலை",
                currentlyOnShift: "🟢 தற்போது ஷிஃப்ட்டில்",
                notOnShift: "⭕ ஷிஃப்ட்டில் இல்லை",
                readyForNewShift: "புதிய ஷிஃப்ட் தொடங்க தயார்",
                started: "தொடங்கியது",
                startOdometer: "தொடக்க ஓடோமீட்டர்",
                endOdometer: "முடிவு ஓடோமீட்டர்",

                // Payroll
                viewPayroll: "சம்பளம் காண்க",
                payrollSummary: "சம்பள சுருக்கம்",
                workSummary: "வேலை சுருக்கம்",
                paymentBreakdown: "கட்டண விவரம்",
                daysWorked: "வேலை செய்த நாட்கள்",
                regularHours: "வழக்கமான மணிநேரங்கள்",
                overtimeHours: "கூடுதல் நேர மணிநேரங்கள்",
                baseSalary: "அடிப்படை சம்பளம்",
                overtimePay: "கூடுதல் நேர கூலி",
                fuelAllowance: "எரிபொருள் படி",
                grossPay: "மொத்த சம்பளம்",
                overtimeNote: "கூடுதல் நேரம்: காலை 8 மணிக்கு முன், இரவு 8 மணிக்கு பின், அல்லது ஞாயிற்றுக்கிழமை ₹100/மணிநேரம்",
                fuelAllowanceNote: "எரிபொருள் படி: வேலை செய்த ஒரு நாளுக்கு ₹33.30",
                noPayrollData: "இந்த மாதத்திற்கு சம்பள தரவு இல்லை",
                failedToLoadPayroll: "சம்பள தரவு ஏற்ற முடியவில்லை",
                payrollOverview: "சம்பள மேலோட்டம்",
                totalDrivers: "மொத்த ஓட்டுநர்கள்",
                totalPayroll: "மொத்த சம்பளம்",
                loadPayroll: "சம்பளம் ஏற்று",
                selectMonthToLoadPayroll: "சம்பள தரவு ஏற்ற மாதம் மற்றும் ஆண்டு தேர்ந்தெடுக்கவும்",
                noPayrollDataForPeriod: "தேர்ந்தெடுக்கப்பட்ட காலத்திற்கு சம்பள தரவு இல்லை",
                days: "நாட்கள்",

                // Quick Actions
                quickActions: "விரைவு செயல்கள்",
                startShift: "ஷிஃப்ட் தொடங்கு",
                endShift: "ஷிஃப்ட் முடிக்கவும்",
                viewTodaysShifts: "இன்றைய ஷிஃப்ட்களைப் பார்க்கவும்",
                viewMonthlyShifts: "மாத தேதி வரை காண்க",

                // Forms
                startNewShift: "புதிய ஷிஃப்ட் தொடங்கவும்",
                endCurrentShift: "தற்போதைய ஷிஃப்ட் முடிக்கவும்",
                startingOdometerReading: "தொடக்க ஓடோமீட்டர் அளவீடு (கி.மீ):",
                endingOdometerReading: "முடிவு ஓடோமீட்டர் அளவீடு (கி.மீ):",
                clockIn: "கடிகாரத்தில் உள்நுழைவு",
                clockOut: "கடிகாரத்தில் வெளியேற்றம்",
                cancel: "ரத்து செய்யவும்",

                // Shifts Display
                todaysShifts: "இன்றைய ஷிஃப்ட்கள்",
                monthlyShifts: "மாத தேதி வரை ஷிஃப்ட்கள்",
                monthSummary: "மாத சுருக்கம்",
                totalShifts: "மொத்த ஷிஃப்ட்கள்",
                totalDistance: "மொத்த தூரம்",
                totalDuration: "மொத்த கால அளவு",
                shift: "ஷிஃப்ட்",
                start: "தொடக்கம்",
                end: "முடிவு",
                distance: "தூரம்",
                duration: "கால அளவு",
                minutes: "நிமிடங்கள்",
                km: "கி.மீ",
                currentlyActive: "தற்போது செயலில்",
                noShiftsToday: "இன்றைக்கு எந்த ஷிஃப்ட்களும் பதிவு செய்யப்படவில்லை",
                noShiftsThisMonth: "இந்த மாதத்திற்கு எந்த ஷிஃப்ட்களும் பதிவு செய்யப்படவில்லை",

                // Field requirements
                optional: "விருப்பமான",
                fieldsMarkedRequired: "* நட்சத்திரம் குறிக்கப்பட்ட புலங்கள் தேவை",

                // Messages
                loginSuccessful: "உள்நுழைவு வெற்றிகரமாக!",
                registrationSuccessful: "பதிவு வெற்றிகரமாக! தயவுசெய்து உள்நுழையுங்கள்.",
                registrationWithVerification: "பதிவு வெற்றிகரமாக! உங்கள் தொலைபேசியை சரிபார்க்கவும்.",
                phoneVerifiedSuccessfully: "தொலைபேசி வெற்றிகரமாக சரிபார்க்கப்பட்டது! இப்போது நீங்கள் உள்நுழையலாம்.",
                clockedInSuccessfully: "வெற்றிகரமாக கடிகாரத்தில் நுழைந்தது!",
                clockedOutSuccessfully: "வெற்றிகரமாக கடிகாரத்தில் இருந்து வெளியேறியது!",
                verificationCodeSent: "புதிய சரிபார்ப்பு குறியீடு அனுப்பப்பட்டது!",

                // Errors
                phoneEmailPasswordRequired: "தொலைபேசி/மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை",
                namePhoneRequired: "பெயர் மற்றும் தொலைபேசி எண் தேவை",
                phoneRequired: "தொலைபேசி எண் தேவை",
                phoneCodeRequired: "தொலைபேசி எண் மற்றும் சரிபார்ப்பு குறியீடு தேவை",
                validStartOdometerRequired: "சரியான தொடக்க ஓடோமீட்டர் அளவீடு தேவை",
                validEndOdometerRequired: "சரியான முடிவு ஓடோமீட்டர் அளவீடு தேவை",
                alreadyActiveShift: "உங்களுக்கு ஏற்கனவே செயலில் உள்ள ஷிஃப்ட் உள்ளது. முதலில் கடிகாரத்தில் இருந்து வெளியேறுங்கள்.",
                noActiveShift: "செயலில் உள்ள ஷிஃப்ட் இல்லை. முதலில் கடிகாரத்தில் நுழையுங்கள்.",
                endOdometerLessThanStart: "முடிவு ஓடோமீட்டர் தொடக்க ஓடோமீட்டரை விட குறைவாக இருக்க முடியாது",
                loginFailed: "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
                registrationFailed: "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
                verificationFailed: "சரிபார்ப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
                failedToClockIn: "கடிகாரத்தில் நுழைய முடியவில்லை",
                failedToClockOut: "கடிகாரத்தில் இருந்து வெளியேற முடியவில்லை",
                failedToLoadShiftStatus: "ஷிஃப்ட் நிலையை ஏற்ற முடியவில்லை",
                failedToLoadShifts: "ஷிஃப்ட்களை ஏற்ற முடியவில்லை",
                failedToLoadMonthlyShifts: "மாதாந்திர ஷிஃப்ட்களை ஏற்ற முடியவில்லை",
                failedToResendCode: "குறியீட்டை மீண்டும் அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
                startOdometerMustBeGreaterOrEqual: "தொடக்க ஓடோமீட்டர் ({startOdometer}) முந்தைய முடிவு ஓடோமீட்டரை ({endOdometer}) விட அதிகமாக அல்லது சமமாக இருக்க வேண்டும்",

                // Monthly view
                monthToDate: "மாத தேதி வரை",
                createTestData: "சோதனை தரவு உருவாக்கு",
                testDataCreated: "சோதனை தரவு வெற்றிகரமாக உருவாக்கப்பட்டது",

                // Admin Panel
                drivers: "ஓட்டுநர்கள்",
                shifts: "ஷிஃப்ட்கள்",
                reports: "அறிக்கைகள்",
                settings: "அமைப்புகள்",
                driversManagement: "ஓட்டுநர்கள் மேலாண்மை",
                shiftsAnalytics: "ஷிஃப்ட் பகுப்பாய்வு",
                refresh: "புதுப்பிக்கவும்",
                failedToLoadDrivers: "ஓட்டுநர்களை ஏற்ற முடியவில்லை",
                failedToLoadShifts: "ஷிஃப்ட்களை ஏற்ற முடியவில்லை",
                connectionError: "இணைப்பு பிழை",
                id: "அடையாள எண்",
                verified: "சரிபார்க்கப்பட்டது",
                unverified: "சரிபார்க்கப்படவில்லை",
                active: "செயல்பாட்டில்",
                inactive: "செயலில் இல்லை",
                joinDate: "சேர்ந்த தேதி",
                actions: "செயல்கள்",
                view: "பார்க்க",
                totalShifts: "மொத்த ஷிஃப்ட்கள்",
                totalDistance: "மொத்த தூரம்",
                totalHours: "மொத்த மணிநேரங்கள்",
                activeDrivers: "செயலில் உள்ள ஓட்டுநர்கள்",
                shiftId: "ஷிஃப்ட் அடையாள எண்",
                driver: "ஓட்டுநர்",
                completed: "முடிக்கப்பட்டது",
                thisWeek: "இந்த வாரம்",
                thisMonth: "இந்த மாதம்",
                allTime: "எல்லா நேரமும்",
                monthlyReport: "மாதாந்திர அறிக்கை",
                monthlyReportDesc: "விரிவான மாதாந்திர செயல்பாட்டு அறிக்கையை உருவாக்கவும்",
                driverReport: "ஓட்டுநர் அறிக்கை",
                driverReportDesc: "தனிநபர் ஓட்டுநர் செயல்திறன் அறிக்கையை உருவாக்கவும்",
                generate: "உருவாக்கு",
                failedToGenerateReport: "அறிக்கையை உருவாக்க முடியவில்லை",
                avgShiftLength: "சராசரி ஷிஃப்ட் நீளம்",
                date: "தேதி",
                hours: "மணிநேரங்கள்",
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
            }
        };
    }

    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    }

    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'ta', name: 'தமிழ்' }
        ];
    }
}

// Export for use in other files
window.TranslationManager = TranslationManager;