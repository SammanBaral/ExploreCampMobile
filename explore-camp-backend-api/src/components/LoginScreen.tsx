import logo from '@/assets/explore-camp-logo.png';
import heroImage from '@/assets/hero-mountain-autumn.jpg';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiService.login(formData);
      if (response.error) {
        toast({
          title: "Login Failed",
          description: response.error,
          variant: "destructive"
        });
      } else {
        localStorage.setItem('userData', JSON.stringify(response.data?.user));
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully",
        });
        if (response.data?.user?.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await apiService.requestOtp(formData.email);
      if (res.error) {
        setOtpError(res.error);
      } else {
        setOtpSent(true);
        toast({ title: 'OTP Sent', description: 'Check your email for the OTP.' });
      }
    } catch (e) {
      setOtpError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await apiService.verifyOtp(formData.email, otp);
      if (res.error) {
        setOtpError(res.error);
      } else {
        localStorage.setItem('userData', JSON.stringify(res.data?.user));
        toast({ title: 'Welcome!', description: 'Logged in with OTP.' });
        if (res.data?.user?.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (e) {
      setOtpError('Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Logo Section */}
        <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-10">
          <div className="flex flex-col items-center mb-12">
            <img src={logo} alt="ExploreCamp" className="w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">ExploreCamp</h1>
            <p className="text-white/80 text-sm">For Discovering & Evaluating Campsites</p>
          </div>
        </div>
        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-t-3xl p-6 mx-4 mb-4">
          <div className="space-y-6">
            {/* Toggle between Password and OTP login */}
            <div className="flex justify-center mb-2">
              <button
                className={`px-3 py-1 rounded-l bg-white/20 text-white font-semibold ${!otpMode ? 'bg-primary/80' : ''}`}
                onClick={() => setOtpMode(false)}
                disabled={!otpMode}
              >
                Password Login
              </button>
              <button
                className={`px-3 py-1 rounded-r bg-white/20 text-white font-semibold ${otpMode ? 'bg-primary/80' : ''}`}
                onClick={() => setOtpMode(true)}
                disabled={otpMode}
              >
                OTP Login
              </button>
            </div>
            <AnimatePresence mode="wait">
              {!otpMode ? (
                <motion.div
                  key="password-login"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                      placeholder="Enter your email"
                    />
                  </div>
                  {/* Password Field */}
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="password" className="text-white text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {/* Show Password Checkbox */}
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="show-password"
                      checked={showPassword}
                      onCheckedChange={(checked) => setShowPassword(checked === true)}
                      className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="show-password" className="text-white/80 text-sm">
                      Show Password
                    </Label>
                  </div>
                  {/* Login Button */}
                  <Button
                    onClick={handleLogin}
                    variant="forest"
                    size="lg"
                    className="w-full font-semibold mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-login"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="otp-email" className="text-white text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="otp-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                      placeholder="Enter your email"
                      disabled={otpSent}
                    />
                  </div>
                  {/* Request OTP or Enter OTP */}
                  {!otpSent ? (
                    <Button
                      onClick={handleRequestOtp}
                      variant="forest"
                      size="lg"
                      className="w-full font-semibold mt-4"
                      disabled={otpLoading || !formData.email}
                    >
                      {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="otp" className="text-white text-sm font-medium">
                          Enter OTP
                        </Label>
                        <Input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                          placeholder="Enter the OTP sent to your email"
                        />
                      </div>
                      <Button
                        onClick={handleVerifyOtp}
                        variant="forest"
                        size="lg"
                        className="w-full font-semibold mt-4"
                        disabled={otpLoading || !otp}
                      >
                        {otpLoading ? 'Verifying...' : 'Verify OTP & Login'}
                      </Button>
                      <div className="text-center mt-2">
                        <button
                          className="text-white/80 underline text-xs"
                          onClick={() => { setOtpSent(false); setOtp(''); setOtpError(''); }}
                        >
                          Resend OTP
                        </button>
                      </div>
                    </>
                  )}
                  {otpError && <div className="text-red-300 text-xs mt-2 animate-shake">{otpError}</div>}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-white/80 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-white font-semibold underline hover:no-underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;