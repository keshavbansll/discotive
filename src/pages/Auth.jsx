import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthLoader from "../components/AuthLoader";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import emailjs from "@emailjs/browser";
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  Github,
  Linkedin,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Link as LinkIcon,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Search,
  X,
  Check,
} from "lucide-react";

// --- EMAILJS CONFIG ---
const EMAILJS_SERVICE_ID = "discotive";
const EMAILJS_TEMPLATE_ID = "requestaccess";
const EMAILJS_PUBLIC_KEY = "tNizhqFNon4v2m6OC";

// --- TAXONOMY DATA FOR DROPDOWNS ---
const PREDEFINED_SKILLS = [
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "Firebase",
  "AWS",
  "Machine Learning",
  "C++",
  "Java",
  "Solidity",
  "Figma",
  "UI/UX Design",
  "Graphic Design",
  "3D Modeling",
  "Blender",
  "Adobe Premiere Pro",
  "Cinematography",
  "Color Grading",
  "DaVinci Resolve",
  "Product Management",
  "Agile/Scrum",
  "Growth Marketing",
  "SEO/SEM",
  "Copywriting",
  "Sales",
  "B2B Outreach",
  "Financial Modeling",
  "Public Speaking",
  "Negotiation",
  "Data Analytics",
  "SQL",
  "Tableau",
  "Cybersecurity",
  "Blockchain",
  "Swift",
].sort();

const PREDEFINED_LANGUAGES = [
  "English",
  "Hindi",
  "Mandarin",
  "Spanish",
  "French",
  "Arabic",
  "Bengali",
  "Russian",
  "Portuguese",
  "Indonesian",
  "Urdu",
  "German",
  "Japanese",
  "Swahili",
  "Marathi",
  "Telugu",
  "Turkish",
  "Tamil",
  "Korean",
  "Vietnamese",
].sort();

const PREDEFINED_PASSIONS = [
  "Software Engineer",
  "AI Researcher",
  "Founder / CEO",
  "Product Manager",
  "UI/UX Designer",
  "Filmmaker / Director",
  "Cinematic Colorist",
  "Content Creator",
  "Protocol Developer",
  "Data Scientist",
  "Growth Marketer",
  "Venture Capitalist",
  "Indie Hacker",
  "Game Developer",
].sort();

// --- VALIDATION REGEX FOR STEP 6 ---
const FOOTPRINT_VALIDATORS = {
  instagram: {
    regex: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/,
    prefix: "https://instagram.com/",
  },
  linkedin: {
    regex: /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?$/,
    prefix: "https://linkedin.com/in/",
  },
  github: {
    regex: /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/,
    prefix: "https://github.com/",
  },
  twitter: {
    regex: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$/,
    prefix: "https://x.com/",
  },
  youtube: {
    regex:
      /^https:\/\/(www\.)?youtube\.com\/(c\/|channel\/|@)?[A-Za-z0-9_-]+\/?$/,
    prefix: "https://youtube.com/",
  },
  facebook: {
    regex: /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9.]+\/?$/,
    prefix: "https://facebook.com/",
  },
  reddit: {
    regex: /^https:\/\/(www\.)?reddit\.com\/user\/[A-Za-z0-9_-]+\/?$/,
    prefix: "https://reddit.com/user/",
  },
  pinterest: {
    regex: /^https:\/\/(www\.)?pinterest\.com\/[A-Za-z0-9_]+\/?$/,
    prefix: "https://pinterest.com/",
  },
  linktree: {
    regex: /^https:\/\/(www\.)?linktr\.ee\/[A-Za-z0-9_.-]+\/?$/,
    prefix: "https://linktr.ee/",
  },
  figma: {
    regex: /^https:\/\/(www\.)?figma\.com\/@?[A-Za-z0-9_-]+$/,
    prefix: "https://figma.com/",
  },
  linkedinCompany: {
    regex: /^https:\/\/(www\.)?linkedin\.com\/company\/[A-Za-z0-9-]+\/?$/,
    prefix: "https://linkedin.com/company/",
  },
  website: { regex: /^https?:\/\/.*/, prefix: "https://" },
};

