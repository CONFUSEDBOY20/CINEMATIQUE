import React, { useState, useRef, useCallback } from 'react';
import {
  Camera, Edit3, Save, X, Heart, Star, Clock,
  Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, Trash2, User as UserIcon, ImagePlus, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Musical'
];

type Tab = 'info' | 'genres' | 'password';

export function ProfilePage() {
  const { user, watchlist, updateProfile, changePassword } = useAppContext();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('info');

  // ── Info form state ────────────────────────────────────────────────────────
  const [name, setName]             = useState(user?.name || '');
  const [bio, setBio]               = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview]     = useState<string>(user?.avatar || '');
  const [coverPreview, setCoverPreview]       = useState<string>(user?.coverPhoto || '');
  const [infoLoading, setInfoLoading]         = useState(false);
  const [infoMsg, setInfoMsg]                 = useState<{ ok: boolean; text: string } | null>(null);

  // ── Genre state ────────────────────────────────────────────────────────────
  const [genres, setGenres]         = useState<string[]>(user?.genres || []);
  const [genreLoading, setGenreLoading]       = useState(false);
  const [genreMsg, setGenreMsg]               = useState<{ ok: boolean; text: string } | null>(null);

  // ── Password form state ────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [pwLoading, setPwLoading]             = useState(false);
  const [pwMsg, setPwMsg]                     = useState<{ ok: boolean; text: string } | null>(null);

  // ── File input refs ────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarPick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setAvatarPreview(dataUrl);
    e.target.value = '';
  }, []);

  const handleCoverPick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setCoverPreview(dataUrl);
    e.target.value = '';
  }, []);

  // ── Save info ──────────────────────────────────────────────────────────────
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setInfoMsg({ ok: false, text: 'Name cannot be empty' }); return; }
    setInfoLoading(true); setInfoMsg(null);
    const result = await updateProfile({
      name: name.trim(),
      bio,
      avatar: avatarPreview,
      coverPhoto: coverPreview,
    });
    setInfoLoading(false);
    setInfoMsg({ ok: result.ok, text: result.ok ? 'Profile updated!' : result.error || 'Update failed' });
  };

  // ── Save genres ────────────────────────────────────────────────────────────
  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleSaveGenres = async () => {
    setGenreLoading(true); setGenreMsg(null);
    const result = await updateProfile({ genres });
    setGenreLoading(false);
    setGenreMsg({ ok: result.ok, text: result.ok ? 'Genres saved!' : result.error || 'Failed' });
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPw || !newPw || !confirmPw) { setPwMsg({ ok: false, text: 'All fields are required' }); return; }
    if (newPw.length < 6)  { setPwMsg({ ok: false, text: 'New password must be at least 6 characters' }); return; }
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: 'New passwords do not match' }); return; }
    setPwLoading(true);
    const result = await changePassword(currentPw, newPw);
    setPwLoading(false);
    if (result.ok) {
      setPwMsg({ ok: true, text: 'Password changed successfully!' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setPwMsg({ ok: false, text: result.error || 'Failed to change password' });
    }
  };

  // ── Avatar display ─────────────────────────────────────────────────────────
  const avatarInitial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen pb-12">

      {/* ── Cover Photo ────────────────────────────────────────────────────── */}
      <div className="relative h-52 md:h-64 overflow-hidden group">
        {coverPreview ? (
          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-crimson/30 via-brand-black to-brand-gold/20" />
        )}
        <div className="absolute inset-0 bg-black/30" />

        {/* Change cover button */}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-xs uppercase tracking-widest font-bold"
        >
          <ImagePlus className="w-5 h-5" /> Change Cover Photo
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
      </div>

      {/* ── Avatar + Name header ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="relative flex items-end gap-5 -mt-14 mb-6">
          {/* Avatar */}
          <div className="relative group flex-shrink-0 z-10">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-brand-black overflow-hidden bg-brand-crimson flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.4)]"
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-4xl font-bold text-white font-serif">{avatarInitial}</span>
              }
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change photo"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
          </div>

          {/* Name & join date */}
          <div className="pb-2">
            <h1 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-tight">{user?.name}</h1>
            <p className="text-brand-gold text-[10px] uppercase font-bold tracking-[0.2em]">
              {user?.email}
            </p>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Heart className="w-4 h-4 text-brand-crimson" />, label: 'Watchlist', value: watchlist.length },
            { icon: <Star className="w-4 h-4 text-brand-gold" />, label: 'Reviews', value: 0 },
            { icon: <Clock className="w-4 h-4 text-blue-400" />, label: 'Hrs Watched', value: 142 },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-xl">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-2xl font-bold font-serif text-brand-gold">{s.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Edit Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl mb-6">
          {([
            { id: 'info',     label: 'Profile Info',  icon: <UserIcon className="w-3.5 h-3.5" /> },
            { id: 'genres',   label: 'Genres',        icon: <Star className="w-3.5 h-3.5" /> },
            { id: 'password', label: 'Password',      icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                tab === t.id ? 'bg-brand-gold text-brand-black shadow' : 'text-white/40 hover:text-white'
              }`}
            >
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Panels ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── INFO TAB ───────────────────────────────────────────────── */}
            {tab === 'info' && (
              <form onSubmit={handleSaveInfo} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                <SectionTitle icon={<Edit3 className="w-4 h-4" />}>Edit Profile Info</SectionTitle>

                {/* Avatar & Cover quick-change buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all"
                  >
                    <Camera className="w-4 h-4" /> Change Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all"
                  >
                    <ImagePlus className="w-4 h-4" /> Change Cover
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview('')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:border-red-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Avatar
                    </button>
                  )}
                </div>

                {/* Avatar live preview */}
                {avatarPreview && (
                  <div className="flex items-center gap-4 p-4 bg-black/30 rounded-2xl border border-white/10">
                    <img src={avatarPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-brand-gold" />
                    <div>
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Avatar Preview</p>
                      <p className="text-[10px] text-white/30 mt-1">This is how your avatar will appear</p>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <FieldLabel>Full Name</FieldLabel>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your display name"
                    className={inputCls}
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`${inputCls} opacity-40 cursor-not-allowed`}
                  />
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1.5 ml-2">Cannot be changed</p>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Bio</FieldLabel>
                    <span className="text-[10px] text-white/30">{bio.length}/300</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, 300))}
                    rows={3}
                    placeholder="Tell the world about your taste in cinema…"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-5 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors resize-none placeholder-white/20"
                  />
                </div>

                <FormMsg msg={infoMsg} />

                <button
                  type="submit"
                  disabled={infoLoading}
                  className="w-full py-4 rounded-full bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(255,215,0,0.25)]"
                >
                  {infoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {infoLoading ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* ── GENRES TAB ─────────────────────────────────────────────── */}
            {tab === 'genres' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                <SectionTitle icon={<Star className="w-4 h-4" />}>
                  Favourite Genres
                  <span className="ml-2 text-white/30 text-xs">({genres.length} selected)</span>
                </SectionTitle>
                <p className="text-white/40 text-xs">Select all genres you enjoy — this shapes your recommendations.</p>

                <div className="flex flex-wrap gap-2.5">
                  {ALL_GENRES.map(g => {
                    const active = genres.includes(g);
                    return (
                      <motion.button
                        key={g}
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        onClick={() => toggleGenre(g)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                          active
                            ? 'bg-brand-gold text-brand-black border-brand-gold shadow-[0_0_12px_rgba(255,215,0,0.3)]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {g}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected list */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {genres.map(g => (
                      <span key={g} className="flex items-center gap-1 px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-xs font-bold text-brand-gold">
                        {g}
                        <button onClick={() => toggleGenre(g)} className="hover:text-red-400 transition-colors ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <FormMsg msg={genreMsg} />

                <button
                  type="button"
                  onClick={handleSaveGenres}
                  disabled={genreLoading}
                  className="w-full py-4 rounded-full bg-brand-gold text-brand-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(255,215,0,0.25)]"
                >
                  {genreLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {genreLoading ? 'Saving…' : 'Save Genres'}
                </button>
              </div>
            )}

            {/* ── PASSWORD TAB ───────────────────────────────────────────── */}
            {tab === 'password' && (
              <form onSubmit={handleChangePassword} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-5">
                <SectionTitle icon={<Lock className="w-4 h-4" />}>Change Password</SectionTitle>

                <PwField
                  label="Current Password"
                  value={currentPw}
                  onChange={setCurrentPw}
                  show={showCurrent}
                  toggle={() => setShowCurrent(p => !p)}
                  autoComplete="current-password"
                />
                <PwField
                  label="New Password"
                  value={newPw}
                  onChange={setNewPw}
                  show={showNew}
                  toggle={() => setShowNew(p => !p)}
                  autoComplete="new-password"
                  hint="Minimum 6 characters"
                />
                <PwField
                  label="Confirm New Password"
                  value={confirmPw}
                  onChange={setConfirmPw}
                  show={showConfirm}
                  toggle={() => setShowConfirm(p => !p)}
                  autoComplete="new-password"
                />

                {/* Strength bar */}
                {newPw && (
                  <PasswordStrength password={newPw} />
                )}

                <FormMsg msg={pwMsg} />

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-4 rounded-full bg-brand-crimson text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(229,9,20,0.25)]"
                >
                  {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {pwLoading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-black/50 border border-white/10 rounded-full py-3.5 px-5 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors placeholder-white/20';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-2">
      {children}
    </label>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-white/60 pb-4 border-b border-white/10">
      {icon}{children}
    </h3>
  );
}

function FormMsg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
        msg.ok
          ? 'bg-green-500/10 border-green-500/30 text-green-300'
          : 'bg-red-500/10 border-red-500/30 text-red-300'
      }`}
    >
      {msg.ok
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {msg.text}
    </motion.div>
  );
}

function PwField({
  label, value, onChange, show, toggle, autoComplete, hint
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; toggle: () => void; autoComplete: string; hint?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative flex items-center bg-black/50 border border-white/10 rounded-full px-5 py-3.5 focus-within:border-brand-gold transition-colors">
        <Lock className="w-4 h-4 text-white/30 mr-3 flex-shrink-0" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none"
        />
        <button type="button" onClick={toggle} tabIndex={-1} className="ml-3 text-white/30 hover:text-white/70 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1.5 ml-3">{hint}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];

  return (
    <div>
      <div className="flex gap-1.5 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 ml-1">
        Strength: <span className="text-white/60">{labels[score - 1] || 'Very Weak'}</span>
      </p>
    </div>
  );
}
