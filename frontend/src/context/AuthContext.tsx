import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { User } from "../types";
import {
  apiService,
  getApiError,
} from "../services/api";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: string;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  googleLogin: (
    credential: string
  ) => Promise<boolean>;

  register: (data: any) => Promise<boolean>;

  logout: () => void;

  refreshProfile: () => Promise<void>;

  updateProfile: (
    updatedData: Partial<User> & {
      profileFile?: File;
    }
  ) => Promise<void>;

  toasts: ToastMessage[];

  addToast: (
    message: string,
    type?: "success" | "error" | "info"
  ) => void;

  removeToast: (id: string) => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser =
      localStorage.getItem("auth_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () =>
      localStorage.getItem("auth_token") ||
      localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);

  const [authError, setAuthError] =
    useState("");

  const [toasts, setToasts] = useState<
    ToastMessage[]
  >([]);

  const removeToast = (id: string) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  };

  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Math.random()
      .toString(36)
      .substring(2, 9);

    setToasts((current) => [
      ...current,
      {
        id,
        type,
        message,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "auth_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(
        "auth_token",
        token
      );
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  const refreshProfile = async () => {
    const storedToken =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("accessToken");

    if (!storedToken) {
      setUser(null);
      return;
    }

    try {
      const profile =
        await apiService.getProfile();

      const updatedUser: User = {
        id: String(profile.id),
        name: profile.full_name,
        email: profile.email,

        targetRole:
          user?.targetRole ||
          "Software Engineer",

        profilePicture:
          profile.profile_picture || undefined,

        githubUrl:
          profile.github ||
          user?.githubUrl,

        linkedinUrl:
          profile.linkedin ||
          user?.linkedinUrl,
      };

      setUser(updatedUser);
    } catch (error) {
      console.error(
        "Unable to load profile:",
        error
      );

      localStorage.removeItem("auth_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("auth_user");

      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const loadAuthentication = async () => {
      const storedToken =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      await refreshProfile();

      setLoading(false);
    };

    loadAuthentication();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setAuthError("");

    try {
      const response =
        await apiService.login(
          email.trim().toLowerCase(),
          password
        );

      localStorage.setItem(
        "auth_token",
        response.access
      );

      localStorage.setItem(
        "accessToken",
        response.access
      );

      localStorage.setItem(
        "refreshToken",
        response.refresh
      );

      setToken(response.access);

      const loggedInUser: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        targetRole: "Software Engineer",
      };

      setUser(loggedInUser);

      addToast(
        `Welcome back, ${response.user.name}!`,
        "success"
      );

      return true;
    } catch (error) {
      const message = getApiError(
        error,
        "Invalid email or password."
      );

      setAuthError(message);

      addToast(message, "error");

      return false;
    }
  };

  const googleLogin = async (
    credential: string
  ): Promise<boolean> => {
    setAuthError("");

    try {
      const response =
        await apiService.googleLogin(
          credential
        );

      localStorage.setItem(
        "auth_token",
        response.access
      );

      localStorage.setItem(
        "accessToken",
        response.access
      );

      localStorage.setItem(
        "refreshToken",
        response.refresh
      );

      setToken(response.access);

      const loggedInUser: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        targetRole: "Software Engineer",
      };

      setUser(loggedInUser);

      addToast(
        `Welcome, ${response.user.name}!`,
        "success"
      );

      return true;
    } catch (error) {
      const message = getApiError(
        error,
        "Google login failed."
      );

      setAuthError(message);

      addToast(message, "error");

      return false;
    }
  };

  const register = async (
    registerData: any
  ): Promise<boolean> => {
    try {
      await apiService.register(
        registerData
      );

      addToast(
        "Registration successful. Check your email for the OTP.",
        "success"
      );

      return true;
    } catch (error) {
      addToast(
        getApiError(
          error,
          "Registration failed."
        ),
        "error"
      );

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth_user");

    setToken(null);
    setUser(null);
    setAuthError("");

    addToast(
      "Logged out successfully.",
      "info"
    );
  };

  const updateProfile = async (
      updatedData: Partial<User> & {
        profileFile?: File;
      }
    ): Promise<void> => {
      const formData = new FormData();

      if (updatedData.name !== undefined) {
        formData.append("full_name", updatedData.name);
      }

      if (updatedData.phone !== undefined) {
        formData.append("phone", updatedData.phone);
      }

      if (updatedData.preferredLanguage !== undefined) {
        formData.append(
          "preferred_language",
          updatedData.preferredLanguage
        );
      }

      if (updatedData.githubUrl !== undefined) {
        formData.append("github", updatedData.githubUrl);
      }

      if (updatedData.linkedinUrl !== undefined) {
        formData.append("linkedin", updatedData.linkedinUrl);
      }

      if (updatedData.profileFile) {
        formData.append(
          "profile_picture",
          updatedData.profileFile
        );
      }

      const profile =
        await apiService.updateProfile(formData);

      const updatedUser: User = {
        id: String(profile.id),
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone || "",
        preferredLanguage:
          profile.preferred_language || "Python",
        profilePicture:
          profile.profile_picture || undefined,
        githubUrl: profile.github || "",
        linkedinUrl: profile.linkedin || "",
        targetRole:
          updatedData.targetRole ||
          user?.targetRole ||
          "Software Engineer",
        targetCompany:
          updatedData.targetCompany ||
          user?.targetCompany,
      };

      setUser(updatedUser);

      addToast(
        "Profile updated successfully.",
        "success"
      );
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(
          user && token
        ),
        authError,
        login,
        googleLogin,
        register,
        logout,
        refreshProfile,
        updateProfile,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};