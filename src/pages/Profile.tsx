
import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Shield, Edit, LogOut, Save, Camera, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  // Mock user data - in a real app, this would come from your auth system
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    voterId: 'VID2025042189',
    registrationDate: 'April 1, 2025',
    hasVoted: true,
    profileImage: '/lovable-uploads/3b40358e-fcb4-4f00-a793-d500b39c474d.png'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(user.name);
    setEditedEmail(user.email);
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload this file to your server or cloud storage
    // For this demo, we'll simulate an upload with a delay
    setIsChangingPhoto(true);
    setIsLoading(true);
    
    setTimeout(() => {
      // Create a local URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setUser({
        ...user,
        profileImage: imageUrl
      });
      setIsChangingPhoto(false);
      setIsLoading(false);
      
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been successfully updated.",
      });
    }, 1500);
  };

  const handleSave = () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      toast({
        title: "Error",
        description: "Name and email cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setUser({
        ...user,
        name: editedName,
        email: editedEmail
      });
      
      setIsEditing(false);
      setIsLoading(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSignOut = () => {
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    // In a real app, this would redirect to login page
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleProfilePhotoClick}>
                  {isChangingPhoto ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                {isEditing && (
                  <div 
                    className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/80"
                    onClick={handleProfilePhotoClick}
                  >
                    <Camera size={16} />
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <CardTitle className="text-center">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    variant="default" 
                    className="w-full flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline" className="w-full flex items-center gap-2">
                  <Edit size={16} />
                  Edit Profile
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 text-destructive"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Voting Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Profile" : "Voting Information"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={editedName} 
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={editedEmail} 
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Voter ID</span>
                    <span className="font-medium">{user.voterId}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Registration Date</span>
                    <span className="font-medium">{user.registrationDate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Voting Status</span>
                    <span className="font-medium flex items-center gap-2">
                      {user.hasVoted ? (
                        <>
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          Voted
                        </>
                      ) : (
                        <>
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                          Not Voted
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Shield size={16} />
                      <span className="text-sm font-medium">Your vote is secured by blockchain technology</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
