
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseFaceVerificationProps {
  onVerified: () => void;
}

export function useFaceVerification({ onVerified }: UseFaceVerificationProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch the user's registered face image when component mounts
  useEffect(() => {
    const fetchUserFace = async () => {
      if (!user?.id) return;
      
      try {
        // Try to fetch the user's face from profile or registration data
        const { data, error } = await supabase
          .from('user_biometrics')
          .select('face_image_url')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user face image:', error);
          return;
        }
        
        if (data?.face_image_url) {
          setReferenceImage(data.face_image_url);
          console.log('Loaded reference face image for comparison');
        } else {
          console.warn('No reference face image found for this user');
        }
      } catch (err) {
        console.error('Error in fetchUserFace:', err);
      }
    };
    
    fetchUserFace();
  }, [user]);

  // Capture image from webcam
  const captureImage = (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas elements not available');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Could not get canvas context');
      return;
    }
    
    console.log('Capturing image from video:', video.videoWidth, 'x', video.videoHeight);
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setIsCaptured(true);
    
    // Verify the captured face against the reference image
    verifyFace(canvas.toDataURL('image/jpeg'));
  };
  
  // Verify facial image against the user's registered face
  const verifyFace = (capturedImageData: string) => {
    setIsVerifying(true);
    
    // Check if we have a reference image to compare against
    if (!referenceImage && user) {
      toast({
        title: "Reference Image Missing",
        description: "No reference face image found. Please complete registration first.",
        variant: "destructive",
      });
      
      setVerificationStatus('error');
      setTimeout(() => {
        setIsCaptured(false);
        setIsVerifying(false);
        setVerificationStatus('idle');
      }, 2000);
      return;
    }
    
    // In a real implementation, we would now send both images to the backend
    // for comparison using facial recognition algorithms
    
    // For this demo, we will call a simulated API endpoint
    simulateFaceComparison(capturedImageData, referenceImage)
      .then(result => {
        if (result.verified) {
          setVerificationStatus('success');
          toast({
            title: "Face Verified",
            description: "Your identity has been successfully verified.",
          });
          
          // Call the onVerified callback after a short delay
          setTimeout(() => {
            onVerified();
          }, 1500);
        } else {
          setVerificationStatus('error');
          toast({
            title: "Verification Failed",
            description: "Face doesn't match our records. Please try again.",
            variant: "destructive",
          });
          
          // Reset to try again
          setTimeout(() => {
            setIsCaptured(false);
            setIsVerifying(false);
            setVerificationStatus('idle');
          }, 2000);
        }
      })
      .catch(error => {
        console.error('Face verification error:', error);
        setVerificationStatus('error');
        toast({
          title: "Verification Error",
          description: "An error occurred during face verification. Please try again.",
          variant: "destructive",
        });
        
        // Reset to try again
        setTimeout(() => {
          setIsCaptured(false);
          setIsVerifying(false);
          setVerificationStatus('idle');
        }, 2000);
      });
  };
  
  // This function simulates a backend face comparison API
  // In a real implementation, this would be an API call to a backend service
  const simulateFaceComparison = async (capturedImage: string, referenceImage: string | null): Promise<{verified: boolean, confidence: number}> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // For demo purposes:
        // If user has a reference image, use higher verification threshold (more secure)
        // If no reference image, use the original 80% success rate for demo
        if (referenceImage) {
          // In a real implementation, this would use actual face comparison algorithms
          // Here we're just checking if the user has completed registration (has a reference image)
          // For demo, we'll use a 70% success rate to show some failed attempts
          const isSuccess = Math.random() < 0.7;
          resolve({ 
            verified: isSuccess,
            confidence: isSuccess ? 0.8 + Math.random() * 0.15 : 0.5 + Math.random() * 0.2
          });
        } else {
          // Original demo behavior (80% success)
          const isSuccess = Math.random() < 0.8;
          resolve({ 
            verified: isSuccess,
            confidence: isSuccess ? 0.7 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3
          });
        }
      }, 3000);
    });
  };
  
  // Retry face verification
  const retryCapture = () => {
    setIsCaptured(false);
    setVerificationStatus('idle');
  };

  return {
    isCaptured,
    isVerifying,
    verificationStatus,
    captureImage,
    retryCapture,
    hasReferenceImage: !!referenceImage
  };
}

