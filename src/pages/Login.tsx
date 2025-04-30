
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart2, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Si l'utilisateur est déjà authentifié, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'email n'est pas valide";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check for specific error messages
      if (error.message?.includes('Email not confirmed')) {
        setAuthError("Veuillez confirmer votre email avant de vous connecter. Vérifiez que la confirmation d'email est désactivée dans la console Supabase.");
      } else {
        setAuthError("Erreur de connexion. Vérifiez vos identifiants ou réessayez plus tard.");
      }
    }
  };

  // Comptes de démonstration
  const demoAccounts = [
    { role: 'Administrateur', email: 'admin@clinique.fr' },
    { role: 'Secrétaire', email: 'secretaire@clinique.fr' },
    { role: 'Médecin', email: 'medecin@clinique.fr' },
    { role: 'Patient', email: 'patient@clinique.fr' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-clinic-500 rounded-full mb-4">
            <BarChart2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Clinique Santé Connectée</h1>
          <p className="text-gray-600">Connectez-vous pour accéder au système</p>
        </div>
        
        <Card className="shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.fr"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="text-sm text-gray-600 mt-4">
                <p>Comptes de démonstration:</p>
                <div className="mt-2 space-y-1">
                  {demoAccounts.map((account, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{account.role}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">{account.email}</span>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="h-auto p-0 pl-2 text-xs text-clinic-500"
                          onClick={() => {
                            setEmail(account.email);
                            setPassword('password');
                          }}
                        >
                          Utiliser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Le mot de passe pour tous les comptes est: <strong>password</strong>
                </p>
                
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Information importante</AlertTitle>
                  <AlertDescription>
                    Pour que la connexion fonctionne, assurez-vous que l'option "Confirm email" est désactivée dans les paramètres d'authentification de Supabase.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-clinic-500 hover:bg-clinic-600" 
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
