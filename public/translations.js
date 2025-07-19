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

                // Quick Actions
                quickActions: "Quick Actions",
                startShift: "Start Shift",
                endShift: "End Shift",
                viewTodaysShifts: "View Today's Shifts",

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
                shift: "Shift",
                start: "Start",
                end: "End",
                distance: "Distance",
                duration: "Duration",
                minutes: "minutes",
                km: "km",
                currentlyActive: "Currently Active",
                noShiftsToday: "No shifts recorded for today.",

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
                failedToResendCode: "Failed to resend code. Please try again."
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
                driverLogin: "ஓட்டுநர் உள்நுழைவு",
                driverRegistration: "ஓட்டுநர் பதிவு",
                phone: "தொலைபேசி எண்",
                email: "மின்னஞ்சல்",
                phoneOrEmail: "தொலைபேசி எண் அல்லது மின்னஞ்சல்",
                password: "கடவுச்சொல்",
                fullName: "முழு பெயர்",
                login: "உள்நுழைவு",
                register: "பதிவு செய்க",
                logout: "வெளியேறு",
                dontHaveAccount: "கணக்கு இல்லையா?",
                registerHere: "இங்கே பதிவு செய்யுங்கள்",
                alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
                loginHere: "இங்கே உள்நுழையுங்கள்",

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

                // Quick Actions
                quickActions: "விரைவு செயல்கள்",
                startShift: "ஷிஃப்ட் தொடங்கு",
                endShift: "ஷிஃப்ட் முடிக்கவும்",
                viewTodaysShifts: "இன்றைய ஷிஃப்ட்களைப் பார்க்கவும்",

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
                shift: "ஷிஃப்ட்",
                start: "தொடக்கம்",
                end: "முடிவு",
                distance: "தூரம்",
                duration: "கால அளவு",
                minutes: "நிமிடங்கள்",
                km: "கி.மீ",
                currentlyActive: "தற்போது செயலில்",
                noShiftsToday: "இன்றைக்கு ஷிஃப்ட்கள் பதிவு செய்யப்படவில்லை.",

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
                failedToResendCode: "குறியீட்டை மீண்டும் அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
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