"use client"; // Important for Next.js App Router to enable client-side hooks

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { messaging, getToken, onMessage } from "../lib/firebaseMessaging";
import { sendFCMTokenToBackend } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
      return;
    }

    async function requestPermission() {
      try {
        // Check if messaging is available (client-side only)
        if (!messaging) {
          console.log("Firebase messaging not available");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted");
          
          try {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
              console.log("FCM Token:", currentToken);
              
              // Send token to backend
              const result = await sendFCMTokenToBackend({
                token: currentToken,
                deviceType: 'web',
              });
              
              if (result.success) {
                console.log("FCM token successfully sent to backend");
              } else {
                console.error("Failed to send FCM token to backend:", result.error);
              }
              
            } else {
              console.log("No registration token available.");
            }
          } catch (err) {
            console.error("Error getting FCM token:", err);
          }
        } else {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }

    // Request permission automatically when page loads
    requestPermission();

    // Listen for foreground messages
    let unsubscribe = () => {};
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        
        // Show a custom notification or update UI
        if (payload.notification) {
          // You can show a custom toast/notification here
          console.log("Notification title:", payload.notification.title);
          console.log("Notification body:", payload.notification.body);
        }
      });
    }

    return () => {
      unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/Edimy.png"
              alt="Edimy Logo"
              width={40}
              height={40}
              priority
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">Edimy</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 py-20">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Edimy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Transform your learning experience with our innovative educational platform. 
                Discover, learn, and grow with cutting-edge tools designed for modern education.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Start Learning Today
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Why Choose Edimy?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover the features that make learning engaging, effective, and enjoyable
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interactive Learning</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Engage with dynamic content, interactive exercises, and real-time feedback to enhance your learning experience.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitor your learning journey with detailed analytics, progress reports, and personalized insights.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Collaborative Learning</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with peers, join study groups, and learn together in a supportive community environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Image
                src="/Edimy.png"
                alt="Edimy Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-gray-800 dark:text-white">Edimy</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 Edimy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
