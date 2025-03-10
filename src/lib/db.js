import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDocs,
    updateDoc,
    deleteDocs,
    query,
    where,
    arrayRemove,
    arrayUnion
} from 'firebase/firestore'

import {db} from './firebase'

export const createUserProfile = async(uid,data) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            ...data,
            createdAt: new Date().toISOString(),
            preferredCurrency: 'usd',
            coins: []
        })
        return true
    } catch (error) {
        console.error("error creating user profile: ", error)
        return false 
    }
}

export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {id: docSnap.id, ...docSnap.data()}
        } else {
            return null
        }
    } catch (error) {
        console.error("error getting user profile: ", error) 
        return null;
    }
};

export const updateUserProfile = async(uid, data) => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            // Update existing document
            await updateDoc(userRef, data);
        } else {
            // Create new document if it doesn't exist
            await setDoc(userRef, {
                ...data,
                createdAt: new Date().toISOString(),
                preferredCurrency: 'usd',
                coins: []
            });
        }
        return true;
    } catch (error) {
        console.error("error updating user profile: ", error);
        return false;
    }
};

export const addCoinToPortfolio = async (uid, coinId, amount = 0) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // Create user profile if it doesn't exist
            await setDoc(userRef, {
                createdAt: new Date().toISOString(),
                preferredCurrency: 'usd',
                coins: [{ id: coinId, amount: parseFloat(amount), addedAt: new Date().toISOString() }]
            });
            return true;
        }
        
        const userData = userDoc.data();

        if (userData.coins && userData.coins.some(coin => coin.id === coinId)) {
            // Update existing coin
            const updatedCoins = userData.coins.map(coin => {
                if (coin.id === coinId) {
                    return { ...coin, amount: parseFloat(coin.amount) + parseFloat(amount) };
                }
                return coin;
            });
            
            await updateDoc(userRef, { coins: updatedCoins });
        } else {
            // Add new coin
            await updateDoc(userRef, {
                coins: arrayUnion({ id: coinId, amount: parseFloat(amount), addedAt: new Date().toISOString() })
            });
        }
        
        return true;
    } catch (error) {
        console.error("Error adding coin to portfolio: ", error);
        return false;
    }
};

export const updateCoinAmount = async (uid, coinId, amount) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // Create user profile with the coin if it doesn't exist
            await setDoc(userRef, {
                createdAt: new Date().toISOString(),
                preferredCurrency: 'usd',
                coins: [{ id: coinId, amount: parseFloat(amount), addedAt: new Date().toISOString() }]
            });
            return true;
        }
        
        const userData = userDoc.data();
        
        if (!userData.coins) {
            // If coins array doesn't exist, create it with the new coin
            await updateDoc(userRef, {
                coins: [{ id: coinId, amount: parseFloat(amount), addedAt: new Date().toISOString() }]
            });
            return true;
        }
        
        // Update the specific coin
        const updatedCoins = userData.coins.map(coin => {
            if (coin.id === coinId) {
                return { ...coin, amount: parseFloat(amount) };
            }
            return coin;
        });
        
        await updateDoc(userRef, { coins: updatedCoins });
        return true;
    } catch (error) {
        console.error('Error updating coin amount:', error);
        return false;
    }
};

export const removeCoinFromPortfolio = async (uid, coinId) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // If user profile doesn't exist, there's nothing to remove
            return true;
        }
        
        const userData = userDoc.data();

        if (!userData.coins) return true;

        const updatedCoins = userData.coins.filter(coin => coin.id !== coinId);
        await updateDoc(userRef, { coins: updatedCoins });
        return true;
    } catch (error) {
        console.error('Error removing coin from portfolio:', error);
        return false;
    }
};

export const updatePreferredCurrency = async (uid, currency) => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            // Update existing document
            await updateDoc(userRef, { preferredCurrency: currency });
        } else {
            // Create new document if it doesn't exist
            await setDoc(userRef, {
                preferredCurrency: currency,
                createdAt: new Date().toISOString(),
                coins: []
            });
        }
        return true;
    } catch (error) {
        console.error("error updating preferred currency: ", error);
        return false;
    }
};