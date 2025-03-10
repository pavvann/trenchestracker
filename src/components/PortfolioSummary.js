import { useState, useEffect } from 'react';
import { FaChartLine, FaChartPie, FaExchangeAlt } from 'react-icons/fa';

export default function PortfolioSummary({ coins, preferredCurrency = 'usd' }) {
  const [totalValue, setTotalValue] = useState(0);
  const [topCoin, setTopCoin] = useState(null);
  const [trackedCoins, setTrackedCoins] = useState(0);
  const [valuedCoins, setValuedCoins] = useState(0);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferredCurrency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Calculate portfolio summary
  useEffect(() => {
    if (!coins || coins.length === 0) {
      setTotalValue(0);
      setTopCoin(null);
      setTrackedCoins(0);
      setValuedCoins(0);
      return;
    }
    
    // Count coins with and without amounts
    let tracked = 0;
    let valued = 0;
    
    // Calculate total value (only for coins with amounts > 0)
    const total = coins.reduce((sum, coin) => {
      const amount = parseFloat(coin.amount) || 0;
      
      if (amount > 0) {
        valued++;
        return sum + (coin.current_price * amount);
      } else {
        tracked++;
        return sum;
      }
    }, 0);
    
    setTotalValue(total);
    setTrackedCoins(tracked);
    setValuedCoins(valued);
    
    // Find top coin by value (only consider coins with amounts > 0)
    let highestValue = 0;
    let highestCoin = null;
    
    coins.forEach(coin => {
      const amount = parseFloat(coin.amount) || 0;
      if (amount > 0) {
        const value = coin.current_price * amount;
        if (value > highestValue) {
          highestValue = value;
          highestCoin = {
            ...coin,
            value,
            percentage: (value / total) * 100
          };
        }
      }
    });
    
    setTopCoin(highestCoin);
  }, [coins]);
  
  if (!coins || coins.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <FaChartPie className="mx-auto text-gray-400 text-4xl mb-4" />
        <h3 className="text-xl font-semibold mb-2">No coins in portfolio</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Add cryptocurrencies to your portfolio to see your summary here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Portfolio Summary</h3>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <FaExchangeAlt className="mr-1" />
          <span>{preferredCurrency.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FaChartLine className="text-blue-500 mr-2" />
            <h4 className="text-lg font-medium">Total Value</h4>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Across {valuedCoins} {valuedCoins === 1 ? 'cryptocurrency' : 'cryptocurrencies'}
          </p>
        </div>
        
        {topCoin && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaChartPie className="text-green-500 mr-2" />
              <h4 className="text-lg font-medium">Largest Holding</h4>
            </div>
            <div className="flex items-center">
              {topCoin.image && (
                <img 
                  src={topCoin.image} 
                  alt={`${topCoin.name} logo`} 
                  className="w-6 h-6 mr-2 rounded-full"
                />
              )}
              <p className="text-xl font-bold">{topCoin.name}</p>
            </div>
            <div className="mt-1 flex justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(topCoin.value)}
              </p>
              <p className="text-sm font-medium">
                {topCoin.percentage.toFixed(1)}% of portfolio
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-medium mb-3">Asset Allocation</h4>
        
        {trackedCoins > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Note:</span> You have {trackedCoins} {trackedCoins === 1 ? 'coin' : 'coins'} that {trackedCoins === 1 ? 'is' : 'are'} being tracked without amounts. These are not included in the asset allocation.
            </p>
          </div>
        )}
        
        {valuedCoins > 0 ? (
          <>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {coins
                .filter(coin => parseFloat(coin.amount) > 0)
                .map((coin, index) => {
                  const amount = parseFloat(coin.amount) || 0;
                  const percentage = amount > 0 ? ((coin.current_price * amount) / totalValue) * 100 : 0;
                  
                  // Generate a color based on index
                  const colors = [
                    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
                    'bg-red-500', 'bg-purple-500', 'bg-pink-500',
                    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
                  ];
                  const color = colors[index % colors.length];
                  
                  return percentage > 0 ? (
                    <div
                      key={coin.id}
                      className={`h-full ${color} inline-block`}
                      style={{ width: `${percentage}%` }}
                      title={`${coin.name}: ${percentage.toFixed(1)}%`}
                    ></div>
                  ) : null;
                })}
            </div>
            
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {coins
                .filter(coin => parseFloat(coin.amount) > 0)
                .map((coin, index) => {
                  const amount = parseFloat(coin.amount) || 0;
                  const percentage = amount > 0 ? ((coin.current_price * amount) / totalValue) * 100 : 0;
                  
                  const colors = [
                    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
                    'bg-red-500', 'bg-purple-500', 'bg-pink-500',
                    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={coin.id} className="flex items-center text-sm">
                      <div className={`w-3 h-3 ${color} rounded-full mr-1`}></div>
                      <span className="truncate">{coin.symbol.toUpperCase()}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </>
        ) : (
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              No coins with amounts to display in asset allocation.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add amounts to your tracked coins to see allocation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}