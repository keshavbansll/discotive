import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BentoCard from "../components/ui/BentoCard";
import {
  ChevronRight,
  TrendingUp,
  Clock,
  Target,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
            System Online
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tighter"
          >
            {greeting},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
              John.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 font-medium mt-2"
          >
            You are <span className="text-white font-bold">14 days</span> into
            your execution streak. Do not break the chain.
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 w-fit"
        >
          Log Daily Execution <ArrowUpRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <BentoCard
          delay={0.1}
          className="md:col-span-2 lg:col-span-2 bg-[#0a0a0a]"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" /> Today's Imperatives
            </h2>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
              3 Remaining
            </span>
          </div>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
              <div className="mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-white transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-slate-300 transition-colors">
                  Complete React Architecture Module
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Est. 2 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
              <div className="mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-white transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-slate-300 transition-colors">
                  Draft Startup Pitch Deck Outline
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" /> High
                  Priority
                </p>
              </div>
            </div>
          </div>
        </BentoCard>

        <BentoCard
          delay={0.2}
          onClick={() => console.log("Go to score")}
          className="bg-gradient-to-br from-[#121212] to-[#0a0a0a]"
        >
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
            Global Score
          </h2>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-6xl font-extrabold tracking-tighter">
              742
            </span>
            <span className="text-sm font-bold text-green-400 flex items-center mb-2">
              <TrendingUp className="w-4 h-4 mr-1" /> +12 this week
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-white rounded-full w-[74%]" />
          </div>
          <p className="text-xs text-slate-400 font-medium">
            You are currently in the{" "}
            <strong className="text-white">Top 12%</strong> of your cohort. Keep
            pushing.
          </p>
        </BentoCard>

        <BentoCard delay={0.3} onClick={() => console.log("Go to finance")}>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
            Net Capital
          </h2>
          <div className="text-4xl font-extrabold tracking-tighter mb-6">
            ₹12.4k
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Freelance UX</span>
              <span className="font-bold text-white">+₹8,000</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Cloud Hosting</span>
              <span className="font-bold text-red-400">-₹1,200</span>
            </div>
          </div>
        </BentoCard>

        <BentoCard
          delay={0.4}
          className="md:col-span-3 lg:col-span-4 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0a0a0a]"
        >
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              An AI Internship matches your profile.
            </h3>
            <p className="text-slate-400 font-medium">
              RG Consultancy Services is looking for a Tech Business Dev Intern.
              Your match probability is 88%.
            </p>
          </div>
          <button className="w-full md:w-auto px-8 py-3 bg-white/10 text-white border border-white/20 font-bold rounded-full hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 whitespace-nowrap">
            Review Match <ChevronRight className="w-4 h-4" />
          </button>
        </BentoCard>
      </div>
    </div>
  );
};

export default Dashboard;
