import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">🔐</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          </div>
          
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}