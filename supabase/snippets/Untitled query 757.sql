 UPDATE auth.users                                                          
 SET email_confirmed_at = now()                                             
 WHERE email = 'knytrydr@outlook.com';
SELECT id, email, email_confirmed_at FROM auth.users;