import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { School } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password);
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>تسجيل الدخول - نظام إدارة شؤون العاملين</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto bg-card border-border">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  {/* <School className="h-8 w-8 text-primary-foreground" /> */}
                  <img className="h-14 w-14" src="/image/logo.jpg" alt="logo" />
                  </div>
                <CardTitle className="text-2xl">نظام إدارة شؤون العاملين</CardTitle>
              </div>
              <CardDescription>
                الرجاء تسجيل الدخول للمتابعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                  {/* <TabsTrigger value="signup">إنشاء حساب</TabsTrigger> */}
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn}>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-in">البريد الإلكتروني</Label>
                        <Input id="email-in" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-in">كلمة المرور</Label>
                        <Input id="password-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp}>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-up">البريد الإلكتروني</Label>
                        <Input id="email-up" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-up">كلمة المرور</Label>
                        <Input id="password-up" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'جاري الإنشاء...' : 'إنشاء حساب جديد'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;