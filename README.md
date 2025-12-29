# Notifiq - Centralized College Notification System

Notifiq is a modern, single-page React application designed to replace chaotic WhatsApp groups with a centralized, verified notice board for colleges. It features real-time alerts, role-based access control, and AI-powered notice rewriting.

## 🚀 Features

- **Role-Based Dashboards**: Distinct views for Viewers (Students), Admins (Faculty), and Super Admins.
- **Real-Time Updates**: Instant notice delivery using Firebase Firestore.
- **AI Integration**: Google Gemini integration to rewrite and polish messy notice drafts automatically.
- **Secure Authentication**: Firebase Auth for secure user management.
- **Email Integration**: Integrated Contact Us form using EmailJS.
- **Responsive Design**: Mobile-first UI using modern CSS and Glassmorphism.

## 🛠️ Tech Stack

- **Frontend**: React 18+ (Vite)
- **Styling**: Vanilla CSS (CSS Variables, Dark Mode support)
- **Backend / Database**: Firebase (Authentication, Firestore, Storage)
- **AI**: Google Gemini API
- **Icons**: Phosphor React
- **Deployment**: Netlify

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/notifiq.git
    cd notifiq
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add the following keys:

    ```env
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id

    # Cloudinary (For Image Uploads)
    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
    VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

    # Google Gemini AI
    VITE_GEMINI_API_KEY=your_gemini_key

    # EmailJS (Contact Form)
    VITE_EMAILJS_SERVICE_ID=your_service_id
    VITE_EMAILJS_TEMPLATE_ID=your_template_id
    VITE_EMAILJS_PUBLIC_KEY=your_public_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```



## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

