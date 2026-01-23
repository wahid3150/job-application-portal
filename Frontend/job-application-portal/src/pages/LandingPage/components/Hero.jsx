import { motion } from "framer-motion";
import { Search, ArrowRight, Users, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const isAuthenticated = true;
  const user = { fullName: "Wahid", role: "employer" };

  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: "Active Users", value: "2.4M+" },
    { icon: Building2, label: "Companies", value: "50k+" },
    { icon: TrendingUp, label: "Job Posted", value: "150k+" },
  ];
  return (
    <section className="">
      <div>
        <div>
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className=""
          >
            Find Your Dream Job or
            <span className="">Perfect Hire</span>
          </motion.h1>
          {/* Sub heading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className=""
          >
            connect talented professionals with innovative companies. Your next
            career move or perfect candidate is just one click away.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
