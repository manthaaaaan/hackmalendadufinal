import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanCard = ({ title, price, description, features, isPopular, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex flex-col p-8 rounded-3xl bg-brand-card/50 backdrop-blur-xl border ${
        isPopular ? 'border-brand-primary shadow-2xl shadow-brand-primary/20' : 'border-brand-border hover:border-brand-primary/50'
      } transition-all`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1 shadow-lg">
          <Sparkles size={14} /> Most Popular
        </div>
      )}

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-brand-textSecondary text-sm mb-6 min-h-[40px]">{description}</p>
      
      <div className="mb-8 border-b border-white/10 pb-8">
        <span className="text-5xl font-extrabold text-white">${price}</span>
        {price !== "Custom" && <span className="text-brand-textSecondary">/mo</span>}
      </div>

      <ul className="flex flex-col gap-4 mb-8 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="text-brand-success w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-brand-textSecondary text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={() => navigate('/upload')}
        className={`w-full py-3 rounded-full font-bold transition-all shadow-lg ${
          isPopular 
            ? 'bg-brand-primary hover:bg-brand-primary/90 text-white hover:shadow-brand-primary/25' 
            : 'bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white'
        }`}
      >
        {price === "Custom" ? "Contact Architecture" : "Get Started"}
      </button>
    </motion.div>
  );
};

export const Plans = () => {
  const plans = [
    {
      title: "Starter",
      price: "0",
      description: "Perfect for independent developers testing hypothesis on small datasets.",
      features: [
        "Up to 100 URL Scraping requests",
        "Basic Sentiment Analysis",
        "CSV File Uploads (Max 50 rows)",
        "Standard JSON Exports",
        "Community Support"
      ],
      isPopular: false
    },
    {
      title: "Intelligence Pro",
      price: "49",
      description: "For e-commerce managers who need instant insights and auto-ticketing.",
      features: [
        "Up to 5,000 AI pipeline requests",
        "Advanced Emotion & Pain Point tracking",
        "Photo Review Analysis (Vision AI)",
        "Automated Jira Action Tickets",
        "LLaMA 3 Smart Review Replies",
        "High-Fi Vector PDF Exporting"
      ],
      isPopular: true
    },
    {
      title: "Enterprise Grid",
      price: "Custom",
      description: "On-premise deployments and infinite scraping limits for corporations.",
      features: [
        "Unlimited Scrape & Analyze requests",
        "Custom Deep-Learning Fine-Tuning",
        "White-labeled Dashboard API",
        "Dedicated Data Integrity Manager",
        "Self-Hosted Node Infrastructure",
        "SLA Guarantee"
      ],
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 relative overflow-hidden flex flex-col justify-center">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none opacity-40"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white tracking-tight mb-6"
          >
            Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-400">Intelligence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-brand-textSecondary"
          >
            Scale your feedback infrastructure securely. No hidden token costs, just flat-rate access to our entire analytics pipeline.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <PlanCard 
              key={idx}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              delay={0.2 + (idx * 0.1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
