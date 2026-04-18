import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Download, Bot, Target, Link, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-brand-card/50 backdrop-blur-xl border border-brand-border hover:border-brand-primary/50 transition-colors rounded-2xl p-8 flex flex-col gap-4 shadow-lg hover:shadow-brand-primary/10"
  >
    <div className="bg-brand-primary/20 w-14 h-14 rounded-xl flex items-center justify-center text-brand-primary mb-2">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
    <p className="text-brand-textSecondary leading-relaxed">{description}</p>
  </motion.div>
);

export const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Deep Emotion Mapping",
      description: "Our dual-engine AI pipeline scans thousands of reviews instantly, extracting hidden sentiments ranging from joy to surprise against a proprietary psychological index."
    },
    {
      icon: Target,
      title: "Pain Point Aggregation",
      description: "Automatically clusters unstructured customer complaints into concrete categories like Delivery Issues and Product Quality so you know what to fix."
    },
    {
      icon: Link,
      title: "Smart URL Extraction",
      description: "Paste an Amazon or Trustpilot hyperlink directly into our dashboard. We bypass generic boilerplate text to exclusively capture raw customer quotes and verified purchase photos."
    },
    {
      icon: Bot,
      title: "Auto-Drafted AI Replies",
      description: "Integrates with LLaMA 3 via Groq to instantly generate personalized, empathetic response drafts tailored to uniquely appease dissatisfied customers."
    },
    {
      icon: ShieldCheck,
      title: "Intelligent Deduplication",
      description: "Aggressive filtering engine strips out duplicate records and spam entries using high-speed substring normalization, maintaining pristine data integrity."
    },
    {
      icon: Download,
      title: "Corporate PDF Reporting",
      description: "Instantly transform complex browser dashboards into paginated, vector-based PDF documents perfect for offline analysis and stakeholder sharing."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none opacity-30"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border border-brand-primary/20"
          >
            <Sparkles size={16} />
            Platform Capabilities
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6"
          >
            Intelligence designed to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-400">scale.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-brand-textSecondary"
          >
            Discover the machine learning mechanics behind ReviewMind, built specifically to transform scattered customer feedback into structured, actionable insights.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, idx) => (
            <FeatureCard 
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.2 + (idx * 0.1)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-brand-card to-brand-primary/10 border border-brand-border rounded-3xl p-12 text-center max-w-4xl mx-auto flex flex-col items-center shadow-2xl"
        >
          <Zap className="text-brand-primary w-12 h-12 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ready to map your emotions?</h2>
          <p className="text-brand-textSecondary mb-8 max-w-xl">
            Plug a product URL directly into ReviewMind right now and watch our AI instantly categorize your customer feedback.
          </p>
          <button 
            onClick={() => navigate('/upload')}
            className="bg-brand-primary hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-primary/25"
          >
            Launch the Analyzer
          </button>
        </motion.div>

      </div>
    </div>
  );
};
