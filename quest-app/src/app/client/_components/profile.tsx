"use client";

import { useAuthState } from "@/lib/useAuth";
import AuthButton from '@/components/ui/authButton';
import CameraBackground from '@/components/ui/cameraBackground';
import Link from 'next/link';
import React from 'react';


const ProfilePage = () => {
  const { user } = useAuthState();
  const email = user?.profile?.email || "No email available";
  const name = user?.profile?.name || user?.profile?.preferred_username || "Student";
  const isAdmin = Array.isArray(user?.profile?.["cognito:groups"]) ? user.profile["cognito:groups"].includes("Admin") : false;
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <CameraBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
            <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.25a7.75 7.75 0 0115 0v.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.25z" />
            </svg>
          </div>          
          <h1 className="text-2xl font-bold text-indigo-700">{name}</h1>
          <p className="text-gray-600">{email}</p>
          <div className="w-full border-t my-4" />
          <div className="flex flex-col gap-3 w-full">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Admin View
              </Link>
            )}
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
