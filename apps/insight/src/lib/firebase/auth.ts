/**
 * Sign up dengan email dan password
 */
export async function signUp(
    email: string,
    password: string,
    displayName: string
): Promise<UserCredential> {
    if (!email || !password || !displayName) {
        throw new Error('Semua field harus diisi');
    }

    if (!auth || !db) {
        throw new Error(
            'Firebase belum dikonfigurasi. ' +
            'Silakan setup file .env.local dengan kredensial Firebase Anda. ' +
            'Lihat ENV_TEMPLATE.md untuk panduan.'
        );
    }

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });

            // Save user data to Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: email,
                displayName: displayName,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return userCredential;
    } catch (error: any) {
        const errorCode = error.code;
        let errorMessage = 'Terjadi kesalahan saat mendaftar';

        switch (errorCode) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email sudah terdaftar';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Format email tidak valid';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password terlalu lemah (minimal 6 karakter)';
                break;
            default:
                errorMessage = `Pendaftaran gagal: ${error.message}`;
        }

        throw new Error(errorMessage);
    }
}

/**
 * Sign in dengan email dan password
 */
export async function signIn(
    email: string,
    password: string
): Promise<UserCredential> {
    if (!email || !password) {
        throw new Error('Email dan password harus diisi');
    }

    if (!auth) {
        throw new Error(
            'Firebase belum dikonfigurasi. ' +
            'Silakan setup file .env.local dengan kredensial Firebase Anda. ' +
            'Lihat ENV_TEMPLATE.md untuk panduan.'
        );
    }

    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        const errorCode = error.code;
        let errorMessage = 'Terjadi kesalahan saat login';

        switch (errorCode) {
            case 'auth/invalid-email':
                errorMessage = 'Format email tidak valid';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Akun ini telah dinonaktifkan';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Email tidak terdaftar';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Password salah';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Email atau password salah';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti';
                break;
            default:
                errorMessage = `Login gagal: ${error.message}`;
        }

        throw new Error(errorMessage);
    }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
    if (!auth) return;

    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(`Logout gagal: ${error.message}`);
    }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
    if (!auth) return null;
    return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    if (!auth) {
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}

// Backward compatibility
export const signInWithEmail = signIn;
