import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Code, Coffee, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SolutionCard = ({ icon: Icon, title, description, color, image, reverse }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 py-16 border-b border-white/5 last:border-0`}
    >
      <div className="flex-1 w-full flex flex-col items-start gap-6">
        <div className={`p-4 rounded-2xl bg-opacity-10 backdrop-blur-md`} style={{ backgroundColor: `${color}1A`, color: color }}>
          <Icon size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-lg text-brand-textSecondary leading-relaxed">{description}</p>
        <ul className="flex flex-col gap-3 mt-2">
          {['Identify recurring complaints automatically', 'Generate auto-responses to salvage ratings', 'Track sentiment shifts over time'].map((item, idx) => (
             <li key={idx} className="flex items-center gap-3 text-brand-textSecondary">
                <ChevronRight size={16} style={{ color }} />
                {item}
             </li>
          ))}
        </ul>
        <button 
          onClick={() => navigate('/upload')}
          className="mt-4 px-6 py-3 rounded-full font-bold text-white transition-all shadow-lg hover:brightness-110"
          style={{ backgroundColor: color, boxShadow: `0 10px 25px -5px ${color}40` }}
        >
          Try it for your Industry
        </button>
      </div>

      <div className="flex-1 w-full">
        <div className="relative rounded-3xl overflow-hidden aspect-video bg-brand-card/50 border border-brand-border group shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/80 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-60"></div>
           
           {image ? (
              <img 
                 src={image} 
                 alt={`${title} dashboard showcase`} 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700 blur-[1px] group-hover:blur-none" 
              />
           ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-105 transition-transform duration-700">
                 <Activity size={120} style={{ color }} />
              </div>
           )}
           
           <div className="absolute bottom-6 left-6 z-20">
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 font-mono text-sm text-white transition-transform duration-300 group-hover:-translate-y-1">
                 Real-time Pipeline • {title}
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Solutions = () => {
  const solutions = [
    {
      icon: ShoppingBag,
      title: "E-Commerce & Retail",
      color: "#3B82F6", // Blue
      image: "/images/retail_dashboard.png",
      description: "When selling products online, a single bad review can tank sales. ReviewMind automatically clusters Amazon feedback into 'Packaging Issues' or 'Quality Deficits', allowing you to immediately correct operational flaws before they scale."
    },
    {
      icon: Code,
      title: "SaaS & Software",
      color: "#A855F7", // Purple
      image: "/images/saas_dashboard.png",
      description: "Stop manually reading through Trustpilot feedback. Let our LLM pipeline categorize feature requests versus actual bug reports, automatically dumping technical grievances directly into Jira for your engineering team."
    },
    {
      icon: Coffee,
      title: "Hospitality & Dining",
      color: "#F97316", // Orange
      image: "/images/hospitality_dashboard.png",
      description: "For hotels and restaurants, ambiance is everything. Our AI specifically targets emotional variance like 'joy' and 'disgust' to ensure your establishment's atmosphere matches your marketing promises."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none opacity-40"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">every</span> pipeline.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-brand-textSecondary"
          >
            ReviewMind is entirely agnostic. Whether you sell physical products, digital subscriptions, or real-world experiences, our emotion matrix adapts to your domain.
          </motion.p>
        </div>

        {/* Solutions Container */}
        <div className="flex flex-col">
          {solutions.map((sol, idx) => (
             <SolutionCard 
                key={idx}
                icon={sol.icon}
                title={sol.title}
                description={sol.description}
                color={sol.color}
                image={sol.image}
                reverse={idx % 2 !== 0}
             />
          ))}
        </div>
        
      </div>
    </div>
  );
};
