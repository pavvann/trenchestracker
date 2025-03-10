import Image from "next/image";
import { useState } from "react";
import {FaPlus, FaMinus, FaTrash} from 'react-icons/fa'
import {useAuth} from '@/contexts/AuthContext'
import { addCoinToPortfolio, removeCoinFromPortfolio, updateCoinAmount } from "@/lib/db";
import toast from "react-hot-toast";

export default function CoinCard({coin, inPortfolio = false, amount = 0, onUpdate, preferredCurrency = 'usd'}) {
    const {user} = useAuth()
    const [isAdding, setIsAdding] = useState(false)
    const [coinAmount, setCoinAmount] = useState('')

    const formatPrice = (price) => {
        if (price >= 1) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: preferredCurrency.toUpperCase(),
                maximumFractionDigits: 2, 
            }).format(price);
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: preferredCurrency.toUpperCase(),
                maximumFractionDigits: 6, 
            }).format(price);
        }
    };

    const formatPercentage = (percent) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(percent / 100);
    };

    const handleAddCoin = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please log in to add coins to your portfolio");
            return;
        }
        
        // Allow empty or zero amounts for tracking only
        let amountToAdd = 0;
        if (coinAmount && coinAmount.trim() !== '') {
            const parsedAmount = parseFloat(coinAmount);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                toast.error("Please enter a valid amount (or leave empty to just track)");
                return;
            }
            amountToAdd = parsedAmount;
        }
        
        try {
            await addCoinToPortfolio(user.uid, coin.id, amountToAdd);
            
            if (amountToAdd > 0) {
                toast.success(`Added ${amountToAdd} ${coin.symbol.toUpperCase()} to your portfolio`);
            } else {
                toast.success(`Added ${coin.symbol.toUpperCase()} to your portfolio for tracking`);
            }
            
            setCoinAmount('');
            setIsAdding(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error adding coin: ", error);
            toast.error('Failed to add coin to portfolio');
        }
    };

    const handleRemoveCoin = async () => {
        if (!user) return;
        try {
            await removeCoinFromPortfolio(user.uid, coin.id);
            toast.success(`Removed ${coin.symbol.toUpperCase()} from your portfolio`);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error removing coin: ", error);
            toast.error("Failed to remove coin from portfolio");
        }
    };

    // Function to update amount for coins that are just being tracked
    const handleUpdateAmount = async () => {
        if (!user) return;
        setIsAdding(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {coin.image && (
                            <div className="w-10 h-10 mr-3 flex-shrink-0">
                                <img 
                                    src={coin.image} 
                                    alt={`${coin.name} logo`} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-full"
                                />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold">{coin.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">{formatPrice(coin.current_price)}</p>
                        <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercentage(coin.price_change_percentage_24h)} (24h)
                        </p>
                    </div>
                </div>
                
                {inPortfolio && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your holdings:</p>
                                <p className="font-medium">
                                    {parseFloat(amount) > 0 
                                        ? `${amount} ${coin.symbol.toUpperCase()}`
                                        : <span className="text-gray-500">Tracking only</span>
                                    }
                                </p>
                                <p className="font-bold">
                                    {parseFloat(amount) > 0 
                                        ? formatPrice(amount * coin.current_price)
                                        : <span className="text-gray-500">N/A</span>
                                    }
                                </p>
                            </div>
                            <div className="flex">
                                {parseFloat(amount) === 0 && (
                                    <button
                                        onClick={handleUpdateAmount}
                                        className="p-2 mr-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
                                        title="Add amount"
                                    >
                                        <FaPlus />
                                    </button>
                                )}
                                <button
                                    onClick={handleRemoveCoin}
                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                                    title="Remove from portfolio"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {(!inPortfolio && user) || (inPortfolio && isAdding) ? (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {isAdding ? (
                            <form onSubmit={handleAddCoin} className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={coinAmount}
                                    onChange={(e) => setCoinAmount(e.target.value)}
                                    placeholder={`Amount of ${coin.symbol.toUpperCase()} (optional)`}
                                    className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    step="any"
                                    min="0"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    {inPortfolio ? 'Update' : 'Add'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="p-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-2 flex items-center justify-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                            >
                                <FaPlus size={14} />
                                <span>Add to Portfolio</span>
                            </button>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}