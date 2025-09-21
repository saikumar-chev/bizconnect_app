import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { User } from '@/types';

// Simple JWT decoder to extract user info from Google's credential response
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
}

export function useAuth(allUsers: User[]) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Effect to restore user from local storage on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem('bizconnect_user');
        if (storedUser && allUsers.length > 0) {
            const parsedUser: { email: string } = JSON.parse(storedUser);
            // Find the full, fresh user object from the fetched data using the stored email.
            const freshUser = allUsers.find(u => u.email === parsedUser.email);

            if (freshUser) {
                setCurrentUser(freshUser);
                // Also, update localStorage with the fresh data to prevent future mismatches.
                localStorage.setItem('bizconnect_user', JSON.stringify(freshUser));
            } else {
                // If the user from localStorage doesn't exist in the database, log them out.
                localStorage.removeItem('bizconnect_user');
            }
        }
    }, [allUsers]); // This runs once allUsers are loaded

    const onLogin = useCallback(async (credentialResponse: any) => {
        const decodedToken = decodeJwt(credentialResponse.credential);
        if (!decodedToken) return;
        const { name, email, picture } = decodedToken;

        const { data: existingUserData } = await supabase.from('users').select('*').eq('email', email).single();

        const { data: upsertedUserData, error: upsertError } = await supabase.from('users').upsert({
            id: existingUserData?.id,
            name: name,
            email: email,
            avatarurl: picture,
            bio: existingUserData?.bio || '',
        }, { onConflict: 'email' }).select().single();

        if (upsertError) {
            console.error(`Failed to save user data: ${upsertError.message}`);
            return;
        }

        const loggedInUser: User = {
            userId: upsertedUserData.id,
            name: upsertedUserData.name,
            email: upsertedUserData.email,
            avatarUrl: upsertedUserData.avatarurl,
            bio: upsertedUserData.bio || ''
        };

        setCurrentUser(loggedInUser);
        localStorage.setItem('bizconnect_user', JSON.stringify(loggedInUser));
    }, []);

    return { currentUser, setCurrentUser, onLogin };
}