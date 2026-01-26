import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  FileText,
  Upload,
  Trash2,
  Loader,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../utils/apiService";
import JobseekerLayout from "../../components/Layouts/JobseekerLayout";

const UserProfile = () => {
  const { user, login } = useAuth();
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [name, setName] = useState("");

  const refresh = async () => {
    const res = await userAPI.getMyProfile();
    if (res.success) {
      setProfile(res.user);
      setName(res.user?.name || "");
      const token = localStorage.getItem("token");
      if (token) login(res.user, token);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await refresh();
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveName = async () => {
    try {
      setIsSaving(true);
      const res = await userAPI.updateProfile({ name });
      if (res.success) {
        toast.success("Profile updated");
        const token = localStorage.getItem("token");
        if (token && res.user) login(res.user, token);
        setProfile(res.user);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const onUploadAvatar = async (file) => {
    try {
      setIsUploadingAvatar(true);
      const res = await userAPI.uploadAvatar(file);
      if (res.success) {
        toast.success("Avatar updated");
        const token = localStorage.getItem("token");
        if (token && res.user) login(res.user, token);
        setProfile(res.user);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onUploadResume = async (file) => {
    try {
      setIsUploadingResume(true);
      const res = await userAPI.uploadResume(file);
      if (res.success) {
        toast.success("Resume uploaded");
        const token = localStorage.getItem("token");
        if (token && res.user) login(res.user, token);
        setProfile(res.user);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const onDeleteResume = async () => {
    try {
      setIsDeletingResume(true);
      const res = await userAPI.deleteResume();
      if (res.success) {
        toast.success("Resume deleted");
        const token = localStorage.getItem("token");
        if (token && res.user) login(res.user, token);
        setProfile(res.user);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete resume");
    } finally {
      setIsDeletingResume(false);
    }
  };

  if (isLoading) {
    return (
      <JobseekerLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </JobseekerLayout>
    );
  }

  const display = profile || user;
  const avatarUrl = display?.avatar ? `http://localhost:8000${display.avatar}` : null;
  const resumeUrl = display?.resume ? `http://localhost:8000${display.resume}` : null;

  return (
    <JobseekerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                title="Change avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadAvatar(f);
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{display?.email}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Role: {display?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500"
          />
          <button
            onClick={onSaveName}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Resume</h2>
          {resumeUrl ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl"
              >
                <FileText className="w-4 h-4" />
                View Resume
              </a>
              <button
                onClick={() => resumeInputRef.current?.click()}
                disabled={isUploadingResume}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploadingResume ? "Uploading..." : "Replace Resume"}
              </button>
              <button
                onClick={onDeleteResume}
                disabled={isDeletingResume}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeletingResume ? "Deleting..." : "Delete Resume"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => resumeInputRef.current?.click()}
                disabled={isUploadingResume}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploadingResume ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          )}
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadResume(f);
            }}
          />
          <p className="text-sm text-slate-500 mt-3">
            Uploading resume is jobseeker-only.
          </p>
        </div>
      </div>
    </JobseekerLayout>
  );
};

export default UserProfile;
