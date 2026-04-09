import { useState } from 'react';
import { LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function Auth() {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('E-posta ve şifre gereklidir');
      return;
    }

    const success = login(loginEmail, loginPassword);
    if (success) {
      toast.success('Giriş başarılı!');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      toast.error('E-posta veya şifre hatalı');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    const success = register(registerName, registerEmail, registerPassword);
    if (success) {
      toast.success('Kayıt başarılı!');
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } else {
      toast.error('Bu e-posta adresi zaten kullanımda');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
  };

  // Demo accounts
  const demoAccounts = [
    { email: 'ahmet@example.com', name: 'Ahmet Yılmaz' },
    { email: 'zeynep@example.com', name: 'Zeynep Kaya' },
    { email: 'mehmet@example.com', name: 'Mehmet Demir' },
  ];

  const fillDemoAccount = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('password');
  };

  if (isAuthenticated && user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Çıkış
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Giriş / Kayıt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              <LogIn className="w-4 h-4 mr-2" />
              Giriş
            </TabsTrigger>
            <TabsTrigger value="register">
              <UserPlus className="w-4 h-4 mr-2" />
              Kayıt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Şifre</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Giriş Yap
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Hızlı Demo Girişi:</p>
              <div className="flex flex-wrap gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoAccount(account.email)}
                  >
                    {account.name}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Şifre: password
              </p>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Soyad</Label>
                <Input
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Ali Veli"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Şifre</Label>
                <Input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Kayıt Ol
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