// --- CUSTOM UI COMPONENTS ---
const CustomSearchSelect = ({
  options,
  value,
  onChange,
  placeholder,
  allowCustom,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/40 transition-all">
        <input
          type="text"
          value={query}
          required={required}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (allowCustom) onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-slate-600"
        />
        <ChevronRight
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filtered.length === 0 && !allowCustom && (
              <div className="p-3 text-xs text-slate-500">
                No matches found.
              </div>
            )}
            {filtered.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  setQuery(opt);
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-4 py-2.5 text-sm hover:bg-[#222] cursor-pointer transition-colors text-slate-300 hover:text-white"
              >
                {opt}
              </div>
            ))}
            {filtered.length === 0 && allowCustom && query.length > 0 && (
              <div
                onClick={() => {
                  onChange(query);
                  setIsOpen(false);
                }}
                className="px-4 py-2.5 text-sm hover:bg-[#222] cursor-pointer text-blue-400 font-bold"
              >
                Use "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomMultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  allowCustom,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpt = (val) => {
    if (selected.includes(val)) onChange(selected.filter((i) => i !== val));
    else onChange([...selected, val]);
    setQuery("");
  };

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className="min-h-[50px] w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/40 transition-all flex flex-wrap gap-2 items-center cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selected.map((item) => (
          <span
            key={item}
            className="px-2.5 py-1 bg-[#222] border border-[#444] rounded-lg text-xs font-bold text-white flex items-center gap-2"
          >
            {item}{" "}
            <X
              className="w-3 h-3 cursor-pointer hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                toggleOpt(item);
              }}
            />
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-white placeholder-slate-600"
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filtered.map((opt) => (
              <div
                key={opt}
                onClick={() => toggleOpt(opt)}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#222] cursor-pointer transition-colors text-slate-300"
              >
                <span>{opt}</span>
                {selected.includes(opt) && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
            ))}
            {filtered.length === 0 && allowCustom && query.length > 0 && (
              <div
                onClick={() => toggleOpt(query)}
                className="px-4 py-2.5 text-sm hover:bg-[#222] cursor-pointer text-blue-400 font-bold"
              >
                Add "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [isBooting, setIsBooting] = useState(false);
  const [authTaskComplete, setAuthTaskComplete] = useState(false);

  const slides = [
    {
      image: "/stock/Wolf of Wall Street 1.jpg",
      quote:
        "The only thing standing between you and your goal is the bulls**t story...",
      author: "Jordan Belfort",
    },
    {
      image: "/stock/F1.jpg",
      quote: "We can't win if we don't try.",
      author: "Sonny Hayes",
    },
    {
      image: "/stock/The Social Network.jpg",
      quote: "They came to me with an idea, I had a better one.",
      author: "Mark Zuckerberg",
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      6000,
    );
    return () => clearInterval(t);
  }, [slides.length]);

  // --- STATE VARIABLES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null); // true/false/null

  const [contact, setContact] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const [currentStatus, setCurrentStatus] = useState("");
  const [institution, setInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [gradYear, setGradYear] = useState("");

  const [passion, setPassion] = useState("");
  const [niche, setNiche] = useState("");
  const [parallelPath, setParallelPath] = useState("");
  const [goal3Months, setGoal3Months] = useState("");
  const [longTermGoal, setLongTermGoal] = useState("");

  const [rawSkills, setRawSkills] = useState([]);
  const [alignedSkills, setAlignedSkills] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [guardianProfession, setGuardianProfession] = useState("");
  const [incomeBracket, setIncomeBracket] = useState("");
  const [financialLaunchpad, setFinancialLaunchpad] = useState("");
  const [investmentCapacity, setInvestmentCapacity] = useState("");

  // Footprints separated by intent
  const [personalFootprint, setPersonalFootprint] = useState({
    linkedin: "",
    github: "",
    instagram: "",
    twitter: "",
    youtube: "",
    reddit: "",
    pinterest: "",
    linktree: "",
    figma: "",
  });
  const [commercialFootprint, setCommercialFootprint] = useState({
    linkedinCompany: "",
    website: "",
    otherPlatform: "",
  });

  const [wildcardInfo, setWildcardInfo] = useState("");
  const [coreMotivation, setCoreMotivation] = useState("");

  // --- DERIVED DATA ---
  const currentYear = new Date().getFullYear();
  const gradYearOptions = Array.from({ length: 11 }, (_, i) =>
    (currentYear + i).toString(),
  );

  // Password Strength Logic
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length > 7) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  };
  const pwScore = getPasswordStrength();

  // Username Availability Debounce Logic
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const checkUsername = async () => {
      const q = query(
        collection(db, "users"),
        where("identity.username", "==", username.toLowerCase()),
      );
      const snap = await getDocs(q);
      setUsernameAvailable(snap.empty);
    };
    const timeoutId = setTimeout(() => {
      checkUsername();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // --- HANDLERS ---
  const handleSignUpStep1 = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !username)
      return setError("Identity fields are required.");
    if (pwScore < 2)
      return setError("Password is too weak. Add numbers or symbols.");
    if (usernameAvailable === false)
      return setError("Username is already taken.");

    setLoading(true);
    setError("");
    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("identity.email", "==", email));
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        setError("Identity already exists. Proceed to Login.");
        setLoading(false);
        return;
      }

      const whitelistRef = collection(db, "whitelisted_emails");
      const wlQuery = query(whitelistRef, where("email", "==", email));
      const wlSnap = await getDocs(wlQuery);

      if (wlSnap.empty) setStep("locked");
      else setStep(2);
    } catch (err) {
      setError("System verification failed.");
    }
    setLoading(false);
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!contact) return setError("Contact number is required.");
    setLoading(true);
    setError("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: contact,
          message: requestMessage || "No additional message provided.",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStep("requested");
    } catch (err) {
      console.error("EmailJS Error:", err);
      setError("Failed to dispatch request. Try again later.");
    }
    setLoading(false);
  };

  const handleStep6Submit = (e) => {
    e.preventDefault();
    setError("");

    // 1. Extract all non-empty links
    let allLinks = [];
    const validate = (obj) => {
      for (const [key, val] of Object.entries(obj)) {
        if (val.trim() !== "") {
          const rule = FOOTPRINT_VALIDATORS[key];
          if (rule && !rule.regex.test(val)) {
            setError(
              `Invalid URL format for ${key}. Must start with ${rule.prefix}`,
            );
            return false;
          }
          allLinks.push(val.trim().toLowerCase());
        }
      }
      return true;
    };

    if (!validate(personalFootprint) || !validate(commercialFootprint)) return;

    // 2. Check for Duplicates globally
    const uniqueLinks = new Set(allLinks);
    if (uniqueLinks.size !== allLinks.length) {
      setError(
        "Duplicate links detected. You cannot paste the same link across multiple categories.",
      );
      return;
    }

    setStep(7);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsBooting(true);
    setError("");
    setAuthTaskComplete(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        identity: {
          firstName,
          lastName,
          email,
          username: username.toLowerCase(),
        },
        baseline: {
          currentStatus,
          institution,
          course,
          specialization,
          gradYear,
        },
        vision: { passion, niche, parallelPath, goal3Months, longTermGoal },
        skills: { rawSkills, alignedSkills, languages },
        resources: {
          guardianProfession,
          incomeBracket,
          financialLaunchpad,
          investmentCapacity,
        },
        footprint: {
          personal: personalFootprint,
          commercial: commercialFootprint,
        },
        wildcard: { wildcardInfo, coreMotivation },
        discotiveScore: 500, // Placeholder for AI engine
        createdAt: new Date().toISOString(),
      });
      setAuthTaskComplete(true);
    } catch (err) {
      setIsBooting(false);
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Enter email and password.");
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app");
    } catch (err) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (isBooting) return <AuthLoader taskComplete={authTaskComplete} />;

  const inputClass =
    "w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-all [&::-webkit-scrollbar]:hidden";
  const labelClass =
    "block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans selection:bg-white selection:text-black">
      {/* LEFT SIDE: Slideshow */}
      <div className="hidden md:flex md:w-5/12 p-12 flex-col justify-between relative overflow-hidden bg-black border-r border-white/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide].image}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-0" />
        <div className="relative z-10">
          <Link
            to="/"
            className="flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity w-fit"
          >
            <img
              src="/logox.png"
              alt="Discotive"
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-extrabold tracking-tighter drop-shadow-lg">
              DISCOTIVE
            </span>
          </Link>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[0.9] mb-6 drop-shadow-xl">
            Build your <br /> monopoly.
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-sm leading-relaxed drop-shadow-md">
            Stop consuming. Start executing. Join the ecosystem of outlier
            founders, engineers, and creators.
          </p>
        </div>
        <div className="relative z-10 my-auto pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="max-w-md"
            >
              <p className="text-2xl font-bold tracking-tight text-white mb-4 leading-tight">
                "{slides[currentSlide].quote}"
              </p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                — {slides[currentSlide].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDE: The Forms */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
        <div className="w-full max-w-lg py-10">
          <AnimatePresence mode="wait">
            {/* --- MISSING LOGIN BLOCK RESTORED --- */}
            {isLogin && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-4xl font-extrabold tracking-tighter mb-2">
                  Welcome back.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  Access your Command Center.
                </p>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Boot OS"
                    )}
                  </button>
                </form>
                <p className="mt-8 text-center text-sm font-medium text-slate-500">
                  New here?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setStep(1);
                      setError("");
                    }}
                    className="text-white hover:underline transition-all font-bold"
                  >
                    Create your universe
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP 1: IDENTITY */}
            {!isLogin && step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Step 1</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  Initialize Profile.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  Your baseline identity.
                </p>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSignUpStep1} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Operator Handle (Username)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] font-bold">
                        @
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`${inputClass} pl-10`}
                        required
                        placeholder="johndoe"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {usernameAvailable === true && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        {usernameAvailable === false && (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        {usernameAvailable === null && username.length > 2 && (
                          <Loader2 className="w-4 h-4 text-[#666] animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Secure Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      required
                      minLength="8"
                      placeholder="Minimum 8 characters"
                    />
                    {/* Password Strength Matrix */}
                    <div className="flex items-center gap-1 mt-3 px-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${pwScore >= level ? (pwScore > 2 ? "bg-green-500" : pwScore === 2 ? "bg-amber-500" : "bg-red-500") : "bg-[#333]"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-between group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : (
                      <>
                        <span>Verify Credentials</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                <p className="mt-8 text-center text-sm font-medium text-slate-500">
                  Already verified?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                    }}
                    className="text-white hover:underline transition-all font-bold"
                  >
                    Log in here
                  </button>
                </p>
              </motion.div>
            )}

            {/* THE VELVET ROPE: PROTOCOL LOCKED */}
            {!isLogin && step === "locked" && (
              <motion.div
                key="locked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                      Protocol Locked.
                    </h2>
                    <p className="text-xs text-[#888] font-medium uppercase tracking-widest">
                      Closed Beta Architecture
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#ccc] leading-relaxed mb-6">
                  Discotive is currently invite-only for the top 1% of builders.
                  Your coordinate{" "}
                  <strong className="text-white">({email})</strong> is not
                  verified on the chain.
                </p>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold mb-4">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleRequestAccess}
                  className="space-y-4 pt-4 border-t border-[#222]"
                >
                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className={inputClass}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Transmission (Optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows="3"
                      className={inputClass}
                      placeholder="Why should you be granted access?"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 bg-[#121212] border border-[#222] text-white font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="flex-1 px-6 py-4 bg-amber-500 text-black font-extrabold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                      ) : (
                        <>
                          Request Clearance <Lock className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* REQUEST LOGGED */}
            {!isLogin && step === "requested" && (
              <motion.div
                key="requested"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-10"
              >
                <div className="flex justify-center mb-6">
                  <CheckCircle2 className="w-20 h-20 text-green-500" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                  Transmission Logged.
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                  Your coordinates have been sent to the Discotive routing
                  engine. You will be notified via email or phone if clearance
                  is granted.
                </p>
                <div className="pt-8">
                  <Link
                    to="/"
                    className="text-sm font-bold text-white hover:text-slate-400 uppercase tracking-widest transition-colors border-b border-white pb-1"
                  >
                    Return to Surface
                  </Link>
                </div>
              </motion.div>
            )}

            {/* STEP 2: EDUCATION */}
            {!isLogin && step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Step 2</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  The Baseline.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  Where are you starting from?
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(3);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className={labelClass}>Current Status</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="" disabled>
                        Select execution state...
                      </option>
                      <option value="Undergraduate">
                        Undergraduate Student
                      </option>
                      <option value="Working Professional">
                        Working Professional
                      </option>
                      <option value="Freelancer/Creator">
                        Freelancer / Creator
                      </option>
                      <option value="Dropped Out/Building">
                        Dropped Out / Building
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Institution / Organization (Optional)
                    </label>
                    <CustomSearchSelect
                      options={[
                        "JECRC Foundation",
                        "IIT Bombay",
                        "Stanford",
                        "MIT",
                        "Google",
                        "Apple",
                      ]}
                      value={institution}
                      onChange={setInstitution}
                      placeholder="Search campus or entity..."
                      allowCustom={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>
                        Course / Degree (Optional)
                      </label>
                      <CustomSearchSelect
                        options={["B.Tech", "B.Des", "MBA", "BCA", "B.Sc"]}
                        value={course}
                        onChange={setCourse}
                        placeholder="Search degree..."
                        allowCustom={true}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Specialization (Optional)
                      </label>
                      <CustomSearchSelect
                        options={[
                          "Computer Science",
                          "Mechanical",
                          "UI/UX",
                          "Finance",
                        ]}
                        value={specialization}
                        onChange={setSpecialization}
                        placeholder="Core focus..."
                        allowCustom={true}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Graduation Year (Optional)
                    </label>
                    <CustomSearchSelect
                      options={gradYearOptions}
                      value={gradYear}
                      onChange={setGradYear}
                      placeholder="Select timeline..."
                      allowCustom={false}
                    />
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: VISION */}
            {!isLogin && step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Step 3</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  The Vision.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  What is your ultimate professional coordinate?
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(4);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className={labelClass}>
                      #PASSION (Primary Identity)
                    </label>
                    <CustomSearchSelect
                      options={PREDEFINED_PASSIONS}
                      value={passion}
                      onChange={setPassion}
                      placeholder="Search roles..."
                      allowCustom={true}
                      required={true}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      The Micro-Niche (Optional)
                    </label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Full-Stack, Protocol Dev, Stop-Motion..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Parallel Goal (Optional)
                    </label>
                    <input
                      type="text"
                      value={parallelPath}
                      onChange={(e) => setParallelPath(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Building SaaS alongside Degree"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>3-Month Milestone</label>
                      <input
                        type="text"
                        value={goal3Months}
                        onChange={(e) => setGoal3Months(e.target.value)}
                        className={inputClass}
                        placeholder="Short-term target"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Long-Term Horizon</label>
                      <input
                        type="text"
                        value={longTermGoal}
                        onChange={(e) => setLongTermGoal(e.target.value)}
                        className={inputClass}
                        placeholder="Ultimate endgame"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-4 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SKILLS */}
            {!isLogin && step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Step 4</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  The Arsenal.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  What utilities and tools do you possess?
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (languages.length === 0)
                      return setError("Select at least one language.");
                    setStep(5);
                  }}
                  className="space-y-5"
                >
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>
                      Raw Inventory (Capabilities)
                    </label>
                    <CustomMultiSelect
                      options={PREDEFINED_SKILLS}
                      selected={rawSkills}
                      onChange={setRawSkills}
                      placeholder="Search and add skills..."
                      allowCustom={true}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Alignment Filter (Core Focus)
                    </label>
                    <CustomMultiSelect
                      options={rawSkills}
                      selected={alignedSkills}
                      onChange={setAlignedSkills}
                      placeholder={
                        rawSkills.length === 0
                          ? "Select raw skills first"
                          : "Which of your raw skills matter most?"
                      }
                      allowCustom={false}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Linguistic Protocols (Required)
                    </label>
                    <CustomMultiSelect
                      options={PREDEFINED_LANGUAGES}
                      selected={languages}
                      onChange={setLanguages}
                      placeholder="Select languages..."
                      allowCustom={false}
                    />
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-4 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 5: RESOURCES */}
            {!isLogin && step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Step 5</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  Resource Map.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  Tailoring your realistic scholarship & tool paths.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(6);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className={labelClass}>
                      Primary Guardian's Profession (Optional)
                    </label>
                    <CustomSearchSelect
                      options={[
                        "Teacher",
                        "Business Owner",
                        "Software Engineer",
                        "Doctor",
                        "Government Service",
                        "Defense",
                      ]}
                      value={guardianProfession}
                      onChange={setGuardianProfession}
                      placeholder="Search profession..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Household Income Bracket (Optional)
                    </label>
                    <select
                      value={incomeBracket}
                      onChange={(e) => setIncomeBracket(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select bracket...</option>
                      <option value="< 5L">Less than ₹5 Lakhs</option>
                      <option value="5L - 10L">₹5 Lakhs - ₹10 Lakhs</option>
                      <option value="> 10L">More than ₹10 Lakhs</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Financial Launchpad (Required)
                    </label>
                    <select
                      value={financialLaunchpad}
                      onChange={(e) => setFinancialLaunchpad(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="" disabled>
                        Select backing level...
                      </option>
                      <option value="Bootstrapping">
                        Bootstrapping / Self-funded
                      </option>
                      <option value="Limited Support">Limited Support</option>
                      <option value="Highly Backed">Highly Backed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Career Investment Capacity (Required)
                    </label>
                    <select
                      value={investmentCapacity}
                      onChange={(e) => setInvestmentCapacity(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="" disabled>
                        Select capacity...
                      </option>
                      <option value="Minimal">Minimal (Free tools only)</option>
                      <option value="Moderate">
                        Moderate (Basic courses/tools)
                      </option>
                      <option value="High">High (Premium gear)</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-6 py-4 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 6: FOOTPRINT */}
            {!isLogin && step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Step 6</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  Digital Footprint.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  Connect your external ledger. (All optional)
                </p>
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleStep6Submit} className="space-y-8">
                  {/* Personal Block */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white border-b border-[#222] pb-2">
                      Personal Footprint
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.instagram}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              instagram: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="Instagram Profile"
                        />
                      </div>
                      <div className="relative">
                        <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.linkedin}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              linkedin: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="LinkedIn (Personal)"
                        />
                      </div>
                      <div className="relative">
                        <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.github}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              github: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="GitHub Profile"
                        />
                      </div>
                      <div className="relative">
                        <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.twitter}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              twitter: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="X / Twitter"
                        />
                      </div>
                      <div className="relative">
                        <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.youtube}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              youtube: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="YouTube Channel"
                        />
                      </div>
                      <div className="relative">
                        <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.linktree}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              linktree: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="Linktree"
                        />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.reddit}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              reddit: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="Reddit User"
                        />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.pinterest}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              pinterest: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="Pinterest"
                        />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={personalFootprint.figma}
                          onChange={(e) =>
                            setPersonalFootprint((p) => ({
                              ...p,
                              figma: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="Figma Profile"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Commercial Block */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-white border-b border-[#222] pb-2">
                      Professional / Commercial
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={commercialFootprint.linkedinCompany}
                          onChange={(e) =>
                            setCommercialFootprint((p) => ({
                              ...p,
                              linkedinCompany: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="LinkedIn (Company Page)"
                        />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                        <input
                          type="url"
                          value={commercialFootprint.website}
                          onChange={(e) =>
                            setCommercialFootprint((p) => ({
                              ...p,
                              website: e.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10 text-xs`}
                          placeholder="Official Website URL"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-6 py-4 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span>Secure Footprint</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 7: THE OPEN CANVAS */}
            {!isLogin && step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold text-[#888] uppercase tracking-[0.3em] mb-6">
                  <span className="text-white">Final Step</span>{" "}
                  <span className="opacity-30">/ 7</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
                  The Open Canvas.
                </h2>
                <p className="text-slate-400 font-medium mb-8">
                  Give our AI the context it needs to guide you.
                </p>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      Core Motivation (Required)
                    </label>
                    <textarea
                      value={coreMotivation}
                      onChange={(e) => setCoreMotivation(e.target.value)}
                      rows="3"
                      className={inputClass}
                      placeholder="Why are you doing this? What drives you?"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Anything Else? (Optional)
                    </label>
                    <textarea
                      value={wildcardInfo}
                      onChange={(e) => setWildcardInfo(e.target.value)}
                      rows="3"
                      className={inputClass}
                      placeholder="Any unique constraints, mentors you admire, or facts we should know."
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(6)}
                      className="px-6 py-4 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || isBooting}
                      className="flex-1 px-6 py-4 bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                    >
                      {isBooting ? (
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                      ) : (
                        "Boot Discotive OS"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
