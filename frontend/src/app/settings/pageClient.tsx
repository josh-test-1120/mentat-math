'use client';

import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { User, Lock, Mail, UserCircle, Save, Eye, EyeOff } from "lucide-react";
import { RingSpinner } from "@/components/UI/Spinners";
import { motion } from "framer-motion";
import { useSessionData } from "@/hooks/useSessionData";

/**
 * Settings Page Client Component
 * Allows users to view and update their profile information and change password
 * @constructor
 */
export default function SettingsClient() {
    const { userSession, sessionReady, status } = useSessionData();
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    // Profile form state
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // UI state
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    
    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Initialize profile data from session when ready
     */
    useEffect(() => {
        if (!sessionReady || !userSession.id) return;

        // Initialize profile data from session
        setProfileData({
            firstName: '', // Will be fetched from backend
            lastName: '',
            username: userSession.username || '',
            email: userSession.email || '',
        });
    }, [sessionReady, userSession.id, userSession.username, userSession.email]);

    /**
     * Fetch user profile data from backend
     */
    useEffect(() => {
        // Ensure we have all required authentication data before making API calls
        if (status !== "authenticated" || !sessionReady || !userSession.id || !userSession.accessToken || userSession.accessToken === '') return;

        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const res = await apiHandler(
                    undefined,
                    'GET',
                    `api/user/${userSession.id}`,
                    `${BACKEND_API}`,
                    userSession.accessToken
                );

                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching profile:', res.error);
                    toast.error('Failed to load profile data');
                } else {
                    setProfileData({
                        firstName: res.firstName || '',
                        lastName: res.lastName || '',
                        username: res.username || userSession.username,
                        email: res.email || userSession.email,
                    });
                }
            } catch (e) {
                console.error('Error fetching profile:', e);
                toast.error('Failed to load profile data');
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [status, sessionReady, userSession.id, userSession.accessToken, BACKEND_API]);

    /**
     * Handle profile update
     */
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userSession.accessToken || userSession.accessToken === '') {
            toast.error('Authentication required. Please log in again.');
            return;
        }

        setIsSaving(true);

        try {
            const res = await apiHandler(
                {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    username: profileData.username,
                    email: profileData.email,
                },
                'PATCH',
                `api/user/profile/${userSession.id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || 'Failed to update profile');
            } else {
                toast.success('Profile updated successfully!');
                // Optionally refresh session to get updated data
            }
        } catch (e) {
            console.error('Error updating profile:', e);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handle password change
     */
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (!userSession.accessToken || userSession.accessToken === '') {
            toast.error('Authentication required. Please log in again.');
            return;
        }

        setIsSaving(true);

        try {
            const res = await apiHandler(
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                },
                'PATCH',
                `api/user/password/${userSession.id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            if (res instanceof Error || (res && res.error)) {
                // Provide user-friendly error messages
                const errorMessage = res?.message || 'Failed to change password';
                toast.error(errorMessage);
            } else {
                toast.success('Password changed successfully!');
                // Reset password form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (e) {
            console.error('Error changing password:', e);
            toast.error('Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || !sessionReady) {
        return (
            <div className="flex justify-center items-center h-full">
                <RingSpinner size={'md'} color={'mentat-gold'} />
                <p className="ml-3 text-lg text-mentat-gold">Loading settings...</p>
            </div>
        );
    }

    if (status === "unauthenticated" || !userSession.id) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-mentat-gold">Please log in to access settings</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-screen-2xl px-4 pt-6 pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-mentat-gold mb-2">Settings</h1>
                    <p className="text-mentat-gold/70">Manage your account information and preferences</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 border-b border-mentat-gold/20">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 font-semibold transition-colors relative ${
                            activeTab === 'profile'
                                ? 'text-mentat-gold'
                                : 'text-mentat-gold/60 hover:text-mentat-gold/80'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5" />
                            <span>Profile Information</span>
                        </div>
                        {activeTab === 'profile' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-mentat-gold"
                                layoutId="activeTab"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`px-6 py-3 font-semibold transition-colors relative ${
                            activeTab === 'password'
                                ? 'text-mentat-gold'
                                : 'text-mentat-gold/60 hover:text-mentat-gold/80'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            <span>Change Password</span>
                        </div>
                        {activeTab === 'password' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-mentat-gold"
                                layoutId="activeTab"
                            />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-card-color rounded-lg border border-mentat-gold/20 p-6 shadow-lg">
                    {activeTab === 'profile' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-mentat-gold mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Personal Information
                                    </h2>
                                    <p className="text-sm text-mentat-gold/60 mb-4">
                                        Update your personal information. Changes will be reflected across your account.
                                    </p>
                                </div>

                                {isLoadingProfile ? (
                                    <div className="flex justify-center items-center py-8">
                                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                                        <p className="ml-3 text-sm text-mentat-gold">Loading profile...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* First Name */}
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="firstName" className="text-sm font-medium text-mentat-gold">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    value={profileData.firstName}
                                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                    required
                                                    className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                                                    placeholder="Enter your first name"
                                                />
                                            </div>

                                            {/* Last Name */}
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="lastName" className="text-sm font-medium text-mentat-gold">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    value={profileData.lastName}
                                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                    required
                                                    className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                                                    placeholder="Enter your last name"
                                                />
                                            </div>

                                            {/* Username */}
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="username" className="text-sm font-medium text-mentat-gold">
                                                    Username <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    value={profileData.username}
                                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                    required
                                                    className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                                                    placeholder="Enter your username"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="email" className="text-sm font-medium text-mentat-gold flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    required
                                                    className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-3 pt-4 border-t border-mentat-gold/20">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 bg-mentat-gold hover:bg-mentat-gold-700 text-crimson font-semibold py-2 px-6 rounded-md shadow-sm shadow-mentat-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <RingSpinner size={'xs'} color={'crimson'} />
                                                        <span>Saving...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        <span>Save Changes</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-mentat-gold mb-4 flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        Change Password
                                    </h2>
                                    <p className="text-sm text-mentat-gold/60 mb-4">
                                        Update your password to keep your account secure. Use a strong password with at least 6 characters.
                                    </p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    {/* Current Password */}
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="currentPassword" className="text-sm font-medium text-mentat-gold">
                                            Current Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 pr-10"
                                                placeholder="Enter your current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-mentat-gold/60 hover:text-mentat-gold transition-colors"
                                                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="newPassword" className="text-sm font-medium text-mentat-gold">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                minLength={6}
                                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 pr-10"
                                                placeholder="Enter your new password (min. 6 characters)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-mentat-gold/60 hover:text-mentat-gold transition-colors"
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium text-mentat-gold">
                                            Confirm New Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                                minLength={6}
                                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 pr-10"
                                                placeholder="Confirm your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-mentat-gold/60 hover:text-mentat-gold transition-colors"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-mentat-gold/20">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 bg-mentat-gold hover:bg-mentat-gold-700 text-crimson font-semibold py-2 px-6 rounded-md shadow-sm shadow-mentat-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSaving ? (
                                            <>
                                                <RingSpinner size={'xs'} color={'crimson'} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span>Update Password</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

