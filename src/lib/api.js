import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

// Create an axios instance with rate limiting protection and API key
const coinGeckoApi = axios.create({
    baseURL: API_URL,
});

// Add request interceptor to include API key in all requests if available
coinGeckoApi.interceptors.request.use(
    config => {
        // Add API key to all requests if available
        if (API_KEY) {
            config.headers = {
                ...config.headers,
                'x-cg-demo-api-key': API_KEY
            };
        }
        return config;
    },
    error => Promise.reject(error)
);

// Add response interceptor to handle rate limiting
coinGeckoApi.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 429) {
            toast.error('Rate limit exceeded. Please try again in a moment.');
            console.error('CoinGecko API rate limit exceeded');
        }
        return Promise.reject(error);
    }
);

export const getTrendingCoins = async (currency = 'usd') => {
    try {
        const {data} = await coinGeckoApi.get('/coins/markets', {
            params: {
                vs_currency: currency,
                order: 'market_cap_desc',
                per_page: 10,
                page: 1,
                sparkline: false,
            },
        });
        return data;
    } catch (error) {
        console.error('Error while fetching trending coins: ', error)
        return [];
    }
};


export const getCoinData = async(id, currency = 'usd') => {
    try {
        const {data} = await coinGeckoApi.get(`/coins/${id}`);
        return data;
    } catch (error) {
        console.error(`Error fetching data for coin ${id}: ${error}`);
        return null;
    }
};


export const getMultipleCoinsData = async(ids, currency = 'usd') => {
    try {
        const {data} = await coinGeckoApi.get('/coins/markets', {
            params: {
                vs_currency: currency,
                ids: ids.join(','),
                order: 'market_cap_desc',
                per_page: 100,
                page: 1,
                sparkline: false
            },
        });
        return data;
    } catch (error) {
        console.error("Error while fetching multiple coins data: ", error);
        return [];
    }
};


export const getSupportedCurrencies = async () => {
    try {
        const {data} = await coinGeckoApi.get('/simple/supported_vs_currencies');
        return data;
    } catch (error) {
        console.error("Error fetching supported currencies: ", error);
        return ['usd', 'eur', 'inr', 'gbp', 'jpy'];
    }
};

export const searchCoins = async (query) => {
    try {
        const {data} = await coinGeckoApi.get('/search', {
            params: {
                query
            },
        });
        return data.coins.slice(0,10);
    } catch (error) {
        console.error("Error searching coins: ", error);
        return [];
    }
};
