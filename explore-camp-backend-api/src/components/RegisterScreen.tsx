import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import heroImage from '@/assets/hero-mountain-autumn.jpg';
import logo from '@/assets/explore-camp-logo.png';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.register(formData);
      
      if (response.error) {
        toast({
          title: "Registration Failed",
          description: response.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully. Please login.",
        });
        navigate('/login');
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
        <div className="flex flex-col items-center justify-center pt-16 pb-8">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="ExploreCamp" className="w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">ExploreCamp</h1>
            <p className="text-white/80 text-sm">For Discovering & Evaluating Campsites</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-t-3xl p-6 mx-4 mb-4 flex-1">
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                placeholder="Enter your name"
              />
            </div>

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

            {/* Location Field */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                placeholder="Enter your location"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white text-sm font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 resize-none"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                placeholder="Create a password"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleRegister}
              variant="forest"
              size="lg"
              className="w-full font-semibold mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Submit'}
            </Button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-white/80 text-sm">
                Already an account?{' '}
                <Link 
                  to="/login" 
                  className="text-white font-semibold underline hover:no-underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;