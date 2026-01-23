import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bookmark,
  FileText,
  Send,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
} from "lucide-react";

const Features = () => {
  const jobSeekerFeatures = [
    {
      icon: Search,
      title: "Explore Diverse Job Types",
      description:
        "Discover remote, full-time, part-time, internship, and contract opportunities. Filter by location, salary range, experience level, and job type to find the perfect fit for your career path.",
    },
    {
      icon: Bookmark,
      title: "Save & Manage Applications",
      description:
        "Save your favorite jobs for later and track all your applications with real-time status updates (applied, in-review, accepted, rejected). Never lose track of your job search journey.",
    },
    {
      icon: FileText,
      title: "Professional Profile & Resume",
      description:
        "Build your professional profile with avatar, resume, and personal details. Showcase your skills and experience. Let employers discover your complete career story and reach out directly.",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description:
        "Connect directly with employers and get instant notifications about your applications. Participate in interview scheduling and receive feedback on your applications in real-time.",
    },
  ];

  const employerFeatures = [
    {
      icon: Send,
      title: "Post & Manage Jobs",
      description:
        "Create detailed job postings with descriptions, requirements, salary ranges, and job types. Mark jobs as closed when filled. Update job details anytime and keep candidates informed.",
    },
    {
      icon: Users,
      title: "Review Applications",
      description:
        "Receive applications from qualified candidates with their resumes and profiles. Manage applicants through complete workflow states (applied, in-review, accepted, rejected) with ease.",
    },
    {
      icon: BarChart3,
      title: "Hiring Analytics Dashboard",
      description:
        "Track key metrics: total jobs posted, applications received, and successful hires. Make data-driven hiring decisions with comprehensive insights into your recruitment pipeline.",
    },
    {
      icon: Zap,
      title: "Smart Candidate Matching",
      description:
        "Our intelligent system recommends the most relevant candidates for your positions based on job requirements. Save time and focus on the best matches for your team.",
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const FeatureItem = ({ feature, colorClass }) => (
    <motion.div
      variants={itemVariants}
      className="flex gap-6 mb-10 last:mb-0 group"
    >
      <div
        className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colorClass}`}
      >
        <feature.icon className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {feature.title}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need To
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Powerful tools designed for both job seekers and employers to
            achieve their goals. Whether you're looking for your next
            opportunity or hiring top talent, we've got you covered.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20">
          {/* For Job Seekers */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-14">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 pb-4 border-b-4 border-blue-600 inline-block">
                For Job Seekers
              </h3>
              <p className="text-gray-600 mt-4">
                Find your dream job and accelerate your career with our
                comprehensive job search and application management tools.
              </p>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {jobSeekerFeatures.map((feature, index) => (
                <FeatureItem
                  key={index}
                  feature={feature}
                  colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
                />
              ))}
            </motion.div>
          </motion.div>

          {/* For Employers */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-14">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 pb-4 border-b-4 border-purple-600 inline-block">
                For Employers
              </h3>
              <p className="text-gray-600 mt-4">
                Streamline your hiring process and find top talent quickly with
                our powerful recruitment and analytics tools.
              </p>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {employerFeatures.map((feature, index) => (
                <FeatureItem
                  key={index}
                  feature={feature}
                  colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
                />
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-24 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-10 md:p-16 text-center border border-blue-100"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of job seekers and employers who are already
            succeeding on JobPortal. Whether you're searching for your next
            opportunity or building your dream team, start today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow text-lg"
            >
              Find Jobs Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow text-lg"
            >
              Post a Job
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
