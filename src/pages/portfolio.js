import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import CoinCard from '@/components/CoinCard';
import CoinSearch from '@/components/CoinSearch';
import PortfolioSummary from '@/components/PortfolioSummary';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, addCoinToPortfolio } from '@/lib/db';
import { getMultipleCoinsData, getCoinData } from '@/lib/api';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Portfolio() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [portfolioCoins, setPortfolioCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCoin, setShowAddCoin] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user profile and portfolio data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        
        if (profile && profile.coins && profile.coins.length > 0) {
          // Get coin IDs from user profile
          const coinIds = profile.coins.map(coin => coin.id);
          
          // Fetch current data for all coins
          const coinsData = await getMultipleCoinsData(coinIds, profile.preferredCurrency || 'usd');
          
          // Merge user's amount data with coin data
          const portfolioData = coinsData.map(coinData => {
            const userCoin = profile.coins.find(c => c.id === coinData.id);
            return {
              ...coinData,
              amount: userCoin ? userCoin.amount : 0
            };
          });
          
          setPortfolioCoins(portfolioData);
        } else {
          setPortfolioCoins([]);
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Handle adding a new coin from search
  const handleAddCoin = async (coin) => {
    try {
      if (!user) {
        toast.error('Please log in to add coins to your portfolio');
        return;
      }
      
      // Use a default currency if userProfile is null
      const preferredCurrency = userProfile?.preferredCurrency || 'usd';
      
      // Get full coin data from API
      const coinData = await getCoinData(coin.id, preferredCurrency);
      
      if (!coinData) {
        toast.error('Failed to fetch coin data');
        return;
      }
      
      // Check if coin is already in portfolio
      const existingCoin = portfolioCoins.find(c => c.id === coin.id);
      
      if (existingCoin) {
        toast.error(`${coin.name} is already in your portfolio`);
        return;
      }
      
      // Add coin to UI temporarily (will be properly added when user inputs amount)
      const newCoin = {
        id: coinData.id,
        name: coinData.name,
        symbol: coinData.symbol,
        image: coinData.image?.small,
        current_price: coinData.market_data?.current_price?.[preferredCurrency] || 0,
        price_change_percentage_24h: coinData.market_data?.price_change_percentage_24h || 0,
      };
      
      // Add coin to portfolio with zero amount (for tracking only)
      await addCoinToPortfolio(user.uid, coin.id, 0);
      
      setPortfolioCoins(prev => [...prev, newCoin]);
      setShowAddCoin(false);
      toast.success(`${coin.name} added to your portfolio for tracking`);
      
      // Refresh portfolio to get updated data
      refreshPortfolio();
    } catch (error) {
      console.error('Error adding coin:', error);
      toast.error('Failed to add coin to portfolio');
    }
  };

  // Refresh portfolio data
  const refreshPortfolio = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      if (profile && profile.coins && profile.coins.length > 0) {
        const coinIds = profile.coins.map(coin => coin.id);
        const coinsData = await getMultipleCoinsData(coinIds, profile.preferredCurrency || 'usd');
        
        const portfolioData = coinsData.map(coinData => {
          const userCoin = profile.coins.find(c => c.id === coinData.id);
          return {
            ...coinData,
            amount: userCoin ? userCoin.amount : 0
          };
        });
        
        setPortfolioCoins(portfolioData);
      } else {
        setPortfolioCoins([]);
      }
      
      toast.success('Portfolio refreshed');
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
      toast.error('Failed to refresh portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || (user && isLoading)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your portfolio...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">My Portfolio</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={refreshPortfolio}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
          <button
            onClick={() => setShowAddCoin(!showAddCoin)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
          >
            <FaPlus className="mr-2" />
            Add Coin
          </button>
        </div>
      </div>
      
      {showAddCoin && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Add Cryptocurrency</h2>
          <CoinSearch onSelectCoin={handleAddCoin} />
        </div>
      )}
      
      <div className="mb-8">
        <PortfolioSummary 
          coins={portfolioCoins} 
          preferredCurrency={userProfile?.preferredCurrency || 'usd'} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioCoins.length > 0 ? (
          portfolioCoins.map(coin => (
            <CoinCard
              key={coin.id}
              coin={coin}
              inPortfolio={true}
              amount={coin.amount}
              onUpdate={refreshPortfolio}
              preferredCurrency={userProfile?.preferredCurrency || 'usd'}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't added any cryptocurrencies to your portfolio yet.
            </p>
            <button
              onClick={() => setShowAddCoin(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Your First Coin
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}