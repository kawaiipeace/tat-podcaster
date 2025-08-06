'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function UserInitializer() {
  const { user } = useUser();
  const existingUser = useQuery(api.users.getUserById, {
    clerkId: user?.id || "",
  });
  const createUser = useMutation(api.users.createUserFromClerk);

  useEffect(() => {
    if (user && existingUser === null) {
      // User is signed in but doesn't exist in Convex, create them
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl || "",
        name: user.firstName || user.fullName || "User",
      }).catch((error) => {
        console.log('Error creating user:', error);
      });
    }
  }, [user, existingUser, createUser]);

  return null; // This component doesn't render anything
}
