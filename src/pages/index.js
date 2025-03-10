import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CoinCard from '@/components/CoinCard';
import { useAuth } from '@/contexts/AuthContext';
import { getTrendingCoins } from '@/lib/api';
import { getUserProfile } from '@/lib/db';
import { FaBitcoin, FaChartLine, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Home() {
  const { user, loading } = useAuth();
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState('usd');

  // Fetch trending coins and user preferences
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If user is logged in, get their preferred currency
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.preferredCurrency) {
            setPreferredCurrency(profile.preferredCurrency);
          }
        }
        
        // Fetch trending coins
        const coins = await getTrendingCoins(preferredCurrency);
        setTrendingCoins(coins);
      } catch (error) {
        console.error('Error fetching trending coins:', error);
        toast.error('Failed to load trending cryptocurrencies');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, preferredCurrency]);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg p-8 mb-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Track Your Cryptocurrency Portfolio with Trenches Tracker
          </h1>
          <p className="text-lg mb-6">
            Monitor prices, manage your holdings, and stay updated with the latest cryptocurrency trends.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg">
                Create Free Account
              </Link>
              <Link href="/login" className="bg-blue-500 hover:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg">
                Log In
              </Link>
            </div>
          ) : (
            <Link href="/portfolio" className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg">
              View My Portfolio
            </Link>
          )}
        </div>
      </div>
      
      {/* Trending Cryptocurrencies */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <FaChartLine className="text-blue-500 mr-2 text-xl" />
          <h2 className="text-2xl font-bold">Trending Cryptocurrencies</h2>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading trending cryptocurrencies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCoins.map(coin => (
              <CoinCard
                key={coin.id}
                coin={coin}
                preferredCurrency={preferredCurrency}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <FaBitcoin className="text-blue-500 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Multiple Cryptocurrencies</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add and monitor all your favorite cryptocurrencies in one place.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <svg className="text-green-500 text-2xl w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Portfolio Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              View detailed analytics and charts of your cryptocurrency portfolio.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <svg className="text-purple-500 text-2xl w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd"></path>
                <path fillRule="evenodd" d="M10 4a1 1 0 100 2 1 1 0 000-2zm0 10a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
                <path fillRule="evenodd" d="M10 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Currencies</h3>
            <p className="text-gray-600 dark:text-gray-400">
              View prices in your preferred currency, including USD, EUR, INR, and more.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      {!user && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Tracking?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Create a free account today and start tracking your cryptocurrency portfolio with Trenches Tracker.
          </p>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg">
            Get Started for Free
          </Link>
        </div>
      )}
    </Layout>
  );
}
