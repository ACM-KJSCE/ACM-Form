import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../configs/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../configs/firebase";

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const formRef = doc(db, "applications", currentUser.uid);
        const docSnap = await getDoc(formRef);
        if (currentUser.email?.endsWith("somaiya.edu") && docSnap.exists() && docSnap.data()?.submitted) {
          navigate("/success");
        } else if (currentUser.email?.endsWith("somaiya.edu")) {
          navigate("/form");
        } else {
          signOut(auth).then(() => {
            setError("Please use a Somaiya email address (@somaiya.edu)");
          });
        }
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    provider.setCustomParameters({
      prompt: "select_account",
      hd: "somaiya.edu",
      login_hint: "somaiya.edu",
    });

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="p-8  rounded-xl shadow-2xl w-96 border border-gray-700 bg-black/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
            KJSCE ACM Application
          </h1>
          <div className="relative mx-auto mb-8">
            <img
              src="https://kjsce.acm.org/logo_withoutbg.png"
              alt="Somaiya Logo"
              className="w-full h-full object-contain filter drop-shadow-lg "
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center bg-white hover:bg-gray-300 hover:scale-105 cursor-pointer transition-all duration-300 text-gray-900 py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Only @somaiya.edu email addresses are allowed
        </p>
      </div>
    </div>
  );
}

export default Login;
