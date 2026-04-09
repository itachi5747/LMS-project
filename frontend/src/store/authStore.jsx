import axios from "axios";
import { create } from 'zustand'
const API_URL = "http://localhost:3000/app/v1";
axios.defaults.withCredentials = true
const useAuthStore = create((set) => ({
    user: null,
    instructor: null,
    isAuthenticated: false,
    error: null,
    isCheckingAuth: true,
    message: null,
    users: [],
    profile: null,
    university_stats: {},
    login: async (email, password) => {
        set({ error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            set({
                user: response.data.user,
                isAuthenticated: true,
                error: null
            });
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "Error loggin up";
            set({ error: errorMsg });
            throw error;
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false, error: null });
        } catch (error) {
            set({ error: "Error logging out" });
            throw error;
        }
    },
    verifyEmail: async (code) => {
        set({ error: null })
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code })
            set({ user: response.data.user, isAuthenticated: true })
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "Error signing up";
            set({ error: errorMsg });
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null })
        try {
            const response = await axios.get(`${API_URL}/check-auth`)
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false })
        } catch (error) {
            set({ error: null, isAuthenticated: false, isCheckingAuth: false })
        }
    },
    forgotPassword: async (email) => {
        set({ error: null, message: null })
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email })
            set({ message: response.data.message, isLoading: false })
        } catch (error) {
            set({ error: error.response.data.message || "Reset password error" })
            throw error
        }
    },
    resetPassword: async (token, password) => {
        set({ error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message });
        } catch (error) {
            set({

                error: error.response.data.message || "Error resetting password",
            });
            throw error;
        }
    },
    getuser: async (role) => {
        set({ error: null });
        try {
            const response = await axios.get(`${API_URL}/admin/get-user`, {
                params: { role } // e.g., student, instructor, admin
            });
            set({ users: response.data.data });
        } catch (error) {
            set({
                error: error?.response?.data?.message || "Error while getting user data",
            });
            throw error;
        }
    },
    searchuser: async (id, name) => {
        set({ error: null });
        try {
            const response = await axios.get(`${API_URL}/admin/search-user`, {
                params: { id, name }
            });
            set({ users: response.data.data });
        } catch (error) {
            set({
                error: error?.response?.data?.message || "Error while searching user data",
            });
            throw error;
        }
    },
    getUserProfile: async (id) => {
        set({ error: null, profile: null });
        try {
            const response = await axios.get(`${API_URL}/user-profile/${id}`);
            set({ profile: response.data.data });
        } catch (error) {
            set({
                error: error?.response?.data?.message || "Error fetching user profile",
            });
            throw error;
        }
    },
    getUniversityStats: async () => {
        set({ error: null });
        try {
            const res = await axios.get(`${API_URL}/admin/university/stats`, { withCredentials: true });
            set({ university_stats: res.data });
            console.log("university stats are --> ", res.data.data);
        } catch (error) {
            set({
                error: error?.response?.data?.message || "Error fetching stats",
            });
            throw error;
        }
    },
    createInstructor: async (formData) => {
        set({ error: null });
        try {
            const res = await axios.post(`${API_URL}/admin/add-instructor`, formData);
            set({ instructor: res.data.data }); // save only the instructor object
            console.log("Created instructor --> ", res.data.data);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "Error creating instructor";
            set({ error: errorMsg });
            throw error;
        }
    },
    createDep: async (formData) => {
        set({ error: null });
        try {
            const res = await axios.post(`${API_URL}/admin/create-department`, formData);
            console.log("Created department --> ", res.data.data);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "Error creating instructor";
            set({ error: errorMsg });
            throw error;
        }
    }
}));
export default useAuthStore;
