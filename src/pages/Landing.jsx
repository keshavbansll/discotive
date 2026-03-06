import { useState } from "react";
import { Link } from "react-router-dom"; // <-- This was the missing import!
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Layout,
  Activity,
  MapPin,
  Target,
  Sparkles,
  Code,
  Video,
  Briefcase,
  Paintbrush,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import GlobalLoader from "../components/GlobalLoader";
import AnimatedButton from "../components/AnimatedButton";

const Landing = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const menuContent = {
    features: [
      {
        icon: Layout,
        title: "Execution Timeline",
        desc: "Your 12-month deterministic roadmap.",
      },
      {
        icon: Activity,
        title: "Discotive Score",
        desc: "The universal career credibility metric.",
      },
      {
        icon: Target,
        title: "AI Matchmaking",
        desc: "Get paired with the right internships.",
      },
      {
        icon: MapPin,
        title: "Campus Hubs",
        desc: "Offline co-working and mentorship.",
      },
    ],
    careers: [
      {
        icon: Code,
        title: "Engineering & Tech",
        desc: "Full-stack, AI, DevOps, Data.",
      },
      {
        icon: Video,
        title: "Filmmaking & Media",
        desc: "Directors, Editors, Producers.",
      },
      {
        icon: Paintbrush,
        title: "Design & Art",
        desc: "UI/UX, 3D Artists, Illustrators.",
      },
      {
        icon: Briefcase,
        title: "Business & Strategy",
        desc: "Founders, PMs, Sales, Ops.",
      },
    ],
  };

  return (
    <>
      {!isLoaded && <GlobalLoader onComplete={() => setIsLoaded(true)} />}

      <div
        className={`min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        {/* ANIMATED NAVBAR */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10"
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <span className="text-2xl font-extrabold tracking-tighter">
                DISCOTIVE
              </span>

              {/* Pill-shaped Navbar Links */}
              <div className="hidden md:flex items-center gap-2">
                <AnimatedButton
                  variant="nav"
                  className="bg-white/5 border border-white/10 hover:border-white/20 px-5"
                  onMouseEnter={() => setActiveMenu("features")}
                >
                  Features
                </AnimatedButton>
                <AnimatedButton
                  variant="nav"
                  className="bg-white/5 border border-white/10 hover:border-white/20 px-5"
                  onMouseEnter={() => setActiveMenu("careers")}
                >
                  Careers
                </AnimatedButton>
                <AnimatedButton
                  variant="nav"
                  className="bg-white/5 border border-white/10 hover:border-white/20 px-5"
                  href="#hubs"
                  onMouseEnter={() => setActiveMenu(null)}
                >
                  Campus Hubs
                </AnimatedButton>
                <AnimatedButton
                  variant="nav"
                  className="bg-white/5 border border-white/10 hover:border-white/20 px-5"
                  href="#pricing"
                  onMouseEnter={() => setActiveMenu(null)}
                >
                  Pricing
                </AnimatedButton>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <AnimatedButton
                to="/app"
                variant="outline"
                className="px-6 py-2.5 hidden md:flex"
              >
                Log in
              </AnimatedButton>
              <AnimatedButton to="/app" variant="solid" className="px-6 py-2.5">
                Get Started
              </AnimatedButton>
            </div>
          </div>

          {/* Mega Menu Dropdown Panel (Smooth Crossfade) */}
          <AnimatePresence>
            {activeMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-20 left-0 w-full bg-[#0a0a0a] border-b border-white/10 shadow-2xl overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMenu}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8"
                  >
                    {menuContent[activeMenu].map((item, idx) => (
                      <a
                        href="#feature"
                        key={idx}
                        className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-400">{item.desc}</p>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* HERO SECTION */}
        <main className="pt-40 pb-32 px-6 max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate={isLoaded ? "show" : "hidden"}
            transition={{ staggerChildren: 0.1 }}
            className="max-w-5xl"
          >
            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-8xl lg:text-[110px] font-extrabold tracking-tighter leading-[0.9] mb-8"
            >
              Where <span className="text-slate-500">careers</span> <br />{" "}
              actually happen.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
            >
              The operating system for the next generation of builders. Not just
              engineers. Filmmakers, founders, artists, and strategists.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <AnimatedButton
                to="/app"
                variant="solid"
                className="px-10 py-4 text-lg w-full sm:w-auto"
              >
                Create your universe
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                className="px-10 py-4 text-lg w-full sm:w-auto"
              >
                Explore the OS
              </AnimatedButton>
            </motion.div>
          </motion.div>

          {/* Cinematic Video Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="aspect-[4/5] rounded-3xl bg-[#121212] border border-white/10 overflow-hidden relative group cursor-pointer shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
              >
                <source
                  src="https://cdn.pixabay.com/video/2020/05/25/40140-424915151_large.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">
                    Filmmaker
                  </span>
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] group-hover:scale-150 transition-transform" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-left text-white drop-shadow-lg">
                  "Discotive gave me the exact timeline to direct my first indie
                  short."
                </h3>
              </div>
            </div>

            <div className="aspect-[4/5] rounded-3xl bg-[#121212] border border-white/10 overflow-hidden relative group cursor-pointer md:-translate-y-12 shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
              >
                <source
                  src="https://cdn.pixabay.com/video/2021/08/04/83866-584745869_large.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">
                    Engineer
                  </span>
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] group-hover:scale-150 transition-transform" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-left text-white drop-shadow-lg">
                  "Secured my startup internship exactly when the OS predicted I
                  would."
                </h3>
              </div>
            </div>

            <div className="aspect-[4/5] rounded-3xl bg-[#121212] border border-white/10 overflow-hidden relative group cursor-pointer shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
              >
                <source
                  src="https://cdn.pixabay.com/video/2020/04/16/36382-411475704_large.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">
                    Founder
                  </span>
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] group-hover:scale-150 transition-transform" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-left text-white drop-shadow-lg">
                  "The daily planner built my discipline. The offline hub built
                  my team."
                </h3>
              </div>
            </div>
          </motion.div>
        </main>

        {/* VALUE PROPOSITION: The Arsenal */}
        <section className="py-32 bg-[#121212] text-white px-6 border-y border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-20 max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
                Build a monopoly
                <br />
                on your future.
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                Everything you need to stop consuming content and start
                executing on your legacy. Built specifically for ambitious
                outliers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#0a0a0a] rounded-3xl p-10 border border-white/5 group">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  <Layout className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">
                  The Gantt Engine
                </h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Turn your 4-year degree into a day-by-day execution timeline.
                  Add milestones, track daily tasks, and never wake up wondering
                  what you should be doing today.
                </p>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all"
                >
                  Explore Timeline <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#0a0a0a] rounded-3xl p-10 border border-white/5 group">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">
                  The Discotive Score
                </h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  A proprietary algorithm that calculates your exact placement
                  readiness based on skills, consistency, and network. Know
                  exactly where you stand globally.
                </p>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all"
                >
                  Calculate Score <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FREEMIUM / UPGRADE TEASER */}
        <section className="py-40 px-6 max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold tracking-widest uppercase mb-8">
            <Sparkles className="w-4 h-4" /> Discotive Pro
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-8">
            For those who refuse
            <br />
            to leave it to chance.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            The basic OS gets you started for free. Discotive Pro unlocks
            predictive placement AI, unlimited Gantt dependencies, and exclusive
            access to physical Campus Centres.
          </p>
          <AnimatedButton
            to="/app"
            variant="solid"
            className="px-10 py-5 text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Upgrade to Pro — ₹499/mo
          </AnimatedButton>
        </section>

        {/* THE PATREON-STYLE MEGA FOOTER */}
        <footer className="border-t border-white/10 bg-[#0a0a0a] pt-20 pb-10 px-6">
          <div className="max-w-[1400px] mx-auto">
            {/* Top Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-20">
              <div>
                <h4 className="font-bold text-white mb-6">Careers</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Software Engineers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Filmmakers & Directors
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Founders & PMs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Content Creators
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      UI/UX Designers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Features</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      The Gantt Timeline
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Discotive Score Engine
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Algorithmic Matchmaking
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Daily Execution Journal
                    </a>
                  </li>
                  <li className="pl-4 border-l border-white/10">
                    <a href="#" className="hover:text-white transition-colors">
                      Join a Campus Hub
                    </a>
                  </li>
                  <li className="pl-4 border-l border-white/10">
                    <a href="#" className="hover:text-white transition-colors">
                      Become a Mentor
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Pricing</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Basic OS is Free
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Discotive Pro
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Campus Hub Passes
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Resources</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      OS Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Newsroom
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center & FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Partner Directory
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Mobile App
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Press
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Use & Policies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar: Apps, Language, Socials, Copyright */}
            <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-white/10 gap-8">
              <div className="flex items-center gap-4">
                {/* Fake App Store Buttons */}
                <button className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-xs font-bold">Google Play</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-xs font-bold">App Store</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-full text-sm font-bold hover:bg-white/5 transition-colors">
                  <Globe className="w-4 h-4" /> English (United States)
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-full text-sm font-bold hover:bg-white/5 transition-colors">
                  <MapPin className="w-4 h-4" /> India (भारत)
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-full text-sm font-bold hover:bg-white/5 transition-colors">
                  ₹ INR
                </button>
              </div>

              <div className="flex items-center gap-6 text-slate-400">
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="text-center mt-12 text-xs text-slate-600 font-medium">
              © 2026 Discotive Hubs. Built in Jaipur, Rajasthan.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
