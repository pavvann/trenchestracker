import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, updatePreferredCurrency } from '@/lib/db';
import { getSupportedCurrencies } from '@/lib/api';
import { FaCog, FaSpinner, FaSave, FaExchangeAlt, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('usd');
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user profile and supported currencies
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        
        if (profile) {
          setDisplayName(profile.displayName || '');
          setPreferredCurrency(profile.preferredCurrency || 'usd');
        }
        
        // Fetch supported currencies
        const currencies = await getSupportedCurrencies();
        setSupportedCurrencies(currencies);
      } catch (error) {
        console.error('Error fetching settings data:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Handle saving profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update display name
      await updateUserProfile(user.uid, {
        displayName
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving currency preference
  const handleSaveCurrency = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update preferred currency
      await updatePreferredCurrency(user.uid, preferredCurrency);
      
      toast.success('Currency preference updated');
    } catch (error) {
      console.error('Error updating currency preference:', error);
      toast.error('Failed to update currency preference');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || (user && isLoading)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaUser className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          
          <form onSubmit={handleSaveProfile}>
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
            >
              {isSaving ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              Save Profile
            </button>
          </form>
        </div>
        
        {/* Currency Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaExchangeAlt className="text-green-500 mr-2" />
            <h2 className="text-xl font-semibold">Currency Settings</h2>
          </div>
          
          <form onSubmit={handleSaveCurrency}>
            <div className="mb-6">
              <label htmlFor="preferredCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preferred Currency
              </label>
              <select
                id="preferredCurrency"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {supportedCurrencies.length > 0 ? (
                  supportedCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency.toUpperCase()}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="inr">INR</option>
                    <option value="gbp">GBP</option>
                    <option value="jpy">JPY</option>
                  </>
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                All cryptocurrency values will be displayed in this currency
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
            >
              {isSaving ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              Save Currency Preference
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}