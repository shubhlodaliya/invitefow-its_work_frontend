import { Button } from "@/app/components/ui/button";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-end gap-4">
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button size="lg" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-8xl mb-4">💍</div>
          </motion.div>

          {/* App Name */}
          <motion.h1
            className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Wedding Card PDF Generator
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Create personalized wedding cards in minutes
            <br />
            <span className="text-lg text-gray-600">
              Simple • Professional • Gujarati Friendly
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/signup')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/login')}>
              Login to Continue
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg mb-2">Upload Excel</h3>
              <p className="text-sm text-gray-600">Import guest names from Excel file</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg mb-2">Customize Design</h3>
              <p className="text-sm text-gray-600">Place names with Gujarati fonts</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">⬇️</div>
              <h3 className="text-lg mb-2">Download PDFs</h3>
              <p className="text-sm text-gray-600">Get personalized cards instantly</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
